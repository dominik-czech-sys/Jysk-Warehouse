import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth pro získání aktuálního uživatele

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: Record<string, any>;
}

interface LogContextType {
  logEntries: LogEntry[];
  addLogEntry: (action: string, details?: Record<string, any>) => void;
  clearLog: () => void;
}

export const LogContext = createContext<LogContextType | undefined>(undefined);

interface LogProviderProps {
  children: ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => {
    const storedLog = localStorage.getItem("appLog");
    return storedLog ? JSON.parse(storedLog) : [];
  });
  const { user } = useAuth(); // Získání aktuálního uživatele z AuthContextu

  useEffect(() => {
    localStorage.setItem("appLog", JSON.stringify(logEntries));
  }, [logEntries]);

  const addLogEntry = (action: string, details?: Record<string, any>) => {
    const newEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleString(),
      user: user ? user.username : "Neznámý",
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