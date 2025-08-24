import { Permission } from "@/types/auth"; // Předpokládáme, že typy jsou definovány jinde nebo inline

export interface User {
  username: string;
  password?: string; // Heslo může být volitelné pro zobrazení, ale vyžadováno pro vytvoření/přihlášení
  role: "admin" | "store_manager" | "employee";
  storeId?: string;
  permissions: Permission[];
  firstLogin: boolean;
}

export const defaultPermissions: Record<User["role"], Permission[]> = {
  admin: [
    "user:view", "user:create", "user:update", "user:delete",
    "store:view", "store:create", "store:update", "store:delete",
    "rack:view", "rack:create", "rack:update", "rack:delete",
    "article:view", "article:create", "article:update", "article:delete",
  ],
  store_manager: [
    "user:view", "user:create", "user:update", "user:delete", // Manažeři mohou spravovat uživatele ve svém obchodě
    "store:view", "store:update", // Mohou prohlížet a aktualizovat informace o svém obchodě
    "rack:view", "rack:create", "rack:update", "rack:delete",
    "article:view", "article:create", "article:update", "article:delete",
  ],
  employee: [
    "store:view",
    "rack:view", "rack:update", // Zaměstnanci mohou aktualizovat stav/informace o regálech
    "article:view", "article:create", "article:update", "article:delete",
  ],
};

export const users: User[] = [
  {
    username: "admin",
    password: "$2a$10$f/9.QJ/k6gV7.95460wIbeMvD/jXwI4/v6q.x2.9j6d0lU09k", // Hashed 'adminpassword'
    role: "admin",
    permissions: defaultPermissions.admin,
    firstLogin: false,
  },
  {
    username: "manager1",
    password: "$2a$10$f/9.QJ/k6gV7.95460wIbeMvD/jXwI4/v6q.x2.9j6d0lU09k", // Hashed 'managerpassword'
    role: "store_manager",
    storeId: "JYSK-001",
    permissions: defaultPermissions.store_manager,
    firstLogin: false,
  },
  {
    username: "employee1",
    password: "$2a$10$f/9.QJ/k6gV7.95460wIbeMvD/jXwI4/v6q.x2.9j6d0lU09k", // Hashed 'employeepassword'
    role: "employee",
    storeId: "JYSK-001",
    permissions: defaultPermissions.employee,
    firstLogin: false,
  },
];