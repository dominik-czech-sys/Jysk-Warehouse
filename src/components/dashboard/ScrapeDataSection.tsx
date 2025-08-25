import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const ScrapeDataSection: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleScrape = async () => {
    setIsLoading(true);
    toast.info(t("common.scrape.starting"));

    try {
      const { data, error } = await supabase.functions.invoke("scrape-jysk");

      if (error) {
        throw error;
      }

      toast.success(t("common.scrape.success", { count: data.count || 0 }));
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error(t("common.scrape.error", { message: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("common.scrape.title")}</CardTitle>
        <CardDescription>{t("common.scrape.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t("common.scrape.warning")}
        </p>
        <Button onClick={handleScrape} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.scrape.loading")}
            </>
          ) : (
            <>
              <DownloadCloud className="mr-2 h-4 w-4" />
              {t("common.scrape.button")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};