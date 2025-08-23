import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, users as initialUsers, Permission, defaultPermissions } from "@/data/users";
import { toast } from "sonner";
import { useLog } from "@/contexts/LogContext";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userStoreId: string | undefined; // Renamed from userWarehouseId
  allUsers: User[];
  addUser: (newUser: User) => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (username: string) => void;
  hasPermission: (permission: Permission) => boolean;
  getStoreUsers: (storeId: string) => User[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem("allUsers");
    return storedUsers ? JSON.parse(storedUsers) : initialUsers;
  });
  const { addLogEntry } = useLog();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("allUsers", JSON.stringify(allUsers));
  }, [allUsers]);

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true; // Admin has all permissions
    return currentUser.permissions.includes(permission);
  };

  const login = (username: string, password: string): boolean => {
    const foundUser = allUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      toast.success(`Vítejte, ${foundUser.username}!`);
      addLogEntry("Uživatel se přihlásil", { username: foundUser.username, role: foundUser.role, storeId: foundUser.storeId }, foundUser.username);
      return true;
    }
    toast.error("Neplatné uživatelské jméno nebo heslo.");
    addLogEntry("Neúspěšné přihlášení", { username }, username);
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addLogEntry("Uživatel se odhlásil", { username: currentUser.username, storeId: currentUser.storeId }, currentUser.username);
    }
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast.info("Byli jste odhlášeni.");
  };

  const addUser = (newUser: User) => {
    if (!hasPermission("user:create")) {
      toast.error("Nemáte oprávnění přidávat uživatele.");
      return;
    }
    if (allUsers.some(u => u.username === newUser.username)) {
      toast.error("Uživatel s tímto jménem již existuje.");
      addLogEntry("Pokus o přidání existujícího uživatele", { username: newUser.username }, currentUser?.username);
      return;
    }

    // Ensure storeId is set correctly based on current user's context
    const userToAdd = { ...newUser };
    if (!isAdmin && currentUser?.storeId) {
      userToAdd.storeId = currentUser.storeId;
    } else if (isAdmin && !userToAdd.storeId) {
      toast.error("Admin musí při vytváření uživatele zadat ID skladu.");
      return;
    } else if (!isAdmin && !currentUser?.storeId) {
      toast.error("Uživatel bez přiřazeného skladu nemůže přidávat uživatele.");
      return;
    }

    // Assign default permissions if not explicitly set
    if (!userToAdd.permissions || userToAdd.permissions.length === 0) {
      userToAdd.permissions = defaultPermissions[userToAdd.role] || [];
    }

    setAllUsers((prev) => [...prev, userToAdd]);
    toast.success(`Uživatel ${userToAdd.username} byl přidán.`);
    addLogEntry("Uživatel přidán", { username: userToAdd.username, role: userToAdd.role, storeId: userToAdd.storeId, permissions: userToAdd.permissions }, currentUser?.username);
  };

  const updateUser = (updatedUser: User) => {
    if (!hasPermission("user:update")) {
      toast.error("Nemáte oprávnění upravovat uživatele.");
      return;
    }

    // Prevent non-admins from changing storeId or editing users outside their store
    if (!isAdmin && currentUser?.storeId && updatedUser.storeId !== currentUser.storeId) {
      toast.error("Nemáte oprávnění měnit ID skladu uživatele nebo upravovat uživatele mimo váš sklad.");
      return;
    }
    if (!isAdmin && !currentUser?.storeId) {
      toast.error("Uživatel bez přiřazeného skladu nemůže upravovat uživatele.");
      return;
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.username === updatedUser.username ? updatedUser : u))
    );
    if (currentUser?.username === updatedUser.username) {
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    toast.success(`Uživatel ${updatedUser.username} byl aktualizován.`);
    addLogEntry("Uživatel aktualizován", { username: updatedUser.username, role: updatedUser.role, storeId: updatedUser.storeId, permissions: updatedUser.permissions }, currentUser?.username);
  };

  const deleteUser = (username: string) => {
    if (!hasPermission("user:delete")) {
      toast.error("Nemáte oprávnění mazat uživatele.");
      return;
    }

    const userToDelete = allUsers.find(u => u.username === username);
    if (!userToDelete) {
      toast.error("Uživatel nenalezen.");
      return;
    }

    // Prevent non-admins from deleting users outside their store
    if (!isAdmin && currentUser?.storeId && userToDelete.storeId !== currentUser.storeId) {
      toast.error("Nemáte oprávnění mazat uživatele mimo váš sklad.");
      return;
    }
    if (!isAdmin && !currentUser?.storeId) {
      toast.error("Uživatel bez přiřazeného skladu nemůže mazat uživatele.");
      return;
    }

    setAllUsers((prev) => prev.filter((u) => u.username !== username));
    if (currentUser?.username === username) {
      logout();
    }
    toast.success(`Uživatel ${username} byl smazán.`);
    addLogEntry("Uživatel smazán", { username }, currentUser?.username);
  };

  const getStoreUsers = (storeId: string) => {
    return allUsers.filter(user => user.storeId === storeId);
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";
  const userStoreId = currentUser?.storeId; // Renamed from userWarehouseId

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        userStoreId,
        allUsers,
        addUser,
        updateUser,
        deleteUser,
        hasPermission,
        getStoreUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};