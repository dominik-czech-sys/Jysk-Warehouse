import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {t("common.welcomeUser", { username: user?.username || "Guest" })}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        {t("common.dashboardWelcome")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Zde budou karty s přehledy nebo rychlými odkazy */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            {t("common.storesOverview")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("common.storesOverviewDescription")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            {t("common.racksOverview")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("common.racksOverviewDescription")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            {t("common.articlesOverview")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("common.articlesOverviewDescription")}
          </p>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;