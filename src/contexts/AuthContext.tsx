import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Permission } from "@/data/users";
import { useLog } from "@/contexts/LogContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string; // Role name from profiles table
  store_id: string;
  first_login: boolean;
  is_approved: boolean;
}

export type User = SupabaseUser & UserProfile & { permissions: Permission[] };

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

const fetchUserPermissions = async (roleName: string): Promise<Permission[]> => {
  if (!roleName) return [];

  // First, get the role ID from the role name
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (roleError || !roleData) {
    console.error("Error fetching role ID for:", roleName, roleError);
    return [];
  }

  // Then, get all permissions for that role ID
  const { data: permissionsData, error: permsError } = await supabase
    .from("role_permissions")
    .select("permission")
    .eq("role_id", roleData.id);

  if (permsError) {
    console.error("Error fetching permissions for role ID:", roleData.id, permsError);
    return [];
  }

  return permissionsData.map(p => p.permission as Permission);
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { addLogEntry } = useLog();
  const { t } = useTranslation();

  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['userPermissions', userProfile?.role],
    queryFn: () => fetchUserPermissions(userProfile!.role),
    enabled: !!userProfile,
  });

  useEffect(() => {
    const fetchInitialSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !profile || !profile.is_approved) {
          await supabase.auth.signOut();
          setUserProfile(null);
          setSession(null);
        } else {
          setUserProfile(profile);
          setSession(session);
        }
      }
      setLoading(false);
    };

    fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error || !profile || !profile.is_approved) {
            await supabase.auth.signOut();
            setUserProfile(null);
            setSession(null);
          } else {
            setUserProfile(profile);
            setSession(session);
            if (_event === 'SIGNED_IN') {
              toast.success(t("notification.welcome", { username: profile.username || profile.first_name || profile.email }));
              addLogEntry(t("logAction.userLoggedIn"), { username: profile.username, role: profile.role, storeId: profile.store_id }, profile.email);
            }
          }
        } else {
          setUserProfile(null);
          setSession(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [addLogEntry, t]);

  const logout = async () => {
    if (userProfile) {
      addLogEntry(t("logAction.userLoggedOut"), { username: userProfile.username, storeId: userProfile.store_id }, session?.user.email);
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast.error("Chyba při odhlašování.");
    } else {
      toast.info(t("notification.info.loggedOut"));
      window.location.href = '/prihlaseni';
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!userProfile || !permissions) return false;
    if (userProfile.role === "admin") return true; // Admin always has all permissions
    return permissions.includes(permission);
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(t("notification.success.passwordChanged"));
    addLogEntry(t("logAction.userPasswordChanged"), {}, session?.user.email);
    return true;
  };

  const completeFirstLogin = async (newPassword: string): Promise<boolean> => {
    if (!session?.user) return false;
    const passwordChanged = await changePassword(newPassword);
    if (passwordChanged) {
      const { error } = await supabase
        .from('profiles')
        .update({ first_login: false })
        .eq('id', session.user.id);

      if (error) {
        toast.error(error.message);
        return false;
      }
      setUserProfile(prevProfile => prevProfile ? { ...prevProfile, first_login: false } : null);
      return true;
    }
    return false;
  };

  const user: User | null = session?.user && userProfile && permissions
    ? { ...session.user, ...userProfile, permissions }
    : null;

  const isAuthenticated = !!session?.user && !!userProfile && !isLoadingPermissions;
  const isAdmin = userProfile?.role === "admin";
  const userStoreId = userProfile?.store_id;

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