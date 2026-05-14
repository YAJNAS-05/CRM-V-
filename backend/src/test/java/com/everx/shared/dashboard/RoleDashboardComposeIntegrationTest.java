package com.everx.shared.dashboard;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "SUPABASE_URL=http://localhost",
        "SUPABASE_SERVICE_ROLE_KEY=test-service-role-key"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RoleDashboardComposeIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(
            username = "manager@everx.com",
            authorities = {"ROLE_ADMIN", "FINANCE_VIEW", "HR_VIEW", "DASHBOARD_OPERATIONS_VIEW"}
    )
    void composeDashboard_usesAuthoritiesWhenRolesNotProvided() throws Exception {
        mockMvc.perform(get("/api/v1/dashboards/compose"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.scope").value("TEAM"))
                .andExpect(jsonPath("$.data.roles[0]").value("ADMIN"))
                .andExpect(jsonPath("$.data.widgets").isArray())
                .andExpect(jsonPath("$.data.widgets.length()").isNumber());
    }

    @Test
    @WithMockUser(
            username = "analyst@everx.com",
            authorities = {"ROLE_ADMIN", "FINANCE_VIEW"}
    )
    void composeDashboard_prefersExplicitRolesParameter() throws Exception {
        mockMvc.perform(get("/api/v1/dashboards/compose").param("roles", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.scope").value("SELF"))
                .andExpect(jsonPath("$.data.roles[0]").value("EMPLOYEE"));
    }
}
