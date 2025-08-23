import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IframeViewer } from "@/components/IframeViewer"; // Import IframeViewer
import { useTranslation } from "react-i18next"; // Import useTranslation

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null); // Stav pro iframe
  const { t } = useTranslation(); // Initialize useTranslation

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/");
    } else {
      // toast.error is already called in AuthContext
    }
  };

  const handleOpenIframe = (url: string) => {
    setIframeSrc(url);
  };

  const handleCloseIframe = () => {
    setIframeSrc(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.loginTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">{t("common.username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("common.enterUsername")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">{t("common.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("common.enterPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {t("common.login")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 border-jyskBlue-dark text-jyskBlue-dark hover:bg-jyskBlue-light hover:text-jyskBlue-foreground dark:border-jyskBlue-light dark:text-jyskBlue-light"
              onClick={() => handleOpenIframe("https://myjysk.thinktime.com/ui/dashboards/177")}
            >
              {t("common.goToMyJysk")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 border-jyskBlue-dark text-jyskBlue-dark hover:bg-jyskBlue-light hover:text-jyskBlue-foreground dark:border-jyskBlue-light dark:text-jyskBlue-light"
              onClick={() => handleOpenIframe("http://storefront.jysk.com/")}
            >
              {t("common.goToStoreFront")}
            </Button>
          </form>
        </CardContent>
      </Card>
      <IframeViewer src={iframeSrc} onClose={handleCloseIframe} />
    </div>
  );
};

export default LoginPage;