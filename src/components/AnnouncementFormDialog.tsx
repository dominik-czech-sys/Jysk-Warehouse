import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Announcement } from "@/data/announcements";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AnnouncementFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (announcement: Partial<Announcement>) => void;
  announcement?: Announcement | null;
}

export const AnnouncementFormDialog: React.FC<AnnouncementFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  announcement,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Announcement>>({});

  useEffect(() => {
    if (announcement) {
      setFormData(announcement);
    } else {
      setFormData({
        title: "",
        content: "",
        target_audience: "all",
        urgency: "normal",
        author_id: user?.id,
      });
    }
  }, [announcement, isOpen, user]);

  const handleChange = (id: keyof Announcement, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error(t("common.announcement.titleContentRequired"));
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{announcement ? t("common.announcement.edit") : t("common.announcement.add")}</DialogTitle>
          <DialogDescription>{announcement ? t("common.announcement.editDescription") : t("common.announcement.addDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">{t("common.announcement.title")}</Label>
            <Input id="title" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">{t("common.content")}</Label>
            <Textarea id="content" value={formData.content || ""} onChange={(e) => handleChange("content", e.target.value)} className="col-span-3" rows={6} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="urgency" className="text-right">{t("common.announcement.urgency")}</Label>
            <Select onValueChange={(value) => handleChange("urgency", value)} value={formData.urgency}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">{t("common.announcement.urgencyNormal")}</SelectItem>
                <SelectItem value="important">{t("common.announcement.urgencyImportant")}</SelectItem>
                <SelectItem value="critical">{t("common.announcement.urgencyCritical")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">{announcement ? t("common.saveChanges") : t("common.announcement.publish")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};