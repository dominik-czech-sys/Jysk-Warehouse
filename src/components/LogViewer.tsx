"use client";

import React, { useState, useMemo } from "react";
import { useLog, LogEntry } from "@/contexts/LogContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cs, enUS, sk } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const logCategories = {
  "Full Log": [],
  "Login": ["Uživatel se přihlásil", "Neúspěšné přihlášení"],
  "LogOff": ["Uživatel se odhlásil"],
  "User Add": ["Uživatel přidán", "Pokus o přidání existujícího uživatele"],
  "User Edit": ["Uživatel aktualizován"],
  "User Delete": ["Uživatel smazán"],
  "Article Add": ["Artikl přidán", "Artikl přidán (hromadné přidání)"],
  "Article Edit": ["Artikl aktualizován", "Artikl aktualizován (hromadné přidání)"],
  "Article Delete": ["Artikl smazán"],
  "Article Search": ["Artikl vyhledán", "Čárový kód naskenován", "Čárový kód naskenován pro hromadné přidání"],
  "Rack Add": ["Regál přidán", "Pokus o přidání existujícího regálu"],
  "Rack Edit": ["Regál aktualizován"],
  "Rack Delete": ["Regál smazán"],
  "Store Add": ["Obchod přidán", "Pokus o přidání existujícího obchodu"],
  "Store Edit": ["Obchod aktualizován"],
  "Store Delete": ["Obchod smazán"],
  "Default Articles Add": ["Výchozí artikly přidány do obchodu"],
  "Article Copy": ["Artikly zkopírovány"],
};

const logCategoryTranslationKeys: Record<keyof typeof logCategories, string> = {
  "Full Log": "logCategory.fullLog",
  "Login": "logCategory.login",
  "LogOff": "logCategory.logOff",
  "User Add": "logCategory.userAdd",
  "User Edit": "logCategory.userEdit",
  "User Delete": "logCategory.userDelete",
  "Article Add": "logCategory.articleAdd",
  "Article Edit": "logCategory.articleEdit",
  "Article Delete": "logCategory.articleDelete",
  "Article Search": "logCategory.articleSearch",
  "Rack Add": "logCategory.rackAdd",
  "Rack Edit": "logCategory.rackEdit",
  "Rack Delete": "logCategory.rackDelete",
  "Store Add": "logCategory.storeAdd",
  "Store Edit": "logCategory.storeEdit",
  "Store Delete": "logCategory.storeDelete",
  "Default Articles Add": "logCategory.defaultArticlesAdd",
  "Article Copy": "logCategory.articleCopy",
};

export const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const { logEntries, clearLog } = useLog();
  const { t, i18n } = useTranslation();

  const [selectedFilter, setSelectedFilter] = useState<keyof typeof logCategories>("Full Log");

  const currentLocale = useMemo(() => {
    switch (i18n.language) {
      case "en":
        return enUS;
      case "sk":
        return sk;
      case "cs":
      default:
        return cs;
    }
  }, [i18n.language]);

  const filteredAndGroupedLogs = useMemo(() => {
    let filteredLogs = logEntries;

    if (selectedFilter !== "Full Log") {
      const allowedActions = logCategories[selectedFilter];
      filteredLogs = logEntries.filter(entry => allowedActions.includes(entry.action));
    }

    const grouped: Record<string, LogEntry[]> = {};
    filteredLogs.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayKey = format(date, "yyyy-MM-dd");
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(entry);
    });

    const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return sortedDays.map(day => ({
      date: day,
      entries: grouped[day].sort((a, b) => b.timestamp - a.timestamp),
    }));
  }, [logEntries, selectedFilter]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between pb-2 space-y-2 sm:space-y-0">
          <CardTitle className="text-xl sm:text-2xl font-bold">{t("common.logActivity")}</CardTitle>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Select onValueChange={(value: keyof typeof logCategories) => setSelectedFilter(value)} value={selectedFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("common.selectLogType")} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(logCategories).map(category => (
                  <SelectItem key={category} value={category}>
                    {t(logCategoryTranslationKeys[category])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="destructive" size="sm" onClick={clearLog} className="w-full sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2" /> {t("common.clearLog")}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
              {t("common.close")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 flex flex-col min-h-0">
          <ScrollArea className="h-full w-full rounded-md border p-4">
            {filteredAndGroupedLogs.length === 0 ? (
              <p className="text-center text-muted-foreground">{t("common.noRecordsForFilter")}</p>
            ) : (
              filteredAndGroupedLogs.map(dayGroup => (
                <div key={dayGroup.date} className="mb-6">
                  <h3 className="sticky top-0 bg-white dark:bg-gray-800 py-2 text-base sm:text-lg font-bold text-jyskBlue-dark dark:text-jyskBlue-light border-b mb-3">
                    {format(new Date(dayGroup.date), "EEEE, d. MMMM yyyy", { locale: currentLocale })}
                  </h3>
                  {dayGroup.entries.map((entry) => (
                    <div key={entry.id} className="mb-4 last:mb-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <span className="font-semibold">{format(new Date(entry.timestamp), "HH:mm:ss", { locale: currentLocale })}</span> -{" "}
                        <span className="font-semibold text-jyskBlue-dark dark:text-jyskBlue-light">{entry.user}</span>
                      </p>
                      <p className="text-sm sm:text-base font-medium">{entry.action}</p>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-xs overflow-x-auto">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      )}
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};