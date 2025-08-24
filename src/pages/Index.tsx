import React, { useState, useEffect } from "react";
import { WarehouseSearch } from "@/components/WarehouseSearch";
import { WarehouseLocationDisplay } from "@/components/WarehouseLocationDisplay";
import { useArticles, Article } from "@/data/articles";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Scan, Users, KeyRound } from "lucide-react"; // Added KeyRound icon
import { IframeViewer } from "@/components/IframeViewer";
import { useLog } from "@/contexts/LogContext";
import { ManagementMenu } from "@/components/ManagementMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import FirstLoginTutorial from "@/components/FirstLoginTutorial";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog"; // Import ChangePasswordDialog

const Index = () => {
  const { getArticleById, articles } = useArticles();
  const [foundArticle, setFoundArticle] = useState<Article | null>(null);
  const { logout, isAdmin, user, userStoreId, hasPermission, updateUser } = useAuth();
  const { addLogEntry } = useLog();
  const [searchParams] = useSearchParams();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false); // State for password change dialog
  const { t } = useTranslation();

  useEffect(() => {
    const articleIdFromUrl = searchParams.get("articleId");
    if (articleIdFromUrl) {
      handleSearch(articleIdFromUrl);
    }
  }, [searchParams, articles, user?.username, t]);

  const handleSearch = (articleId: string) => {
    const article = getArticleById(articleId, userStoreId);
    if (article) {
      setFoundArticle(article);
      toast.success(t("common.articleFound", { articleId }));
      addLogEntry(t("common.articleSearched"), { articleId, found: true, storeId: userStoreId }, user?.username);
    } else {
      setFoundArticle(null);
      toast.error(t("common.articleNotFound", { articleId }));
      addLogEntry(t("common.articleSearched"), { articleId, found: false, storeId: userStoreId }, user?.username);
    }
  };

  const handleOpenIframe = (url: string) => {
    setIframeSrc(url);
  };

  const handleCloseIframe = () => {
    setIframeSrc(null);
  };

  const handleTutorialComplete = async () => {
    if (user) {
      // Mark firstLogin as false after tutorial completion
      await updateUser({ ...user, firstLogin: false });
    }
  };

  // If it's the first login and not an admin, show the tutorial
  if (user && user.firstLogin && !isAdmin) {
    return <FirstLoginTutorial onComplete={handleTutorialComplete} />;
  }

  // If it's the first login and an admin, automatically complete the tutorial
  if (user && user.firstLogin && isAdmin) {
    handleTutorialComplete(); // Mark firstLogin as false for admin without showing tutorial
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center md:items-start mb-8 space-y-4 md:space-y-0 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex flex-col items-center md:items-start space-y-2 md:space-x-4 md:flex-row">
          <h1 className="text-4xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light text-center md:text-left">
            {t("common.jyskWarehouse")}
          </h1>
          {user && (
            <span className="text-lg text-gray-700 dark:text-gray-300 text-center md:text-left">
              {t("common.loggedInAs")}: <span className="font-semibold">{user.username}</span> (
              {user.role === "admin" ? t("common.admin") : t("common.warehouseWorkerStore", { storeId: userStoreId })})
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto justify-center md:justify-end">
          {isAdmin && (
            <Link to="/admin/site-dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                <Users className="h-4 w-4 mr-2" /> {t("common.siteDashboard")}
              </Button>
            </Link>
          )}
          {(hasPermission("article:view") || hasPermission("rack:view")) && <ManagementMenu />}
          <ThemeToggle />
          <LanguageSwitcher />
          <Button onClick={() => setIsChangePasswordDialogOpen(true)} variant="outline" className="flex items-center w-full sm:w-auto">
            <KeyRound className="h-4 w-4 mr-2" /> {t("common.changePassword")}
          </Button>
          <Button onClick={logout} variant="outline" className="flex items-center w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" /> {t("common.logout")}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
        <div className="text-center mb-8 w-full">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("common.searchArticleLocation")}
          </p>
        </div>
        <WarehouseSearch onSearch={handleSearch} />
        <div className="mt-8 w-full max-w-sm animate-slide-in-up">
          <WarehouseLocationDisplay article={foundArticle} />
        </div>
        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-sm">
          {hasPermission("article:scan") && (
            <Link to="/skenovat-carkod" className="w-full">
              <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                <Scan className="h-4 w-4 mr-2" /> {t("common.scanBarcode")}
              </Button>
            </Link>
          )}
        </div>
      </main>

      {/* Footer Links */}
      <footer className="mt-auto pt-8 w-full max-w-6xl flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8">
        <Button
          variant="outline"
          className="flex items-center border-jyskBlue-dark text-jyskBlue-dark hover:bg-jyskBlue-light hover:text-jyskBlue-foreground dark:border-jyskBlue-light dark:text-jyskBlue-light w-full sm:w-auto"
          onClick={() => handleOpenIframe("https://myjysk.thinktime.com/ui/dashboards/177")}
        >
          {t("common.goToMyJysk")}
        </Button>
        <Button
          variant="outline"
          className="flex items-center border-jyskBlue-dark text-jyskBlue-dark hover:bg-jyskBlue-light hover:text-jyskBlue-foreground dark:border-jyskBlue-light dark:text-jyskBlue-light w-full sm:w-auto"
          onClick={() => handleOpenIframe("http://storefront.jysk.com/")}
        >
          {t("common.goToStoreFront")}
        </Button>
      </footer>

      <IframeViewer src={iframeSrc} onClose={handleCloseIframe} />
      <ChangePasswordDialog isOpen={isChangePasswordDialogOpen} onClose={() => setIsChangePasswordDialogOpen(false)} />
    </div>
  );
};

export default Index;