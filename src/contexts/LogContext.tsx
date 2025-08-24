import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation

export interface LogEntry {
  id: string;
  timestamp: number; // Changed to number (milliseconds since epoch)
  user: string; // User's username
  action: string;
  details?: Record<string, any>;
}

interface LogContextType {
  logEntries: LogEntry[];
  addLogEntry: (action: string, details?: Record<string, any>, username?: string) => void; // Added username parameter
  clearLog: () => void;
}

export const LogContext = createContext<LogContextType | undefined>(undefined);

interface LogProviderProps {
  children: ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => {
    const storedLog = localStorage.getItem("appLog");
    if (storedLog) {
      const parsedLog: LogEntry[] = JSON.parse(storedLog);
      // Ensure timestamps are numbers when loading from storage
      return parsedLog.map(entry => ({
        ...entry,
        timestamp: typeof entry.timestamp === 'string' ? new Date(entry.timestamp).getTime() : entry.timestamp
      }));
    }
    return [];
  });
  const { t } = useTranslation(); // Initialize useTranslation

  useEffect(() => {
    localStorage.setItem("appLog", JSON.stringify(logEntries));
  }, [logEntries]);

  const addLogEntry = (action: string, details?: Record<string, any>, username?: string) => {
    const newEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(), // Store as a number
      user: username || t("common.unknown"), // Use provided username or "Neznámý"
      action,
      details,
    };
    setLogEntries((prev) => [newEntry, ...prev]); // Nové záznamy na začátek
  };

  const clearLog = () => {
    setLogEntries([]);
  };

  return (
    <LogContext.Provider value={{ logEntries, addLogEntry, clearLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error("useLog must be used within a LogProvider");
  }
  return context;
};