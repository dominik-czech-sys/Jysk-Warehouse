import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  store_id: string;
  is_approved: boolean;
}

const ManageUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    // In a real-world scenario, this should be an RPC call to a secure function.
    // For this context, we fetch directly, protected by RLS (admins can see all).
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) {
      toast.error(t("common.errorFetchingUsers"));
      console.error(error);
    } else {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApproveUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", userId);

    if (error) {
      toast.error(t("common.errorApprovingUser"));
    } else {
      toast.success(t("common.userApprovedSuccess"));
      fetchUsers(); // Refresh the list
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t("common.accessDenied")}</p>
        <Link to="/"><Button>{t("common.backToMainPage")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/admin/site-dashboard">
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />{t("common.backToAdminDashboard")}</Button>
          </Link>
          <h1 className="text-3xl font-bold">{t("common.userManagement")}</h1>
          <div/>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("common.userList")}</CardTitle>
            <CardDescription>{t("common.userListDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.username")}</TableHead>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.role")}</TableHead>
                  <TableHead>{t("common.storeId")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">{t("common.loadingUsers")}</TableCell></TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.store_id}</TableCell>
                      <TableCell>
                        {user.is_approved ? (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-4 w-4 mr-1"/>{t("common.approved")}</Badge>
                        ) : (
                          <Badge variant="secondary"><Clock className="h-4 w-4 mr-1"/>{t("common.pendingApproval")}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!user.is_approved && (
                          <Button size="sm" onClick={() => handleApproveUser(user.id)}>
                            {t("common.approve")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageUsersPage;