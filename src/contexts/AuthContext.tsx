import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, users as initialUsers, Permission, defaultPermissions } from "@/data/users";
import { toast } from "sonner";
import { useLog } from "@/contexts/LogContext";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userStoreId: string | undefined;
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
  const { t } = useTranslation(); // Initialize useTranslation

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
      toast.success(t("common.welcomeUser", { username: foundUser.username }));
      addLogEntry(t("common.userLoggedIn"), { username: foundUser.username, role: foundUser.role, storeId: foundUser.storeId }, foundUser.username);
      return true;
    }
    toast.error(t("common.invalidCredentials"));
    addLogEntry(t("common.loginFailed"), { username }, username);
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addLogEntry(t("common.userLoggedOut"), { username: currentUser.username, storeId: currentUser.storeId }, currentUser.username);
    }
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast.info(t("common.loggedOut"));
  };

  const addUser = (newUser: User) => {
    if (!hasPermission("user:create")) {
      toast.error(t("common.noPermissionToAddUsers"));
      return;
    }
    if (allUsers.some(u => u.username === newUser.username)) {
      toast.error(t("common.userExists"));
      addLogEntry(t("common.attemptToAddExistingUser"), { username: newUser.username }, currentUser?.username);
      return;
    }

    // Ensure storeId is set correctly based on current user's context
    const userToAdd = { ...newUser };
    if (!isAdmin && currentUser?.storeId) {
      userToAdd.storeId = currentUser.storeId;
    } else if (isAdmin && !userToAdd.storeId && userToAdd.role !== "admin") {
      toast.error(t("common.adminMustSpecifyStoreId"));
      return;
    } else if (!isAdmin && !currentUser?.storeId) {
      toast.error(t("common.userWithoutStoreCannotAddUsers"));
      return;
    }

    // Assign default permissions if not explicitly set
    if (!userToAdd.permissions || userToAdd.permissions.length === 0) {
      userToAdd.permissions = defaultPermissions[userToAdd.role] || [];
    }

    setAllUsers((prev) => [...prev, userToAdd]);
    toast.success(t("common.userAddedSuccess", { username: userToAdd.username }));
    addLogEntry(t("common.userAdded"), { username: userToAdd.username, role: userToAdd.role, storeId: userToAdd.storeId, permissions: userToAdd.permissions }, currentUser?.username);
  };

  const updateUser = (updatedUser: User) => {
    if (!hasPermission("user:update")) {
      toast.error(t("common.noPermissionToEditUsers"));
      return;
    }

    // Prevent non-admins from changing storeId or editing users outside their store
    if (!isAdmin && currentUser?.storeId && updatedUser.storeId !== currentUser.storeId) {
      toast.error(t("common.noPermissionToChangeStoreId"));
      return;
    }
    if (!isAdmin && !currentUser?.storeId) {
      toast.error(t("common.userWithoutStoreCannotAddUsers"));
      return;
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.username === updatedUser.username ? updatedUser : u))
    );
    if (currentUser?.username === updatedUser.username) {
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    toast.success(t("common.userUpdatedSuccess", { username: updatedUser.username }));
    addLogEntry(t("common.userUpdated"), { username: updatedUser.username, role: updatedUser.role, storeId: updatedUser.storeId, permissions: updatedUser.permissions }, currentUser?.username);
  };

  const deleteUser = (username: string) => {
    if (!hasPermission("user:delete")) {
      toast.error(t("common.noPermissionToDeleteUsers"));
      return;
    }

    const userToDelete = allUsers.find(u => u.username === username);
    if (!userToDelete) {
      toast.error(t("common.userNotFound"));
      return;
    }

    // Prevent non-admins from deleting users outside their store
    if (!isAdmin && currentUser?.storeId && userToDelete.storeId !== currentUser.storeId) {
      toast.error(t("common.noPermissionToDeleteUsers")); // Re-using message, could be more specific
      return;
    }
    if (!isAdmin && !currentUser?.storeId) {
      toast.error(t("common.userWithoutStoreCannotAddUsers")); // Re-using message
      return;
    }

    setAllUsers((prev) => prev.filter((u) => u.username !== username));
    if (currentUser?.username === username) {
      logout();
    }
    toast.success(t("common.userDeletedSuccess", { username }));
    addLogEntry(t("common.userDeleted"), { username }, currentUser?.username);
  };

  const getStoreUsers = (storeId: string) => {
    return allUsers.filter(user => user.storeId === storeId);
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";
  const userStoreId = currentUser?.storeId;

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