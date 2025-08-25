import React from "react";
import { useAnnouncements } from "@/data/announcements";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const AnnouncementsPage: React.FC = () => {
  const { t } = useTranslation();
  const { announcements, isLoading } = useAnnouncements();

  const getUrgencyBadge = (urgency: 'normal' | 'important' | 'critical') => {
    switch (urgency) {
      case 'important': return <Badge className="bg-yellow-500 text-white">{t('common.announcement.urgencyImportant')}</Badge>;
      case 'critical': return <Badge variant="destructive">{t('common.announcement.urgencyCritical')}</Badge>;
      default: return <Badge variant="secondary">{t('common.announcement.urgencyNormal')}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{t("common.announcement.pageTitle")}</h1>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          announcements.map(announcement => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{announcement.title}</CardTitle>
                  {getUrgencyBadge(announcement.urgency)}
                </div>
                <CardDescription>
                  {t("common.announcement.publishedBy", { 
                    author: announcement.profiles?.username || t("common.unknown"),
                    date: format(new Date(announcement.created_at), "d. M. yyyy 'v' HH:mm", { locale: cs })
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;