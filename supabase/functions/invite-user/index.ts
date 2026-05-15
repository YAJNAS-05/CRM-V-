import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    const { email, full_name, role_ids, department } = await req.json();

    if (!email || !Array.isArray(role_ids) || role_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "email and role_ids are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: actorData, error: actorError } = token
      ? await supabaseAdmin.auth.getUser(token)
      : { data: null, error: null };

    if (!token || actorError || !actorData?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: missing or invalid bearer token" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const actorAuthId = actorData.user.id;

    const { data: actorAppUser, error: actorAppUserError } = await supabaseAdmin
      .from("app_users")
      .select("id, org_id")
      .eq("auth_id", actorAuthId)
      .maybeSingle();

    if (actorAppUserError || !actorAppUser?.id || !actorAppUser?.org_id) {
      return new Response(
        JSON.stringify({ error: "Inviter must belong to an organization" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data: actorRoles, error: actorRolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role:roles(name)")
      .eq("user_id", actorAppUser.id);

    if (actorRolesError) {
      return new Response(
        JSON.stringify({ error: "Unable to validate inviter permissions" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const roleNames = (actorRoles || [])
      .map((r: any) => r?.role?.name)
      .filter((name: unknown): name is string => typeof name === "string");

    const isOrgAdmin = roleNames.includes("SUPER_ADMIN") || roleNames.includes("ADMIN");
    if (!isOrgAdmin) {
      return new Response(
        JSON.stringify({ error: "Only admin users can invite users" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data: assignableRoles, error: assignableRolesError } = await supabaseAdmin
      .from("roles")
      .select("id, org_id, is_system_role")
      .in("id", role_ids);

    if (assignableRolesError) {
      return new Response(
        JSON.stringify({ error: "Unable to validate role assignments" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const validRoleIds = (assignableRoles || [])
      .filter((role: any) => {
        const isGlobalSystemRole = role?.org_id == null && role?.is_system_role === true;
        const isOrgRole = role?.org_id === actorAppUser.org_id;
        return isGlobalSystemRole || isOrgRole;
      })
      .map((role: any) => role.id);

    const unauthorizedRoleSelected = role_ids.some((roleId: string) => !validRoleIds.includes(roleId));
    if (unauthorizedRoleSelected) {
      return new Response(
        JSON.stringify({ error: "One or more selected roles are outside your organization" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data: invite, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        org_id: actorAppUser.org_id,
        invited_by_auth_id: actorAuthId,
      },
    });
    if (inviteError || !invite?.user?.id) {
      return new Response(
        JSON.stringify({ error: inviteError?.message || "Failed to invite user" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const userId = invite.user.id;
    const trimmedName = (full_name || "").trim();
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "Invited";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";

    const { data: appUserData, error: profileError } = await supabaseAdmin
      .from("app_users")
      .upsert(
        {
          auth_id: userId,
          org_id: actorAppUser.org_id,
          email,
          first_name: firstName,
          last_name: lastName,
          full_name: trimmedName || `${firstName} ${lastName}`,
          office_location: department || "MAIN_OFFICE",
          updated_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "auth_id" },
      )
      .select("id")
      .single();

    if (profileError || !appUserData?.id) {
      return new Response(JSON.stringify({ error: profileError?.message || "Failed to upsert app user" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const appUserId = appUserData.id;

    const roleInserts = validRoleIds.map((role_id: string) => ({
      user_id: appUserId,
      role_id,
      assigned_at: new Date().toISOString(),
    }));

    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(roleInserts, {
      onConflict: "user_id,role_id",
      ignoreDuplicates: true,
    });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: actorAppUser.id,
      action: "invite_user",
      target_type: "user",
      target_id: appUserId,
      metadata: {
        email,
        role_ids,
        department,
        auth_user_id: userId,
        org_id: actorAppUser.org_id,
        invited_by_auth_id: actorAuthId,
      },
    });

    return new Response(JSON.stringify({ success: true, user_id: appUserId, auth_user_id: userId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
