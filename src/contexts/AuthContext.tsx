import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, users as initialUsers, defaultPermissions } from "@/data/users";
import { Permission } from "@/types/auth";
import { toast } from "sonner";
import { useLog } from "@/contexts/LogContext";
import { useTranslation } from "react-i18next";
import * as bcrypt from 'bcryptjs'; // Import bcryptjs

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userStoreId: string | undefined;
  allUsers: User[];
  addUser: (newUser: User) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  deleteUser: (username: string) => void;
  hasPermission: (permission: Permission) => boolean;
  getStoreUsers: (storeId: string) => User[];
  changePasswordOnFirstLogin: (username: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addLogEntry } = useLog();
  const { t } = useTranslation();

  // Funkce pro obnovení seznamu uživatelů z localStorage nebo initialUsers
  const refreshUsers = async () => {
    setIsLoading(true);
    const storedUsers = localStorage.getItem("allUsers");
    if (storedUsers) {
      setAllUsers(JSON.parse(storedUsers));
    } else {
      // Pokud nejsou uživatelé v localStorage, použijeme initialUsers
      // a uložíme je do localStorage pro budoucí použití
      setAllUsers(initialUsers);
      localStorage.setItem("allUsers", JSON.stringify(initialUsers));
    }
    setIsLoading(false);
  };

  // Načtení aktuálního uživatele z localStorage a všech uživatelů při startu
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("currentUser");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      }
      await refreshUsers(); // Vždy načteme uživatele
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // Ukládání allUsers do localStorage při každé změně
  useEffect(() => {
    if (allUsers.length > 0) {
      localStorage.setItem("allUsers", JSON.stringify(allUsers));
    }
  }, [allUsers]);

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    return currentUser.permissions.includes(permission);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userFound = allUsers.find(u => u.username === username);

      if (!userFound || !userFound.password) {
        toast.error(t("common.invalidCredentials"));
        addLogEntry(t("common.loginFailed"), { username }, username);
        return false;
      }

      const isPasswordValid = await bcrypt.compare(password, userFound.password);

      if (!isPasswordValid) {
        toast.error(t("common.invalidCredentials"));
        addLogEntry(t("common.loginFailed"), { username }, username);
        return false;
      }

      setCurrentUser(userFound);
      localStorage.setItem("currentUser", JSON.stringify(userFound));
      toast.success(t("common.welcomeUser", { username: userFound.username }));
      addLogEntry(t("common.userLoggedIn"), { username: userFound.username, role: userFound.role, storeId: userFound.storeId }, userFound.username);
      return true;
    } catch (error: any) {
      toast.error(error.message || t("common.loginFailed"));
      addLogEntry(t("common.loginFailed"), { username, error: error.message }, username);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (currentUser) {
      addLogEntry(t("common.userLoggedOut"), { username: currentUser.username, storeId: currentUser.storeId }, currentUser.username);
    }
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast.info(t("common.loggedOut"));
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

    const userToAdd = { ...newUser };

    if (!isAdmin) {
      if (!currentUser?.storeId) {
        toast.error(t("common.userWithoutStoreCannotAddUsers"));
        return;
      }
      if (userToAdd.storeId !== currentUser.storeId) {
        toast.error(t("common.noPermissionToAssignToOtherStore"));
        return;
      }
      userToAdd.storeId = currentUser.storeId;
    } else if (userToAdd.role !== "admin" && !userToAdd.storeId) {
      toast.error(t("common.adminMustSpecifyStoreId"));
      return;
    }

    if (!userToAdd.permissions || userToAdd.permissions.length === 0) {
      userToAdd.permissions = defaultPermissions[userToAdd.role] || [];
    }

    userToAdd.password = await bcrypt.hash(userToAdd.password!, 10); // Heslo hashujeme

    setAllUsers(prevUsers => [...prevUsers, userToAdd]);
    toast.success(t("common.userAddedSuccess", { username: userToAdd.username }));
    addLogEntry(t("common.userAdded"), { username: userToAdd.username, role: userToAdd.role, storeId: userToAdd.storeId, permissions: userToAdd.permissions }, currentUser?.username);
  };

  const updateUser = async (updatedUser: User) => {
    if (!hasPermission("user:update")) {
      toast.error(t("common.noPermissionToEditUsers"));
      return;
    }

    const existingUser = allUsers.find(u => u.username === updatedUser.username);
    if (!existingUser) {
      toast.error(t("common.userNotFound"));
      return;
    }

    if (!isAdmin) {
      if (!currentUser?.storeId) {
        toast.error(t("common.userWithoutStoreCannotEditUsers"));
        return;
      }
      if (existingUser.storeId !== currentUser.storeId) {
        toast.error(t("common.noPermissionToEditUsersInOtherStore"));
        return;
      }
      if (updatedUser.storeId !== currentUser.storeId) {
        toast.error(t("common.noPermissionToChangeStoreId"));
        return;
      }
      if (existingUser.role === "admin") {
        toast.error(t("common.noPermissionToEditAdmins"));
        return;
      }
      if (currentUser?.username === updatedUser.username && updatedUser.role === "admin") {
        toast.error(t("common.noPermissionToChangeRoleToAdmin"));
        return;
      }
    }

    let finalPassword = existingUser.password;
    if (updatedUser.password && updatedUser.password !== existingUser.password) {
      finalPassword = await bcrypt.hash(updatedUser.password, 10);
    } else if (!updatedUser.password) {
      finalPassword = existingUser.password;
    }

    const userToUpdate = { ...updatedUser, password: finalPassword };

    setAllUsers(prevUsers =>
      prevUsers.map(u => (u.username === userToUpdate.username ? userToUpdate : u))
    );

    if (currentUser?.username === userToUpdate.username) {
      setCurrentUser(userToUpdate);
      localStorage.setItem("currentUser", JSON.stringify(userToUpdate));
    }
    toast.success(t("common.userUpdatedSuccess", { username: userToUpdate.username }));
    addLogEntry(t("common.userUpdated"), { username: userToUpdate.username, role: userToUpdate.role, storeId: userToUpdate.storeId, permissions: userToUpdate.permissions }, currentUser?.username);
  };

  const deleteUser = async (username: string) => {
    if (!hasPermission("user:delete")) {
      toast.error(t("common.noPermissionToDeleteUsers"));
      return;
    }

    const userToDelete = allUsers.find(u => u.username === username);
    if (!userToDelete) {
      toast.error(t("common.userNotFound"));
      return;
    }

    if (!isAdmin) {
      if (!currentUser?.storeId) {
        toast.error(t("common.userWithoutStoreCannotDeleteUsers"));
        return;
      }
      if (userToDelete.storeId !== currentUser.storeId) {
        toast.error(t("common.noPermissionToDeleteUsersInOtherStore"));
        return;
      }
      if (userToDelete.role === "admin") {
        toast.error(t("common.noPermissionToDeleteAdmins"));
        return;
      }
      if (currentUser?.username === username) {
        toast.error(t("common.cannotDeleteSelf"));
        return;
      }
    }

    setAllUsers(prevUsers => prevUsers.filter(u => u.username !== username));
    if (currentUser?.username === username) {
      logout();
    }
    toast.success(t("common.userDeletedSuccess", { username }));
    addLogEntry(t("common.userDeleted"), { username }, currentUser?.username);
  };

  const changePasswordOnFirstLogin = async (username: string, newPassword: string): Promise<boolean> => {
    const userToUpdate = allUsers.find(u => u.username === username);
    if (!userToUpdate) {
      toast.error(t("common.userNotFound"));
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = { ...userToUpdate, password: hashedPassword, firstLogin: false };

    setAllUsers(prevUsers =>
      prevUsers.map(u => (u.username === updatedUser.username ? updatedUser : u))
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
        isLoading,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};