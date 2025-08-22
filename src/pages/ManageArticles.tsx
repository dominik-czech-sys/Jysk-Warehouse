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
import { useArticles, Article } from "@/data/articles";
import { Link } from "react-router-dom";
import { ArrowLeft, PlusCircle, Edit, Trash2 } from "lucide-react";
import { ArticleFormDialog } from "@/components/ArticleFormDialog";
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

const ManageArticles = () => {
  const { articles, addArticle, updateArticle, deleteArticle } = useArticles();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDeleteId, setArticleToDeleteId] = useState<string | null>(null);

  const handleAddArticle = (newArticle: Article) => {
    if (articles.some(article => article.id === newArticle.id)) {
      toast.error(`Article with ID ${newArticle.id} already exists.`);
      return;
    }
    addArticle(newArticle);
    toast.success(`Article ${newArticle.id} added successfully!`);
  };

  const handleEditArticle = (updatedArticle: Article) => {
    updateArticle(updatedArticle);
    toast.success(`Article ${updatedArticle.id} updated successfully!`);
  };

  const handleDeleteArticle = (id: string) => {
    setArticleToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteArticle = () => {
    if (articleToDeleteId) {
      deleteArticle(articleToDeleteId);
      toast.success(`Article ${articleToDeleteId} deleted successfully!`);
      setArticleToDeleteId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Articles</h1>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Article
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Shelf</TableHead>
              <TableHead>Shelf Number</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.id}</TableCell>
                <TableCell>{article.name}</TableCell>
                <TableCell>{article.shelf}</TableCell>
                <TableCell>{article.shelfNumber}</TableCell>
                <TableCell>{article.location}</TableCell>
                <TableCell>{article.floor}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    onClick={() => {
                      setEditingArticle(article);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteArticle(article.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {articles.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">No articles found. Add a new one!</p>
        )}
      </div>

      <ArticleFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddArticle}
        article={null} // No article for adding
      />

      <ArticleFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingArticle(null);
        }}
        onSubmit={handleEditArticle}
        article={editingArticle}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete article{" "}
              <span className="font-semibold">{articleToDeleteId}</span> from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteArticle}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageArticles;