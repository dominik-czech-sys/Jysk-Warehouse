import { Article } from "@/data/articles"; // Import Article type
import * as bcrypt from 'bcryptjs'; // Import bcryptjs for hashing passwords

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
  | "log:view"
  | "default_articles:manage"
  | "article:copy_from_store";

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

// Initial users - now with hashed passwords
export const initialUsers: User[] = [
  {
    username: "admin",
    password: bcrypt.hashSync("adminpassword", 10), // Hashed password for 'adminpassword'
    role: "admin",
    permissions: defaultPermissions["admin"],
    firstLogin: false,
  },
  {
    username: "vedouci1",
    password: bcrypt.hashSync("vedouci1pass", 10),
    role: "vedouci_skladu",
    storeId: "T508",
    permissions: defaultPermissions["vedouci_skladu"],
    firstLogin: false,
  },
  {
    username: "skladnik1",
    password: bcrypt.hashSync("skladnik1pass", 10),
    role: "skladnik",
    storeId: "T508",
    permissions: defaultPermissions["skladnik"],
    firstLogin: false,
  },
  {
    username: "skladnik2",
    password: bcrypt.hashSync("skladnik2pass", 10),
    role: "skladnik",
    storeId: "Kozomín",
    permissions: defaultPermissions["skladnik"],
    firstLogin: false,
  },
  {
    username: "manager1",
    password: bcrypt.hashSync("manager1pass", 10),
    role: "store_manager",
    storeId: "T508",
    permissions: defaultPermissions["store_manager"],
    firstLogin: false,
  },
  {
    username: "deputy1",
    password: bcrypt.hashSync("deputy1pass", 10),
    role: "deputy_store_manager",
    storeId: "T508",
    permissions: defaultPermissions["deputy_store_manager"],
    firstLogin: false,
  },
  {
    username: "ar_assistant1",
    password: bcrypt.hashSync("ar_assistant1pass", 10),
    role: "ar_assistant_of_sale",
    storeId: "T508",
    permissions: defaultPermissions["ar_assistant_of_sale"],
    firstLogin: false,
  },
];

// Default articles for new stores (if needed)
export const defaultArticlesForNewStores: Omit<Article, 'rackId' | 'shelfNumber' | 'storeId' | 'quantity'>[] = [
  { id: "DEFAULT-001", name: "Výchozí artikl A", status: "21" },
  { id: "DEFAULT-002", name: "Výchozí artikl B", status: "11" },
  { id: "DEFAULT-003", name: "Výchozí artikl C", status: "41" },
];