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
import { Textarea } from "@/components/ui/textarea"; // Correct import for Textarea
import { HelpPost } from "@/data/helpPosts";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components

interface HelpPostFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: HelpPost) => boolean;
  post?: HelpPost | null;
}

export const HelpPostFormDialog: React.FC<HelpPostFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  post,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<HelpPost>({
    id: "",
    title: "",
    content: "",
    keywords: [],
    category: "",
    targetAudience: "all", // Default for new posts
  });
  const [keywordsInput, setKeywordsInput] = useState("");

  useEffect(() => {
    if (post) {
      setFormData(post);
      setKeywordsInput(post.keywords.join(", "));
    } else {
      setFormData({
        id: "",
        title: "",
        content: "",
        keywords: [],
        category: "",
        targetAudience: "all", // Default for new posts
      });
      setKeywordsInput("");
    }
  }, [post, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordsInput(e.target.value);
  };

  const handleTargetAudienceChange = (value: "all" | "admin") => {
    setFormData((prev) => ({ ...prev, targetAudience: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.title.trim() || !formData.content.trim() || !formData.category.trim()) {
      toast.error(t("common.fillAllHelpPostFields"));
      return;
    }

    const finalKeywords = keywordsInput.split(",").map(kw => kw.trim()).filter(kw => kw !== "");
    const finalFormData = { ...formData, keywords: finalKeywords };

    if (onSubmit(finalFormData)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? t("common.editHelpPost") : t("common.addHelpPost")}</DialogTitle>
          <DialogDescription>
            {post ? t("common.editHelpPostDescription") : t("common.addHelpPostDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="sm:text-right">
              {t("common.helpPostId")}
            </Label>
            <Input
              id="id"
              value={formData.id}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!post}
              placeholder="Např. HP-001"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="sm:text-right">
              {t("common.helpPostTitle")}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Např. Jak vyhledat artikl"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="sm:text-right">
              {t("common.category")}
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Např. Artikly, Skenování"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="sm:text-right pt-2">
              {t("common.content")}
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={handleChange}
              className="col-span-3 min-h-[100px]"
              placeholder="Zde napište obsah článku nápovědy..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="keywordsInput" className="sm:text-right">
              {t("common.keywords")}
            </Label>
            <Input
              id="keywordsInput"
              value={keywordsInput}
              onChange={handleKeywordsChange}
              className="col-span-3"
              placeholder="Klíčová slova oddělená čárkou (např. vyhledat, artikl, sklad)"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAudience" className="sm:text-right">
              {t("common.targetAudience")}
            </Label>
            <Select onValueChange={handleTargetAudienceChange} value={formData.targetAudience} >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("common.selectTargetAudience")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.audienceAllUsers")}</SelectItem>
                <SelectItem value="admin">{t("common.audienceAdminOnly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="col-span-full mt-4">
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {post ? t("common.saveChanges") : t("common.addHelpPost")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};