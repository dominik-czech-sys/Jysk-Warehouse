import React, { useState } from "react";
import { useAnnouncements, Announcement } from "@/data/announcements";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { AnnouncementFormDialog } from "@/components/AnnouncementFormDialog";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

export const AnnouncementManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const { announcements, isLoading, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { hasPermission } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (announcementToDelete) {
      await deleteAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleFormSubmit = async (formData: Partial<Announcement>) => {
    if (formData.id) {
      await updateAnnouncement(formData as Announcement);
    } else {
      await addAnnouncement(formData as any);
    }
  };

  if (!hasPermission("announcement:manage")) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t("common.announcement.managementTitle")}</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="h-4 w-4 mr-2" /> {t("common.announcement.add")}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.announcement.title")}</TableHead>
              <TableHead>{t("common.announcement.author")}</TableHead>
              <TableHead>{t("common.announcement.date")}</TableHead>
              <TableHead className="text-right">{t("common.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">{t("common.announcement.loading")}</TableCell></TableRow>
            ) : (
              announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell>{announcement.profiles?.username || t("common.unknown")}</TableCell>
                  <TableCell>{format(new Date(announcement.created_at), "d. M. yyyy", { locale: cs })}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(announcement)} className="mr-2"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(announcement)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AnnouncementFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        announcement={editingAnnouncement}
      />
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.announcement.confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.announcement.confirmDeleteDescription", { title: announcementToDelete?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};