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
import { ArrowLeft, PlusCircle, Edit, Trash2, ScrollText, Store as StoreIcon, Copy, Users as UsersIcon, Package, Warehouse as WarehouseIcon } from "lucide-react";
import { UserFormDialog } from "@/components/UserFormDialog";
import { StoreFormDialog } from "@/components/StoreFormDialog";
import { ArticleCopyDialog } from "@/components/ArticleCopyDialog";
import { DefaultArticleManager } from "@/components/DefaultArticleManager";
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
import { useStores, Store } from "@/data/stores"; // Import Store type
import { useArticles } from "@/data/articles";
import { useShelfRacks } from "@/data/shelfRacks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SiteDashboard: React.FC = () => {
  const { allUsers, addUser, updateUser, deleteUser, isAdmin, hasPermission } = useAuth();
  const { stores, addStore, updateStore, deleteStore } = useStores();
  const { allArticles } = useArticles();
  const { allShelfRacks } = useShelfRacks();

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

  // Statistics
  const totalUsers = allUsers.length;
  const totalStores = stores.length;
  const totalArticles = allArticles.length;
  const totalRacks = allShelfRacks.length;

  const handleAddUser = (newUser: User) => {
    addUser(newUser);
  };

  const handleEditUser = (updatedUser: User) => {
    updateUser(updatedUser);
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
    setIsDeleteStoreDialogOpen(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Card className="p-6 text-center">
          <CardTitle className="text-2xl font-bold text-red-600">Přístup odepřen</CardTitle>
          <CardContent className="mt-4">
            <p className="text-gray-700 dark:text-gray-300">Nemáte oprávnění k zobrazení této stránky.</p>
            <Link to="/" className="mt-4 inline-block">
              <Button className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">Zpět na hlavní stránku</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na hlavní stránku
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Site Dashboard (Admin)</h1>
          <div className="w-full sm:w-auto"></div> {/* Placeholder for alignment */}
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Celkem obchodů</CardTitle>
              <StoreIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStores}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Celkem uživatelů</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Celkem článků</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArticles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Celkem regálů</CardTitle>
              <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRacks}</div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Store Management Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Správa obchodů</h2>
            <div className="flex space-x-2">
              {hasPermission("store:create") && (
                <Button onClick={() => setIsAddStoreDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                  <PlusCircle className="h-4 w-4 mr-2" /> Přidat obchod
                </Button>
              )}
              {hasPermission("article:copy_from_store") && (
                <Button onClick={() => setIsArticleCopyDialogOpen(true)} variant="outline" className="flex items-center">
                  <Copy className="h-4 w-4 mr-2" /> Kopírovat články
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">ID Obchodu</TableHead>
                  <TableHead className="min-w-[200px]">Název Obchodu</TableHead>
                  <TableHead className="text-right min-w-[100px]">Akce</TableHead>
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
            <p className="text-center text-muted-foreground mt-4">Žádné obchody nebyly nalezeny.</p>
          )}
        </div>

        <Separator className="my-8" />

        {/* User Management Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Správa uživatelů</h2>
            <div className="flex space-x-2">
              {hasPermission("log:view") && (
                <Button onClick={() => setIsLogViewerOpen(true)} className="flex items-center bg-gray-600 hover:bg-gray-700 text-white">
                  <ScrollText className="h-4 w-4 mr-2" /> Zobrazit Log
                </Button>
              )}
              {hasPermission("user:create") && (
                <Button onClick={() => setIsAddUserDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                  <PlusCircle className="h-4 w-4 mr-2" /> Přidat uživatele
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Uživatelské jméno</TableHead>
                  <TableHead className="min-w-[100px]">Role</TableHead>
                  <TableHead className="min-w-[100px]">ID Skladu</TableHead>
                  <TableHead className="text-right min-w-[100px]">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.role === "admin" ? "Admin" : user.role}</TableCell>
                    <TableCell>{user.storeId || "N/A"}</TableCell>
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission("user:delete") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.username)}
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
          {allUsers.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">Žádní uživatelé nebyli nalezeni.</p>
          )}
        </div>

        <Separator className="my-8" />

        {/* Default Article Management Section */}
        {hasPermission("default_articles:manage") && (
          <div className="mb-8">
            <DefaultArticleManager />
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
            <AlertDialogTitle>Jste si naprosto jisti?</AlertDialogTitle>
            <AlertDialogDescription>
              Tuto akci nelze vrátit zpět. Tímto trvale smažete uživatele{" "}
              <span className="font-semibold">{userToDeleteUsername}</span> ze systému.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Pokračovat</AlertDialogAction>
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
            <AlertDialogTitle>Jste si naprosto jisti?</AlertDialogTitle>
            <AlertDialogDescription>
              Tuto akci nelze vrátit zpět. Tímto trvale smažete obchod{" "}
              <span className="font-semibold">{storeToDeleteId}</span> ze systému.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStore} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Pokračovat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ArticleCopyDialog
        isOpen={isArticleCopyDialogOpen}
        onClose={() => setIsArticleCopyDialogOpen(false)}
      />

      <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />
    </div>
  );
};

export default SiteDashboard;