export type Permission =
  | "user:view"
  | "user:create"
  | "user:update"
  | "user:delete"
  | "store:view"
  | "store:create"
  | "store:update"
  | "store:delete"
  | "rack:view"
  | "rack:create"
  | "rack:update"
  | "rack:delete"
  | "article:view"
  | "article:create"
  | "article:update"
  | "article:delete"
  | "article:scan"
  | "article:mass_add"
  | "article:transfer"
  | "log:view"
  | "default_articles:manage"
  | "article:copy_from_store"
  | "help_posts:manage";

export interface User {
  id?: string;
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: "admin" | "vedouci_skladu" | "store_manager" | "deputy_store_manager" | "ar_assistant_of_sale" | "skladnik";
  storeId?: string;
  permissions: Permission[];
  firstLogin: boolean;
  email?: string;
}

export const defaultPermissions: Record<User['role'], Permission[]> = {
  "admin": [
    "user:view", "user:create", "user:update", "user:delete",
    "store:view", "store:create", "store:update", "store:delete",
    "rack:view", "rack:create", "rack:update", "rack:delete",
    "article:view", "article:create", "article:update", "article:delete", "article:scan", "article:mass_add", "article:transfer",
    "log:view",
    "default_articles:manage",
    "article:copy_from_store",
    "help_posts:manage",
  ],
  "vedouci_skladu": [
    "user:view", "user:create", "user:update", "user:delete",
    "rack:view", "rack:create", "rack:update", "rack:delete",
    "article:view", "article:create", "article:update", "article:delete", "article:scan", "article:mass_add", "article:transfer",
    "log:view",
    "article:copy_from_store",
  ],
  "store_manager": [
    "user:view", "user:update",
    "rack:view", "rack:update",
    "article:view", "article:create", "article:update", "article:scan", "article:mass_add", "article:transfer",
    "log:view",
  ],
  "deputy_store_manager": [
    "rack:view",
    "article:view", "article:create", "article:update", "article:scan", "article:mass_add",
  ],
  "ar_assistant_of_sale": [
    "article:view", "article:scan",
  ],
  "skladnik": [
    "article:view", "article:scan", "article:mass_add", "article:create", "article:update",
    "rack:view",
  ],
};