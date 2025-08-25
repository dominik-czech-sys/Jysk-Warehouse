import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, PlusCircle, Edit, Trash2, ScrollText, Store as StoreIcon, Copy, Users as UsersIcon, Package, Warehouse as WarehouseIcon, Download, LifeBuoy, BookOpen, LayoutGrid, Plus } from "lucide-react"; // Added LayoutGrid, Plus icons
import { UserFormDialog } from "@/components/UserFormDialog";
import { StoreFormDialog } from "@/components/StoreFormDialog";
import { ArticleCopyDialog } from "@/components/ArticleCopyDialog";
import { AdminFAQDialog } from "@/components/AdminFAQDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/data/users";
import { LogViewer } from "@/components/LogViewer";
import { useStores, Store } from "@/data/stores";
import { useArticles } from "@/data/articles";
import { useShelfRacks } from "@/data/shelfRacks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/contexts/DashboardContext"; // Import useDashboard
import { DashboardWidget } from "@/components/DashboardWidget"; // Import DashboardWidget
import { ArticleOverviewWidget } from "@/components/widgets/ArticleOverviewWidget"; // Import ArticleOverviewWidget
import { LowStockAlertsWidget } from "@/components/widgets/LowStockAlertsWidget"; // Import LowStockAlertsWidget
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components

// Map widget component names to actual components
const widgetComponents: { [key: string]: React.FC<{ id: string }> } = {
  ArticleOverviewWidget: ArticleOverviewWidget,
  LowStockAlertsWidget: LowStockAlertsWidget,
};

const SiteDashboard: React.FC = () => {
  const { allUsers, addUser, updateUser, deleteUser, isAdmin, hasPermission, userStoreId, user: currentUser } = useAuth();
  const { stores, addStore, updateStore, deleteStore } = useStores();
  const { allArticles } = useArticles();
  const { allShelfRacks } = useShelfRacks();
  const { t } = useTranslation();
  const { widgets, addWidget, removeWidget, availableWidgets } = useDashboard(); // Use dashboard context

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [userToDeleteUsername, setUserToDeleteUsername] = useState<string | null>(null);

  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [isEditStoreDialogOpen, setIsEditStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isDeleteStoreDialogOpen, setIsDeleteStoreDialogOpen] = useState(false);
  const [storeToDeleteId, setStoreToDeleteId] = useState<string | null>(null);

  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  const [isArticleCopyDialogOpen, setIsArticleCopyDialogOpen] = useState(false);
  const [isAdminFAQDialogOpen, setIsAdminFAQDialogOpen] = useState(false);

  // Statistics
  const totalUsers = allUsers.length;
  const totalStores = stores.length;
  const totalArticles = allArticles.length;
  const totalRacks = allShelfRacks.length;

  const handleAddUser = async (newUser: User) => {
    await addUser(newUser);
  };

  const handleEditUser = async (updatedUser: User) => {
    await updateUser(updatedUser);
  };

  const handleDeleteUser = (username: string) => {
    setUserToDeleteUsername(username);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDeleteUsername) {
      deleteUser(userToDeleteUsername);
      setUserToDeleteUsername(null);
    }
    setIsDeleteUserDialogOpen(false);
  };

  const handleAddStore = (newStore: Store, addDefaultArticles: boolean) => {
    return addStore(newStore, addDefaultArticles);
  };

  const handleEditStore = (updatedStore: Store) => {
    return updateStore(updatedStore);
  };

  const handleDeleteStore = (id: string) => {
    setStoreToDeleteId(id);
    setIsDeleteStoreDialogOpen(true);
  };

  const confirmDeleteStore = () => {
    if (storeToDeleteId) {
      deleteStore(storeToDeleteId);
      setStoreToDeleteId(null);
    }
    setIsDeleteUserDialogOpen(false);
  };

  // Filter users based on current user's role and storeId
  const filteredUsers = isAdmin
    ? allUsers
    : allUsers.filter(user => user.storeId === userStoreId);

  // Function to translate role names
  const translateRole = (role: User['role'] | "unknown") => {
    switch (role) {
      case "admin": return t("common.admin");
      case "vedouci_skladu": return t("common.warehouseManager");
      case "store_manager": return t("common.storeManager");
      case "deputy_store_manager": return t("common.deputyStoreManager");
      case "ar_assistant_of_sale": return t("common.arAssistantOfSale");
      case "skladnik": return t("common.warehouseWorker");
      default: return t("common.unknown");
    }
  };

  if (!hasPermission("store:view") && !hasPermission("user:view")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
        <Card className="p-4 sm:p-6 text-center">
          <CardTitle className="text-xl sm:text-2xl font-bold text-red-600">{t("common.accessDenied")}</CardTitle>
          <CardContent className="mt-4">
            <p className="text-gray-700 dark:text-gray-300">{t("common.noPermission")}</p>
            <Link to="/" className="mt-4 inline-block">
              <Button className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">{t("common.backToMainPage")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.siteDashboard")} ({isAdmin ? t("common.admin") : translateRole(currentUser?.role || "unknown")})</h1>
          <div className="w-full sm:w-auto"></div> {/* Placeholder for alignment */}
        </div>

        {/* Dashboard Widgets Section */}
        <div className="mb-6 sm:mb-8 w-full animate-slide-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.dashboardOverview")}</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <LayoutGrid className="h-4 w-4 mr-2" /> {t("common.manageWidgets")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableWidgets.map((widget) => (
                  <DropdownMenuItem key={widget.id} onClick={() => addWidget(widget.id)}>
                    <Plus className="h-4 w-4 mr-2" /> {t(widget.name)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map((widgetConfig) => {
              const WidgetComponent = widgetComponents[widgetConfig.component];
              if (!WidgetComponent) return null;
              return (
                <div key={widgetConfig.id} className="h-full">
                  <WidgetComponent id={widgetConfig.id} />
                </div>
              );
            })}
          </div>
          {widgets.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">{t("common.noWidgetsAdded")}</p>
          )}
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Store Management Section */}
        {hasPermission("store:view") && (
          <div className="mb-6 sm:mb-8 w-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.storeManagement")}</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                {hasPermission("store:create") && (
                  <Button onClick={() => setIsAddStoreDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                    <PlusCircle className="h-4 w-4 mr-2" /> {t("common.addStore")}
                  </Button>
                )}
                {hasPermission("article:copy_from_store") && (
                  <Button onClick={() => setIsArticleCopyDialogOpen(true)} variant="outline" className="flex items-center w-full">
                    <Copy className="h-4 w-4 mr-2" /> {t("common.copyArticles")}
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">{t("common.storeId")}</TableHead>
                    <TableHead className="min-w-[200px]">{t("common.storeNameLabel")}</TableHead>
                    <TableHead className="text-right min-w-[100px]">{t("common.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.id}</TableCell>
                      <TableCell>{store.name}</TableCell>
                      <TableCell className="text-right">
                        {hasPermission("store:update") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setEditingStore(store);
                              setIsEditStoreDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission("store:delete") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStore(store.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {stores.length === 0 && (
              <p className="text-center text-muted-foreground mt-4">{t("common.noStoresFound")}</p>
            )}
          </div>
        )}

        <Separator className="my-6 sm:my-8" />

        {/* User Management Section */}
        {hasPermission("user:view") && (
          <div className="mb-6 sm:mb-8 w-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.userManagement")}</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                {hasPermission("user:create") && (
                  <Button onClick={() => setIsAddUserDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                    <PlusCircle className="h-4 w-4 mr-2" /> {t("common.addUser")}
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">{t("common.username")}</TableHead>
                    <TableHead className="min-w-[100px]">{t("common.role")}</TableHead>
                    <TableHead className="min-w-[100px]">{t("common.storeId")}</TableHead>
                    <TableHead className="text-right min-w-[100px]">{t("common.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{translateRole(user.role)}</TableCell>
                      <TableCell>{user.storeId || t("common.unknown")}</TableCell>
                      <TableCell className="text-right">
                        {hasPermission("user:update") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditUserDialogOpen(true);
                            }}
                            disabled={
                              (!isAdmin && user.role === "admin") ||
                              (!isAdmin && user.storeId !== currentUser?.storeId)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission("user:delete") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.username)}
                            disabled={
                              (!isAdmin && user.role === "admin") ||
                              (!isAdmin && user.storeId !== currentUser?.storeId) ||
                              (currentUser?.username === user.username)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredUsers.length === 0 && (
              <p className="text-center text-muted-foreground mt-4">{t("common.noUsersFound")}</p>
            )}
          </div>
        )}

        <Separator className="my-6 sm:my-8" />

        {/* Help Post Management Section */}
        {hasPermission("help_posts:manage") && (
          <div className="mb-6 sm:mb-8 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.helpPostManagement")}</h2>
              <Link to="/admin/help-posts" className="w-full sm:w-auto">
                <Button className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                  <LifeBuoy className="h-4 w-4 mr-2" /> {t("common.manageHelpPosts")}
                </Button>
              </Link>
            </div>
          </div>
        )}

        <Separator className="my-6 sm:my-8" />

        {/* Admin Tutorials Section */}
        {isAdmin && ( // Only show for admins
          <div className="mb-6 sm:mb-8 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.adminFaq.adminTutorialsTitle")}</h2>
              <Button onClick={() => setIsAdminFAQDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                <BookOpen className="h-4 w-4 mr-2" /> {t("common.adminFaq.viewTutorials")}
              </Button>
            </div>
          </div>
        )}

        <Separator className="my-6 sm:my-8" />

        {/* Log Viewer Section */}
        {hasPermission("log:view") && (
          <div className="mb-6 sm:mb-8 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.logActivity")}</h2>
              <Button onClick={() => setIsLogViewerOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                <ScrollText className="h-4 w-4 mr-2" /> {t("common.viewLog")}
              </Button>
            </div>
          </div>
        )}

        <Separator className="my-6 sm:my-8" />

        {/* Export Data Section */}
        {hasPermission("log:view") && (
          <div className="mb-6 sm:mb-8 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.exportData")}</h2>
              <Link to="/export-dat" className="w-full sm:w-auto">
                <Button className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                  <Download className="h-4 w-4 mr-2" /> {t("common.exportData")}
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Dialogs */}
      <UserFormDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onSubmit={handleAddUser}
        user={null}
      />
      <UserFormDialog
        isOpen={isEditUserDialogOpen}
        onClose={() => {
          setIsEditUserDialogOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleEditUser}
        user={editingUser}
      />
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDeleteUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: t("common.confirmDeleteUserDescription", { username: userToDeleteUsername }),
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.continue")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StoreFormDialog
        isOpen={isAddStoreDialogOpen}
        onClose={() => setIsAddStoreDialogOpen(false)}
        onSubmit={handleAddStore}
        store={null}
      />
      <StoreFormDialog
        isOpen={isEditStoreDialogOpen}
        onClose={() => {
          setIsEditStoreDialogOpen(false);
          setEditingStore(null);
        }}
        onSubmit={handleEditStore}
        store={editingStore}
      />
      <AlertDialog open={isDeleteStoreDialogOpen} onOpenChange={setIsDeleteStoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDeleteStoreTitle")}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: t("common.confirmDeleteStoreDescription", { storeId: storeToDeleteId }),
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStore} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.continue")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ArticleCopyDialog
        isOpen={isArticleCopyDialogOpen}
        onClose={() => setIsArticleCopyDialogOpen(false)}
      />

      <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />

      <AdminFAQDialog isOpen={isAdminFAQDialogOpen} onClose={() => setIsAdminFAQDialogOpen(false)} />
    </div>
  );
};

export default SiteDashboard;