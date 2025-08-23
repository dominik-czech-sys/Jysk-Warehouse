import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation(); // Initialize useTranslation

  useEffect(() => {
    console.error(
      "404 Chyba: Uživatel se pokusil získat přístup k neexistující cestě:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{t("common.pageNotFound")}</p>
        <a href="/" className="text-jyskBlue-dark hover:text-jyskBlue-light underline">
          {t("common.backToMainPage")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;