import React, { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HelpPost } from "@/data/helpPosts";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FAQSectionProps {
  helpPosts: HelpPost[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ helpPosts }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = useMemo(() => {
    const generalPosts = helpPosts.filter(post => post.targetAudience === "all");
    if (!searchTerm) {
      return generalPosts;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return generalPosts.filter(
      (post) =>
        t(post.title).toLowerCase().includes(lowerCaseSearchTerm) ||
        t(post.content).toLowerCase().includes(lowerCaseSearchTerm) ||
        post.keywords.some((keyword) => keyword.toLowerCase().includes(lowerCaseSearchTerm)) ||
        t(post.category).toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, helpPosts, t]);

  // Group posts by category for better organization
  const groupedPosts = useMemo(() => {
    const groups: Record<string, HelpPost[]> = {};
    filteredPosts.forEach(post => {
      const categoryName = t(post.category);
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(post);
    });
    return groups;
  }, [filteredPosts, t]);

  const sortedCategories = useMemo(() => Object.keys(groupedPosts).sort(), [groupedPosts]);

  return (
    <div className="w-full">
      <div className="flex w-full items-center space-x-2 mb-6">
        <Input
          type="text"
          placeholder={t("common.enterKeywords")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>

      <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
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
    </div>
  );
};