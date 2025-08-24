import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  details?: Record<string, any>;
  user?: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLogEntry: (message: string, details?: Record<string, any>, user?: string) => void;
  clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

interface LogProviderProps {
  children: ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const storedLogs = localStorage.getItem('appLogs');
    return storedLogs ? JSON.parse(storedLogs) : [];
  });

  const addLogEntry = (message: string, details?: Record<string, any>, user?: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      message,
      details,
      user,
    };
    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      localStorage.setItem('appLogs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('appLogs');
  };

  return (
    <LogContext.Provider value={{ logs, addLogEntry, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
};