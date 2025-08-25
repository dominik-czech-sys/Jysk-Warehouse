import React, { createContext, useState, useEffect, ReactNode, useRef } from "react";
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
  const inactivityTimer = useRef<number | null>(null);

  const logout = async () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    if (user) {
      addLogEntry(t("common.userLoggedOut"), { username: user.username, storeId: user.store_id }, user.email);
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast.error("Chyba při odhlašování.");
    } else {
      toast.info(t("common.loggedOut"));
      window.location.href = '/prihlaseni';
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = window.setTimeout(() => {
      toast.info(t("common.sessionExpired"));
      logout();
    }, 5 * 60 * 1000); // 5 minutes
  };

  useEffect(() => {
    const isAuthenticated = !!session?.user && !!user;
    if (isAuthenticated) {
      const events = ['mousemove', 'keydown', 'click', 'scroll'];
      resetInactivityTimer();
      events.forEach(event => window.addEventListener(event, resetInactivityTimer));

      return () => {
        if (inactivityTimer.current) {
          clearTimeout(inactivityTimer.current);
        }
        events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      };
    }
  }, [session, user]);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error || !profile) {
            console.error("Profile error on auth state change, signing out:", error);
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
          } else if (!profile.is_approved) {
            if (_event === 'SIGNED_IN') {
              toast.error(t("common.accountNotApproved"));
            }
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
          } else {
            const fullUser = { ...session.user, ...profile };
            setUser(fullUser);
            setSession(session);
            if (_event === 'SIGNED_IN') {
              toast.success(t("common.welcomeUser", { username: fullUser.username || fullUser.first_name || fullUser.email }));
              addLogEntry(t("common.userLoggedIn"), { username: fullUser.username, role: fullUser.role, storeId: fullUser.store_id }, fullUser.email);
            }
          }
        } else {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [addLogEntry, t]);

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