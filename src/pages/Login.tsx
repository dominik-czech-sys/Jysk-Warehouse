import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth"; // Předpokládáme, že useAuth je hook pro AuthContext
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Přesměrovat na dashboard po přihlášení
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      // Přesměrování se provede v useEffect
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{t("common.login")}</CardTitle>
          <CardDescription>{t("common.enterCredentials")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">{t("common.username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("common.usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">{t("common.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("common.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("common.loggingIn") : t("common.loginButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;