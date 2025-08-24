import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, users as initialUsers, Permission, defaultPermissions } from "@/data/users";
import { toast } from "sonner";
import { useLog } from "@/contexts/LogContext";
import { useTranslation } from "react-i18next";
import * as bcrypt from 'bcryptjs'; // Import bcryptjs
import { loginUser, getUser, createUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser, getAllUsers } from "@/api"; // Import API functions

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userStoreId: string | undefined;
  allUsers: User[]; // Toto bude nyní načítáno z API
  addUser: (newUser: User) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  deleteUser: (username: string) => void;
  hasPermission: (permission: Permission) => boolean;
  getStoreUsers: (storeId: string) => User[];
  changePasswordOnFirstLogin: (username: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean; // Add isLoading state
  refreshUsers: () => Promise<void>; // Funkce pro obnovení seznamu uživatelů
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Nyní se načítá z API
  const [isLoading, setIsLoading] = useState(true); // Initialize isLoading to true
  const { addLogEntry } = useLog();
  const { t } = useTranslation();

  // Funkce pro obnovení seznamu uživatelů z API
  const refreshUsers = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setAllUsers([]);
      return; // No token, no need to fetch users
    }
    try {
      const usersFromApi = await getAllUsers();
      // Hashování hesel pro initialUsers, pokud ještě nejsou hashovaná (pouze pro první spuštění)
      const processedUsers = usersFromApi.map((u: any) => {
        // Předpokládáme, že hesla z API jsou již hashovaná.
        // Tato logika je zde spíše pro kompatibilitu s původním `initialUsers` polem.
        if (u.password && (u.password.length < 60 || !u.password.startsWith('$2a$'))) {
          return { ...u, password: bcrypt.hashSync(u.password, 10) };
        }
        return u;
      });
      setAllUsers(processedUsers);
    } catch (error: any) {
      console.error("Failed to fetch all users from API:", error);
      // If fetching users fails due to auth, log out the user
      if (error.message === 'Authentication token required' || error.message === 'Invalid or expired token') {
        logout(); // Log out if token is invalid
        toast.error(t("common.sessionExpired"));
      } else {
        toast.error(error.message || t("common.usersFetchFailed"));
      }
      setAllUsers([]); // V případě chyby nastavíme prázdné pole
    }
  };

  // Načtení aktuálního uživatele z localStorage a všech uživatelů z API při startu
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("currentUser");
      const storedToken = localStorage.getItem("jwtToken"); // Also get the token

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        // Attempt to refresh users. If token is invalid, refreshUsers will call logout.
        await refreshUsers();
      } else {
        // If no user or no token, ensure current user is null and users are empty
        setCurrentUser(null);
        setAllUsers([]);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // Ukládání allUsers do localStorage (pro persistenci, i když primární zdroj je API)
  useEffect(() => {
    // This useEffect should ideally not be needed if API is the source of truth
    // and allUsers is only derived from API calls.
    // Keeping it for now, but it might be removed in future refactors.
    // localStorage.setItem("allUsers", JSON.stringify(allUsers));
  }, [allUsers]);

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    return currentUser.permissions.includes(permission);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userFromApi = await loginUser(username, password);
      if (userFromApi && userFromApi.token) { // Check for token
        localStorage.setItem("jwtToken", userFromApi.token); // Store the token
        // Získání kompletních dat uživatele z API po úspěšném přihlášení
        const fullUser = await getUser(username);
        if (fullUser) {
          setCurrentUser(fullUser as User); // Přetypování na User
          localStorage.setItem("currentUser", JSON.stringify(fullUser));
          toast.success(t("common.welcomeUser", { username: fullUser.username }));
          addLogEntry(t("common.userLoggedIn"), { username: fullUser.username, role: fullUser.role, storeId: fullUser.storeId }, fullUser.username);
          await refreshUsers(); // Refresh users after successful login
          return true;
        }
      }
      toast.error(t("common.invalidCredentials"));
      addLogEntry(t("common.loginFailed"), { username }, username);
      return false;
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
    localStorage.removeItem("jwtToken"); // Remove token on logout
    setAllUsers([]); // Clear users on logout
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

    userToAdd.password = await bcrypt.hash(userToAdd.password, 10); // Heslo hashujeme před odesláním na backend

    try {
      const createdUser = await createUser(userToAdd);
      if (createdUser) {
        await refreshUsers(); // Obnovení seznamu uživatelů po přidání
        toast.success(t("common.userAddedSuccess", { username: createdUser.username }));
        addLogEntry(t("common.userAdded"), { username: createdUser.username, role: createdUser.role, storeId: createdUser.storeId, permissions: createdUser.permissions }, currentUser?.username);
      }
    } catch (error: any) {
      toast.error(error.message || t("common.userAddFailed"));
      addLogEntry(t("common.userAddFailed"), { username: userToAdd.username, error: error.message }, currentUser?.username);
    }
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

    try {
      const updatedUserFromApi = await apiUpdateUser(userToUpdate.username, userToUpdate);
      if (updatedUserFromApi) {
        await refreshUsers(); // Obnovení seznamu uživatelů po aktualizaci
        if (currentUser?.username === updatedUserFromApi.username) {
          setCurrentUser(updatedUserFromApi as User);
          localStorage.setItem("currentUser", JSON.stringify(updatedUserFromApi));
        }
        toast.success(t("common.userUpdatedSuccess", { username: updatedUserFromApi.username }));
        addLogEntry(t("common.userUpdated"), { username: updatedUserFromApi.username, role: updatedUserFromApi.role, storeId: updatedUserFromApi.storeId, permissions: updatedUserFromApi.permissions }, currentUser?.username);
      }
    } catch (error: any) {
      toast.error(error.message || t("common.userUpdateFailed"));
      addLogEntry(t("common.userUpdateFailed"), { username: updatedUser.username, error: error.message }, currentUser?.username);
    }
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

    try {
      const success = await apiDeleteUser(username);
      if (success) {
        await refreshUsers(); // Obnovení seznamu uživatelů po smazání
        if (currentUser?.username === username) {
          logout();
        }
        toast.success(t("common.userDeletedSuccess", { username }));
        addLogEntry(t("common.userDeleted"), { username }, currentUser?.username);
      }
    } catch (error: any) {
      toast.error(error.message || t("common.userDeleteFailed"));
      addLogEntry(t("common.userDeleteFailed"), { username, error: error.message }, currentUser?.username);
    }
  };

  const changePasswordOnFirstLogin = async (username: string, newPassword: string): Promise<boolean> => {
    const userToUpdate = allUsers.find(u => u.username === username);
    if (!userToUpdate) {
      toast.error(t("common.userNotFound"));
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = { ...userToUpdate, password: hashedPassword, firstLogin: false };

    try {
      const updatedUserFromApi = await apiUpdateUser(username, updatedUser);
      if (updatedUserFromApi) {
        await refreshUsers(); // Obnovení seznamu uživatelů
        if (currentUser?.username === username) {
          setCurrentUser(updatedUserFromApi as User);
          localStorage.setItem("currentUser", JSON.stringify(updatedUserFromApi));
        }
        toast.success(t("common.passwordChangedSuccess"));
        addLogEntry(t("common.passwordChangedSuccess"), { username }, username);
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || t("common.passwordChangeFailed"));
      addLogEntry(t("common.passwordChangeFailed"), { username, error: error.message }, username);
      return false;
    }
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