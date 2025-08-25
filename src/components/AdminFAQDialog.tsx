import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HelpPost, helpPosts } from "@/data/helpPosts"; // Import all help posts
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminFAQDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminFAQDialog: React.FC<AdminFAQDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAdminPosts = useMemo(() => {
    const adminPosts = helpPosts.filter(post => post.targetAudience === "admin");
    if (!searchTerm) {
      return adminPosts;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return adminPosts.filter(
      (post) =>
        t(post.title).toLowerCase().includes(lowerCaseSearchTerm) ||
        t(post.content).toLowerCase().includes(lowerCaseSearchTerm) ||
        post.keywords.some((keyword) => keyword.toLowerCase().includes(lowerCaseSearchTerm)) ||
        t(post.category).toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, t]);

  // Group posts by category for better organization
  const groupedPosts = useMemo(() => {
    const groups: Record<string, HelpPost[]> = {};
    filteredAdminPosts.forEach(post => {
      const categoryName = t(post.category);
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(post);
    });
    return groups;
  }, [filteredAdminPosts, t]);

  const sortedCategories = useMemo(() => Object.keys(groupedPosts).sort(), [groupedPosts]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.adminFaq.adminTutorialsTitle")}</DialogTitle>
          <DialogDescription>{t("common.adminFaq.adminTutorialsDescription")}</DialogDescription>
        </DialogHeader>
        <div className="flex w-full items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder={t("common.enterKeywords")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <ScrollArea className="flex-grow w-full rounded-md border p-4">
          {Object.keys(groupedPosts).length === 0 ? (
            <p className="text-center text-muted-foreground">{t("common.noHelpPostsFound")}</p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {sortedCategories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold text-jyskBlue-dark dark:text-jyskBlue-light mb-3">{category}</h3>
                  {groupedPosts[category].map((post) => (
                    <AccordionItem key={post.id} value={post.id}>
                      <AccordionTrigger className="text-left">{t(post.title)}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {t(post.content)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>{t("common.keywords")}:</strong> {post.keywords.join(", ")}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              ))}
            </Accordion>
          )}
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline">
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};