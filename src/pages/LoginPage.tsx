import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/");
    } else {
      // toast.error is already called in AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">Přihlášení do Skladu JYSK</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Uživatelské jméno</Label>
              <Input
                id="username"
                type="text"
                placeholder="Zadejte uživatelské jmého"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                placeholder="Zadejte heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              Přihlásit se
            </Button>
            <a href="https://myjysk.thinktime.com/ui/dashboards/177" target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button type="button" variant="outline" className="w-full mt-4 border-jyskBlue-dark text-jyskBlue-dark hover:bg-jyskBlue-light hover:text-jyskBlue-foreground dark:border-jyskBlue-light dark:text-jyskBlue-light">
                Přejít na MyJysk
              </Button>
            </a>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;