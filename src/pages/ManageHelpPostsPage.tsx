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
import { ArrowLeft, PlusCircle, Edit, Trash2, LifeBuoy } from "lucide-react";
import { HelpPostFormDialog } from "@/components/HelpPostFormDialog";
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
import { useHelpPosts } from "@/hooks/useHelpPosts";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { HelpPost } from "@/data/helpPosts";

const ManageHelpPostsPage: React.FC = () => {
  const { helpPosts, addHelpPost, updateHelpPost, deleteHelpPost } = useHelpPosts();
  const { hasPermission } = useAuth();
  const { t } = useTranslation();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<HelpPost | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState<string | null>(null);

  const handleAddHelpPost = (newPost: HelpPost) => {
    return addHelpPost(newPost);
  };

  const handleEditHelpPost = (updatedPost: HelpPost) => {
    return updateHelpPost(updatedPost);
  };

  const handleDeleteHelpPost = (id: string) => {
    setPostToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteHelpPost = () => {
    if (postToDeleteId) {
      deleteHelpPost(postToDeleteId);
      setPostToDeleteId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  if (!hasPermission("help_posts:manage")) {
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
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Link to="/admin/site-dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToAdminDashboard")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.helpPostManagement")}</h1>
          {hasPermission("help_posts:manage") && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" /> {t("common.addHelpPost")}
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">{t("common.helpPostId")}</TableHead>
                <TableHead className="min-w-[150px]">{t("common.helpPostTitle")}</TableHead>
                <TableHead className="min-w-[100px]">{t("common.category")}</TableHead>
                <TableHead className="min-w-[200px]">{t("common.keywords")}</TableHead>
                <TableHead className="text-right min-w-[100px]">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {helpPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.id}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{post.keywords.join(", ")}</TableCell>
                  <TableCell className="text-right">
                    {hasPermission("help_posts:manage") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setEditingPost(post);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {hasPermission("help_posts:manage") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHelpPost(post.id)}
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

        {helpPosts.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">{t("common.noHelpPostsFound")}</p>
        )}
      </div>

      <HelpPostFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddHelpPost}
        post={null}
      />

      <HelpPostFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handleEditHelpPost}
        post={editingPost}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDeleteHelpPostTitle")}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: t("common.confirmDeleteHelpPostDescription", { postId: postToDeleteId }),
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHelpPost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.continue")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageHelpPostsPage;