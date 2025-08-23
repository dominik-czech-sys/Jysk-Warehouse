import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, users as initialUsers, Permission, defaultPermissions } from "@/data/users";
import { toast } from "sonner";
import { useLog } from "@/contexts/LogContext";
import { useTranslation } from "react-i18next";
import * as bcrypt from 'bcryptjs'; // Import bcryptjs

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>; // Changed to async
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userStoreId: string | undefined;
  allUsers: User[];
  addUser: (newUser: User) => Promise<void>; // Changed to async
  updateUser: (updatedUser: User) => Promise<void>; // Changed to async
  deleteUser: (username: string) => void;
  hasPermission: (permission: Permission) => boolean;
  getStoreUsers: (storeId: string) => User[];
  changePasswordOnFirstLogin: (username: string, newPassword: string) => Promise<boolean>; // New function
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem("allUsers");
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    // Hash initial passwords only once if not already stored
    const hashedInitialUsers = initialUsers.map(u => {
      // Only hash if it looks like a plain text password (simple check)
      if (u.password.length < 60 || !u.password.startsWith('$2a$')) { // bcrypt hashes are usually 60 chars and start with $2a$
        return { ...u, password: bcrypt.hashSync(u.password, 10) };
      }
      return u;
    });
    return hashedInitialUsers;
  });
  const { addLogEntry } = useLog();
  const { t } = useTranslation();

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
    if (currentUser.role === "admin") return true;
    return currentUser.permissions.includes(permission);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = allUsers.find((u) => u.username === username);
    if (foundUser) {
      const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
      if (isPasswordCorrect) {
        setCurrentUser(foundUser);
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        toast.success(t("common.welcomeUser", { username: foundUser.username }));
        addLogEntry(t("common.userLoggedIn"), { username: foundUser.username, role: foundUser.role, storeId: foundUser.storeId }, foundUser.username);
        return true;
      }
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

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return t("common.passwordTooShort");
    if (!/[0-9]/.test(password)) return t("common.passwordNoNumber");
    if (!/[A-Z]/.test(password)) return t("common.passwordNoUppercase");
    if (!/[a-z]/.test(password)) return t("common.passwordNoLowercase");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return t("common.passwordNoSpecialChar");
    return null;
  };

  const addUser = async (newUser: User) => {
    if (!hasPermission("user:create")) {
      toast.error(t("common.noPermissionToAddUsers"));
      return;
    }
    if (allUsers.some(u => u.username === newUser.username)) {
      toast.error(t("common.userExists"));
      addLogEntry(t("common.attemptToAddExistingUser"), { username: newUser.username }, currentUser?.username);
      return;
    }

    const passwordError = validatePassword(newUser.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

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

    if (!userToAdd.permissions || userToAdd.permissions.length === 0) {
      userToAdd.permissions = defaultPermissions[userToAdd.role] || [];
    }

    userToAdd.password = await bcrypt.hash(userToAdd.password, 10);
    userToAdd.firstLogin = true; // New users always have firstLogin true

    setAllUsers((prev) => [...prev, userToAdd]);
    toast.success(t("common.userAddedSuccess", { username: userToAdd.username }));
    addLogEntry(t("common.userAdded"), { username: userToAdd.username, role: userToAdd.role, storeId: userToAdd.storeId, permissions: userToAdd.permissions }, currentUser?.username);
  };

  const updateUser = async (updatedUser: User) => {
    if (!hasPermission("user:update")) {
      toast.error(t("common.noPermissionToEditUsers"));
      return;
    }

    if (!isAdmin && currentUser?.storeId && updatedUser.storeId !== currentUser.storeId) {
      toast.error(t("common.noPermissionToChangeStoreId"));
      return;
    }
    if (!isAdmin && !currentUser?.storeId) {
      toast.error(t("common.userWithoutStoreCannotAddUsers"));
      return;
    }

    const existingUser = allUsers.find(u => u.username === updatedUser.username);
    if (!existingUser) {
      toast.error(t("common.userNotFound"));
      return;
    }

    let finalPassword = existingUser.password;
    if (updatedUser.password !== existingUser.password) { // Only hash if password has changed
      const passwordError = validatePassword(updatedUser.password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
      finalPassword = await bcrypt.hash(updatedUser.password, 10);
    }

    const userToUpdate = { ...updatedUser, password: finalPassword };

    setAllUsers((prev) =>
      prev.map((u) => (u.username === userToUpdate.username ? userToUpdate : u))
    );
    if (currentUser?.username === userToUpdate.username) {
      setCurrentUser(userToUpdate);
      localStorage.setItem("currentUser", JSON.stringify(userToUpdate));
    }
    toast.success(t("common.userUpdatedSuccess", { username: userToUpdate.username }));
    addLogEntry(t("common.userUpdated"), { username: userToUpdate.username, role: userToUpdate.role, storeId: userToUpdate.storeId, permissions: userToUpdate.permissions }, currentUser?.username);
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

    if (!isAdmin && currentUser?.storeId && userToDelete.storeId !== currentUser.storeId) {
      toast.error(t("common.noPermissionToDeleteUsers"));
      return;
    }
    if (!isAdmin && !currentUser?.storeId) {
      toast.error(t("common.userWithoutStoreCannotAddUsers"));
      return;
    }

    setAllUsers((prev) => prev.filter((u) => u.username !== username));
    if (currentUser?.username === username) {
      logout();
    }
    toast.success(t("common.userDeletedSuccess", { username }));
    addLogEntry(t("common.userDeleted"), { username }, currentUser?.username);
  };

  const changePasswordOnFirstLogin = async (username: string, newPassword: string): Promise<boolean> => {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return false;
    }

    const userToUpdate = allUsers.find(u => u.username === username);
    if (!userToUpdate) {
      toast.error(t("common.userNotFound"));
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = { ...userToUpdate, password: hashedPassword, firstLogin: false };

    setAllUsers((prev) =>
      prev.map((u) => (u.username === username ? updatedUser : u))
    );
    if (currentUser?.username === username) {
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    toast.success(t("common.passwordChangedSuccess"));
    addLogEntry(t("common.passwordChangedSuccess"), { username }, username);
    return true;
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
        changePasswordOnFirstLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};