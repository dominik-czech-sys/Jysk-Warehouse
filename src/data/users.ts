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
  | "help_posts:manage"
  | "task:view"
  | "task:create"
  | "task:update"
  | "task:delete"
  | "audit:manage_templates"
  | "audit:perform"
  | "audit:view_results"
  | "announcement:manage";

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

export const allPermissions: Permission[] = [
  "user:view", "user:create", "user:update", "user:delete",
  "store:view", "store:create", "store:update", "store:delete",
  "rack:view", "rack:create", "rack:update", "rack:delete",
  "article:view", "article:create", "article:update", "article:delete",
  "article:scan", "article:mass_add", "article:transfer", "article:copy_from_store",
  "log:view",
  "default_articles:manage",
  "help_posts:manage",
  "task:view", "task:create", "task:update", "task:delete",
  "audit:manage_templates", "audit:perform", "audit:view_results",
  "announcement:manage",
];

export const permissionDescriptions: Record<Permission, string> = {
  "user:view": "permission.user.view",
  "user:create": "permission.user.create",
  "user:update": "permission.user.update",
  "user:delete": "permission.user.delete",
  "store:view": "permission.store.view",
  "store:create": "permission.store.create",
  "store:update": "permission.store.update",
  "store:delete": "permission.store.delete",
  "rack:view": "permission.rack.view",
  "rack:create": "permission.rack.create",
  "rack:update": "permission.rack.update",
  "rack:delete": "permission.rack.delete",
  "article:view": "permission.article.view",
  "article:create": "permission.article.create",
  "article:update": "permission.article.update",
  "article:delete": "permission.article.delete",
  "article:scan": "permission.article.scan",
  "article:mass_add": "permission.article.massAdd",
  "article:transfer": "permission.article.transfer",
  "log:view": "permission.log.view",
  "default_articles:manage": "permission.defaultArticles.manage",
  "article:copy_from_store": "permission.article.copyFromStore",
  "help_posts:manage": "permission.helpPosts.manage",
  "task:view": "permission.task.view",
  "task:create": "permission.task.create",
  "task:update": "permission.task.update",
  "task:delete": "permission.task.delete",
  "audit:manage_templates": "permission.audit.manage_templates",
  "audit:perform": "permission.audit.perform",
  "audit:view_results": "permission.audit.view_results",
  "announcement:manage": "permission.announcement.manage",
};