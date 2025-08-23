import React from "react";
import { useLog, LogEntry } from "@/contexts/LogContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const { logEntries, clearLog } = useLog();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">Log Aktivity</CardTitle>
          <div className="flex space-x-2">
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
            {logEntries.length === 0 ? (
              <p className="text-center text-muted-foreground">Log je prázdný.</p>
            ) : (
              logEntries.map((entry) => (
                <div key={entry.id} className="mb-4 last:mb-0">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{entry.timestamp}</span> -{" "}
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
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};