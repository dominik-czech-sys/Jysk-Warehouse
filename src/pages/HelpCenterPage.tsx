import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, BookOpen, X } from "lucide-react"; // Import X
import { helpPosts, HelpPost } from "@/data/helpPosts";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const HelpCenterPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<HelpPost | null>(null);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) {
      return helpPosts;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return helpPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        post.content.toLowerCase().includes(lowerCaseSearchTerm) ||
        post.keywords.some((keyword) => keyword.toLowerCase().includes(lowerCaseSearchTerm)) ||
        post.category.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.helpCenter")}</h1>
          <div className="w-full sm:w-auto"></div> {/* Placeholder for alignment */}
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.searchHelp")}</CardTitle>
            <CardDescription>{t("common.searchHelpDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder={t("common.enterKeywords")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Button type="button" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                <Search className="h-4 w-4" />
                <span className="sr-only">{t("common.search")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-4 sm:my-6" />

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("common.helpPosts")}</h2>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {filteredPosts.length === 0 ? (
            <p className="text-center text-muted-foreground">{t("common.noHelpPostsFound")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPost(post)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-jyskBlue-dark dark:text-jyskBlue-light">{post.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{t("common.category")}: {post.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-2 sm:p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{selectedPost.title}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)} className="text-foreground hover:bg-muted">
                <X className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground"><strong>{t("common.category")}:</strong> {selectedPost.category}</p>
              <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedPost.content}</p>
              <p className="text-xs text-muted-foreground"><strong>{t("common.keywords")}:</strong> {selectedPost.keywords.join(", ")}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HelpCenterPage;