import { Article } from "@/data/articles"; // Import Article type

export type Permission =
  | "user:view"
  | "user:create"
  | "user:update"
  | "user:delete"
  | "store:view" // New permission for viewing stores
  | "store:create" // New permission for creating stores
  | "store:update" // New permission for updating stores
  | "store:delete" // New permission for deleting stores
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
  | "log:view"
  | "default_articles:manage" // New permission for managing default articles
  | "article:copy_from_store"; // New permission for copying articles from other stores

export interface User {
  username: string;
  password: string; // This will now store hashed passwords
  role: "admin" | "vedouci_skladu" | "store_manager" | "deputy_store_manager" | "ar_assistant_of_sale" | "skladnik"; // admin or store-specific roles
  storeId?: string; // Which store this user belongs to
  permissions: Permission[]; // Array of specific permissions
  firstLogin: boolean; // New field to track if it's the user's first login
}

// Default permissions for each role
export const defaultPermissions: Record<User['role'], Permission[]> = {
  "admin": [
    "user:view", "user:create", "user:update", "user:delete",
    "store:view", "store:create", "store:update", "store:delete",
    "rack:view", "rack:create", "rack:update", "rack:delete",
    "article:view", "article:create", "article:update", "article:delete", "article:scan", "article:mass_add",
    "log:view",
    "default_articles:manage",
    "article:copy_from_store",
  ],
  "vedouci_skladu": [
    "user:view", "user:create", "user:update", "user:delete", // Can manage users in their store
    "rack:view", "rack:create", "rack:update", "rack:delete",
    "article:view", "article:create", "article:update", "article:delete", "article:scan", "article:mass_add",
    "log:view",
    "article:copy_from_store",
  ],
  "store_manager": [
    "user:view", "user:update", // Can view and update users in their store
    "rack:view", "rack:update",
    "article:view", "article:create", "article:update", "article:scan", "article:mass_add",
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

// Initial users - toto pole již nebude použito, uživatelé se načítají z DB
export const users: User[] = [];

// Default articles for new stores (if needed)
export const defaultArticlesForNewStores: Omit<Article, 'rackId' | 'shelfNumber' | 'storeId' | 'quantity'>[] = [
  { id: "DEFAULT-001", name: "Výchozí artikl A", status: "21" },
  { id: "DEFAULT-002", name: "Výchozí artikl B", status: "11" },
  { id: "DEFAULT-003", name: "Výchozí artikl C", status: "41" },
];