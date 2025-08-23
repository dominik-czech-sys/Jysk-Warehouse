export interface User {
  username: string;
  password: string; // In a real app, this would be hashed
  role: "admin" | "skladnik"; // admin or warehouse worker
  warehouseId?: string; // Which warehouse this user manages
}

export const users: User[] = [
  {
    username: "Dczech",
    password: "koplkoplko1A",
    role: "admin",
  },
  {
    username: "skladnik1",
    password: "password1",
    role: "skladnik",
    warehouseId: "Sklad 1",
  },
  {
    username: "skladnik2",
    password: "password2",
    role: "skladnik",
    warehouseId: "Sklad 2",
  },
];