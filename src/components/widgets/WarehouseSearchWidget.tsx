import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/contexts/DashboardContext";
import { DashboardWidget } from "@/components/DashboardWidget";

interface WarehouseSearchWidgetProps {
  id: string;
}

export const WarehouseSearchWidget: React.FC<WarehouseSearchWidgetProps> = ({ id }) => {
  const [articleId, setArticleId] = useState("");
  const { t } = useTranslation();
  // In a real app, this would likely use a context or state management to pass the search result
  // to the WarehouseLocationDisplayWidget. For now, it's a standalone UI component.

  const handleSearch = () => {
    if (articleId.trim()) {
      // This is where you would trigger the search logic
      console.log("Searching for:", articleId.trim().toUpperCase());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <DashboardWidget id={id} title="common.searchArticleLocation">
      <div className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder={t("common.enterArticleId")}
          value={articleId}
          onChange={(e) => setArticleId(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button type="submit" size="sm" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </DashboardWidget>
  );
};