export type Permission =
  | "user:view"
  | "user:create"
  | "user:update"
  | "user:delete"
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
  password: string; // In a real app, this would be hashed
  role: "admin" | "vedouci_skladu" | "store_manager" | "deputy_store_manager" | "ar_assistant_of_sale" | "skladnik"; // admin or store-specific roles
  storeId?: string; // Which store this user belongs to
  permissions: Permission[]; // Array of specific permissions
}

// Default permissions for each role
export const defaultPermissions: Record<User['role'], Permission[]> = {
  "admin": [
    "user:view", "user:create", "user:update", "user:delete",
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

export const users: User[] = [
  {
    username: "Dczech",
    password: "koplkoplko1A",
    role: "admin",
    permissions: defaultPermissions["admin"],
  },
  {
    username: "vedouci_skladu1",
    password: "password1",
    role: "vedouci_skladu",
    storeId: "Sklad 1",
    permissions: defaultPermissions["vedouci_skladu"],
  },
  {
    username: "skladnik1",
    password: "password1",
    role: "skladnik",
    storeId: "Sklad 1",
    permissions: defaultPermissions["skladnik"],
  },
  {
    username: "vedouci_skladu2",
    password: "password2",
    role: "vedouci_skladu",
    storeId: "Sklad 2",
    permissions: defaultPermissions["vedouci_skladu"],
  },
  {
    username: "skladnik2",
    password: "password2",
    role: "skladnik",
    storeId: "Sklad 2",
    permissions: defaultPermissions["skladnik"],
  },
];

// Default articles for new stores (if needed)
export const defaultArticlesForNewStores: Omit<Article, 'rackId' | 'shelfNumber' | 'location' | 'floor' | 'storeId'>[] = [
  { id: "DEFAULT-001", name: "Výchozí produkt A", status: "21" },
  { id: "DEFAULT-002", name: "Výchozí produkt B", status: "11" },
];