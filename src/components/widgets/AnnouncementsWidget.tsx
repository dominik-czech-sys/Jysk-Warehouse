import React from "react";
import { useAnnouncements } from "@/data/announcements";
import { useTranslation } from "react-i18next";
import { DashboardWidget } from "@/components/DashboardWidget";
import { Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface AnnouncementsWidgetProps {
  id: string;
}

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ id }) => {
  const { t } = useTranslation();
  const { announcements } = useAnnouncements();

  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <DashboardWidget id={id} title="common.widgets.latestAnnouncements">
      {latestAnnouncements.length > 0 ? (
        <div className="space-y-2">
          <ul className="space-y-2">
            {latestAnnouncements.map(announcement => (
              <li key={announcement.id} className="text-sm border-b pb-1 last:border-b-0">
                <div className="flex justify-between items-start">
                    <p className="font-semibold truncate pr-2">{announcement.title}</p>
                    {announcement.urgency === 'critical' && <Badge variant="destructive">{t('common.announcement.urgencyCritical')}</Badge>}
                    {announcement.urgency === 'important' && <Badge className="bg-yellow-500 text-white">{t('common.announcement.urgencyImportant')}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{announcement.content}</p>
              </li>
            ))}
          </ul>
           <Link to="/oznameni">
            <Button variant="link" className="p-0 h-auto text-xs">{t("common.widgets.viewAllAnnouncements")}</Button>
          </Link>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground h-full flex flex-col items-center justify-center">
            <Megaphone className="h-8 w-8 text-muted-foreground mb-2" />
            <p>{t("common.widgets.noAnnouncements")}</p>
        </div>
      )}
    </DashboardWidget>
  );
};