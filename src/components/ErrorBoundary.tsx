import React from "react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const handleHardReset = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/"; // Přesměrování na domovskou stránku pro reinicializaci
  } catch (e) {
    console.error("Failed to clear storage and reload:", e);
  }
};

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-red-100 rounded-full p-3 w-fit">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Něco se pokazilo</CardTitle>
          <CardDescription>
            Omlouváme se, ale aplikace narazila na neočekávanou chybu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Můžete to zkusit znovu. Pokud problém přetrvává, zkuste provést tvrdý reset, který vymaže data aplikace.
          </p>
          <div className="flex gap-4">
            <Button onClick={resetErrorBoundary} className="w-full bg-jyskBlue-dark hover:bg-jyskBlue-light">
              Zkusit znovu
            </Button>
            <Button onClick={handleHardReset} className="w-full bg-destructive hover:bg-destructive/90">
              Tvrdý reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const logError = (error: Error, info: { componentStack: string }) => {
    // Zde můžete posílat chyby do logovací služby
    console.error("Uncaught error:", error, info);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset stavu aplikace, pokud je to potřeba
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;