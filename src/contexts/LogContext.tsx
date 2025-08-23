import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
// REMOVED: import { useAuth } from "@/hooks/useAuth"; // Import useAuth pro získání aktuálního uživatele

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
    return storedLog ? JSON.parse(storedLog) : [];
  });
  // REMOVED: const { user } = useAuth(); // No longer directly getting user from AuthContext here

  useEffect(() => {
    localStorage.setItem("appLog", JSON.stringify(logEntries));
  }, [logEntries]);

  const addLogEntry = (action: string, details?: Record<string, any>, username?: string) => {
    const newEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(), // Store as a number
      user: username || "Neznámý", // Use provided username or "Neznámý"
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