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
import { cs } from "date-fns/locale"; // Import Czech locale for date formatting

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define log categories and their corresponding action strings
const logCategories = {
  "Full Log": [], // All logs
  "Login": ["Uživatel se přihlásil", "Neúspěšné přihlášení"],
  "LogOff": ["Uživatel se odhlásil"],
  "User Add": ["Uživatel přidán", "Pokus o přidání existujícího uživatele"],
  "User Edit": ["Uživatel aktualizován"],
  "User Delete": ["Uživatel smazán"],
  "Article Add": ["Článek přidán"],
  "Article Edit": ["Článek aktualizován"],
  "Article Delete": ["Článek smazán"],
  "Article Search": ["Článek vyhledán", "Čárový kód naskenován"],
};

export const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const { logEntries, clearLog } = useLog();
  const [selectedFilter, setSelectedFilter] = useState<keyof typeof logCategories>("Full Log");

  const filteredAndGroupedLogs = useMemo(() => {
    let filteredLogs = logEntries;

    if (selectedFilter !== "Full Log") {
      const allowedActions = logCategories[selectedFilter];
      filteredLogs = logEntries.filter(entry => allowedActions.includes(entry.action));
    }

    // Group by day
    const grouped: Record<string, LogEntry[]> = {};
    filteredLogs.forEach(entry => {
      const date = new Date(entry.timestamp); // Create Date object from number
      const dayKey = format(date, "yyyy-MM-dd");
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(entry);
    });

    // Sort days in descending order
    const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return sortedDays.map(day => ({
      date: day,
      entries: grouped[day].sort((a, b) => b.timestamp - a.timestamp), // Sort entries within each day by timestamp number
    }));
  }, [logEntries, selectedFilter]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">Log Aktivity</CardTitle>
          <div className="flex items-center space-x-2">
            <Select onValueChange={(value: keyof typeof logCategories) => setSelectedFilter(value)} value={selectedFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Vyberte typ logu" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(logCategories).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="destructive" size="sm" onClick={clearLog}>
              <Trash2 className="h-4 w-4 mr-2" /> Vyčistit log
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Zavřít
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full w-full rounded-md border p-4">
            {filteredAndGroupedLogs.length === 0 ? (
              <p className="text-center text-muted-foreground">Žádné záznamy pro vybraný filtr.</p>
            ) : (
              filteredAndGroupedLogs.map(dayGroup => (
                <div key={dayGroup.date} className="mb-6">
                  <h3 className="sticky top-0 bg-white dark:bg-gray-800 py-2 text-lg font-bold text-jyskBlue-dark dark:text-jyskBlue-light border-b mb-3">
                    {format(new Date(dayGroup.date), "EEEE, d. MMMM yyyy", { locale: cs })}
                  </h3>
                  {dayGroup.entries.map((entry) => (
                    <div key={entry.id} className="mb-4 last:mb-0">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">{format(new Date(entry.timestamp), "HH:mm:ss", { locale: cs })}</span> -{" "}
                        <span className="font-semibold text-jyskBlue-dark dark:text-jyskBlue-light">{entry.user}</span>
                      </p>
                      <p className="text-base font-medium">{entry.action}</p>
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