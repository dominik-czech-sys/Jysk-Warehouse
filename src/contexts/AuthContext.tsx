import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Permission, defaultPermissions } from "@/data/users";
import { useLog } from "@/contexts/LogContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: "admin" | "vedouci_skladu" | "store_manager" | "deputy_store_manager" | "ar_assistant_of_sale" | "skladnik";
  store_id: string;
  first_login: boolean;
  is_approved: boolean;
}

export type User = SupabaseUser & UserProfile;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userStoreId: string | undefined;
  hasPermission: (permission: Permission) => boolean;
  changePassword: (newPassword: string) => Promise<boolean>;
  completeFirstLogin: (newPassword: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addLogEntry } = useLog();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error || !profile) {
            console.error("Error or missing profile for active session, signing out:", error);
            toast.error(t("common.sessionError"));
            await handleSignOut();
          } else if (!profile.is_approved) {
            toast.error(t("common.accountNotApproved"));
            await handleSignOut();
          } else {
            setUser({ ...session.user, ...profile });
          }
        }
      } catch (e) {
        console.error("Critical error during session validation, signing out:", e);
        toast.error(t("common.sessionError"));
        await handleSignOut();
      } finally {
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error || !profile) {
            console.error("Profile error on auth state change, signing out:", error);
            setUser(null);
          } else if (!profile.is_approved) {
            if (_event === 'SIGNED_IN') {
              toast.error(t("common.accountNotApproved"));
              await handleSignOut();
            }
            setUser(null);
            setSession(null);
          } else {
            const fullUser = { ...session.user, ...profile };
            setUser(fullUser);
            if (_event === 'SIGNED_IN') {
              toast.success(t("common.welcomeUser", { username: fullUser.email }));
              addLogEntry(t("common.userLoggedIn"), { username: fullUser.email, role: fullUser.role, storeId: fullUser.store_id }, fullUser.email);
            }
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [addLogEntry, t]);

  const logout = async () => {
    if (user) {
      addLogEntry(t("common.userLoggedOut"), { username: user.email, storeId: user.store_id }, user.email);
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast.error("Chyba při odhlašování.");
    } else {
      toast.info(t("common.loggedOut"));
    }
    setUser(null);
    setSession(null);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const userPermissions = defaultPermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(t("common.passwordChangedSuccess"));
    addLogEntry(t("common.userPasswordChanged"), {}, user?.email);
    return true;
  };

  const completeFirstLogin = async (newPassword: string): Promise<boolean> => {
    if (!user) return false;
    const passwordChanged = await changePassword(newPassword);
    if (passwordChanged) {
      const { error } = await supabase
        .from('profiles')
        .update({ first_login: false })
        .eq('id', user.id);

      if (error) {
        toast.error(error.message);
        return false;
      }
      setUser(prevUser => prevUser ? { ...prevUser, first_login: false } : null);
      return true;
    }
    return false;
  };

  const isAuthenticated = !!session?.user && !!user;
  const isAdmin = user?.role === "admin";
  const userStoreId = user?.store_id;

  const value = {
    session,
    user,
    logout,
    isAuthenticated,
    isAdmin,
    userStoreId,
    hasPermission,
    changePassword,
    completeFirstLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};