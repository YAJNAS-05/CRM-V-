export const MODULES = ["pm", "finance", "hr", "fieldwork", "crm", "admin"] as const;
export const ACTIONS = ["view", "create", "edit", "delete", "approve", "assign", "export"] as const;

export type MatrixModule = (typeof MODULES)[number];
export type MatrixAction = (typeof ACTIONS)[number];

const allowedMap: Record<MatrixModule, MatrixAction[]> = {
  admin: ["view", "create", "edit", "delete"],
  pm: ["view", "create", "edit", "delete", "assign", "export"],
  finance: ["view", "create", "edit", "delete", "approve", "export"],
  hr: ["view", "create", "edit", "delete", "approve", "export"],
  fieldwork: ["view", "create", "edit", "delete", "assign", "export"],
  crm: ["view", "create", "edit", "delete", "assign", "export"],
};

export function isActionSupported(module: MatrixModule, action: MatrixAction): boolean {
  return allowedMap[module].includes(action);
}
