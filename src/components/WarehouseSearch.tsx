import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface WarehouseSearchProps {
  onSearch: (articleId: string) => void;
}

export const WarehouseSearch: React.FC<WarehouseSearchProps> = ({ onSearch }) => {
  const [articleId, setArticleId] = useState("");
  const { t } = useTranslation(); // Initialize useTranslation

  const handleSearch = () => {
    if (articleId.trim()) {
      onSearch(articleId.trim().toUpperCase());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2 p-4">
      <Input
        type="text"
        placeholder={t("common.enterArticleId")}
        value={articleId}
        onChange={(e) => setArticleId(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-grow"
      />
      <Button type="submit" onClick={handleSearch} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
        <Search className="h-4 w-4 mr-2" /> {t("common.search")}
      </Button>
    </div>
  );
};