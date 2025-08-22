import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Layers } from "lucide-react";
import { Article } from "@/data/articles";

interface WarehouseLocationDisplayProps {
  article: Article | null;
}

export const WarehouseLocationDisplay: React.FC<WarehouseLocationDisplayProps> = ({ article }) => {
  if (!article) {
    return (
      <Card className="w-full max-w-sm text-center p-6">
        <CardContent>
          <p className="text-muted-foreground">Search for an article to see its location.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-primary">Article: {article.id}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center space-x-3 text-lg">
          <MapPin className="h-6 w-6 text-blue-500" />
          <span className="font-semibold">Location:</span>
          <span className="text-gray-700 dark:text-gray-300">{article.location}</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-lg">
          <Layers className="h-6 w-6 text-green-500" />
          <span className="font-semibold">Floor:</span>
          <span className="text-gray-700 dark:text-gray-300">{article.floor}</span>
        </div>
      </CardContent>
    </Card>
  );
};