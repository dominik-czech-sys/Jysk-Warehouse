import React, { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { WarehouseSearch } from "@/components/WarehouseSearch";
import { WarehouseLocationDisplay } from "@/components/WarehouseLocationDisplay";
import { Article, warehouseArticles } from "@/data/articles";
import { toast } from "sonner";

const Index = () => {
  const [foundArticle, setFoundArticle] = useState<Article | null>(null);

  const handleSearch = (articleId: string) => {
    const article = warehouseArticles.find((a) => a.id === articleId);
    if (article) {
      setFoundArticle(article);
      toast.success(`Article ${articleId} found!`);
    } else {
      setFoundArticle(null);
      toast.error(`Article ${articleId} not found.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Warehouse Navigator</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Enter an article ID to find its location and floor.
        </p>
      </div>
      <WarehouseSearch onSearch={handleSearch} />
      <div className="mt-8">
        <WarehouseLocationDisplay article={foundArticle} />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;