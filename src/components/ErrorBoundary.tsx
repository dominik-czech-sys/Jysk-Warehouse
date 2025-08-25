import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      // This is the key part: clear all storage to reset the app's state
      localStorage.clear();
      sessionStorage.clear();
      // Now, reload the page. The user will be logged out and can start fresh.
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear storage and reload:", e);
    }
  };

  public render() {
    if (this.state.hasError) {
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Nejčastěji je to způsobeno nekonzistentními daty po aktualizaci. Kliknutím na tlačítko níže vymažete data aplikace a obnovíte stránku.
              </p>
              <Button onClick={this.handleReset} className="w-full bg-jyskBlue-dark hover:bg-jyskBlue-light">
                Vymazat data a zkusit znovu
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;