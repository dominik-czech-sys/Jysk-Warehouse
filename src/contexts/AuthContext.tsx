import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Permission, defaultPermissions } from "@/data/users";
import { useLog } from "@/contexts/LogContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Definice tvaru našeho vlastního uživatelského profilu
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: "admin" | "vedouci_skladu" | "store_manager" | "deputy_store_manager" | "ar_assistant_of_sale" | "skladnik";
  store_id: string;
  // Zde můžeme přidat další pole specifická pro naši aplikaci
}

// Kombinace Supabase uživatele a našeho profilu pro objekt 'user' v kontextu
export type User = SupabaseUser & UserProfile;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userStoreId: string | undefined;
  hasPermission: (permission: Permission) => boolean;
  // Zastaralé funkce pro správu uživatelů jsou odstraněny a budou nahrazeny
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

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Chyba při načítání profilu:", error);
        } else if (profile) {
          setUser({ ...session.user, ...profile });
        }
      }
      setLoading(false);
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
          
          if (error) {
            console.error("Chyba při načítání profilu po změně stavu:", error);
            setUser(null);
          } else if (profile) {
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
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast.info(t("common.loggedOut"));
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const userPermissions = defaultPermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const isAuthenticated = !!session?.user;
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};