import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.loginTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            view="sign_in"
            showLinks={false} // This will hide the "Don't have an account? Sign up" link
            localization={{
              variables: {
                sign_in: {
                  email_label: t("common.email"),
                  password_label: t("common.password"),
                  button_label: t("common.login"),
                  email_input_placeholder: t("common.enterEmail"),
                  password_input_placeholder: t("common.enterPassword"),
                },
                forgotten_password: {
                  link_text: "Zapomněli jste heslo?",
                },
              },
            }}
          />
          <div className="mt-4 text-center text-sm">
            {t("common.noAccount")}{" "}
            <Link to="/registrace" className="underline">
              {t("common.signUp")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;