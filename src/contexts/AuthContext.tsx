import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, users } from "@/data/users";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userWarehouseId: string | undefined;
  allUsers: User[];
  addUser: (newUser: User) => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (username: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(users);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = allUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      toast.success(`Vítejte, ${foundUser.username}!`);
      return true;
    }
    toast.error("Neplatné uživatelské jméno nebo heslo.");
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast.info("Byli jste odhlášeni.");
  };

  const addUser = (newUser: User) => {
    if (allUsers.some(u => u.username === newUser.username)) {
      toast.error("Uživatel s tímto jménem již existuje.");
      return;
    }
    setAllUsers((prev) => [...prev, newUser]);
    toast.success(`Uživatel ${newUser.username} byl přidán.`);
  };

  const updateUser = (updatedUser: User) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.username === updatedUser.username ? updatedUser : u))
    );
    if (currentUser?.username === updatedUser.username) {
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    toast.success(`Uživatel ${updatedUser.username} byl aktualizován.`);
  };

  const deleteUser = (username: string) => {
    setAllUsers((prev) => prev.filter((u) => u.username !== username));
    if (currentUser?.username === username) {
      logout();
    }
    toast.success(`Uživatel ${username} byl smazán.`);
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";
  const userWarehouseId = currentUser?.warehouseId;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        userWarehouseId,
        allUsers,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};