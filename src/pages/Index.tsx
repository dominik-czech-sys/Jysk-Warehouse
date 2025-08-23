import React, { useState, useEffect } from "react";
import { WarehouseSearch } from "@/components/WarehouseSearch";
import { WarehouseLocationDisplay } from "@/components/WarehouseLocationDisplay";
import { useArticles, Article } from "@/data/articles";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Scan, Users } from "lucide-react";
import { IframeViewer } from "@/components/IframeViewer";
import { useLog } from "@/contexts/LogContext"; // Import useLog
import { ManagementMenu } from "@/components/ManagementMenu"; // Import new ManagementMenu

const Index = () => {
  const { getArticleById, articles } = useArticles();
  const [foundArticle, setFoundArticle] = useState<Article | null>(null);
  const { logout, isAdmin, user, userWarehouseId } = useAuth();
  const { addLogEntry } = useLog(); // Použití useLog
  const [searchParams] = useSearchParams();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    const articleIdFromUrl = searchParams.get("articleId");
    if (articleIdFromUrl) {
      handleSearch(articleIdFromUrl);
    }
  }, [searchParams, articles, user?.username]); // Add user.username to dependencies

  const handleSearch = (articleId: string) => {
    const article = getArticleById(articleId);
    if (article) {
      setFoundArticle(article);
      toast.success(`Článek ${articleId} nalezen!`);
      addLogEntry("Článek vyhledán", { articleId, found: true }, user?.username); // Pass username
    } else {
      setFoundArticle(null);
      toast.error(`Článek ${articleId} nebyl nalezen.`);
      addLogEntry("Článek vyhledán", { articleId, found: false }, user?.username); // Pass username
    }
  };

  const handleOpenIframe = (url: string) => {
    setIframeSrc(url);
  };

  const handleCloseIframe = () => {
    setIframeSrc(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center md:items-start mb-8 space-y-4 md:space-y-0">
        <div className="flex flex-col items-center md:items-start space-y-2 md:space-x-4 md:flex-row">
          <h1 className="text-4xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light text-center md:text-left">JYSK Sklad</h1>
          {user && (
            <span className="text-lg text-gray-700 dark:text-gray-300 text-center md:text-left">
              Přihlášen jako: <span className="font-semibold">{user.username}</span> ({user.role === "admin" ? "Admin" : `Skladník - ${userWarehouseId}`})
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto justify-center md:justify-end">
          {isAdmin && (
            <Link to="/admin/uzivatele" className="w-full sm:w-auto">
              <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                <Users className="h-4 w-4 mr-2" /> Správa uživatelů
              </Button>
            </Link>
          )}
          <ManagementMenu /> {/* Use the new ManagementMenu component */}
          <Button onClick={logout} variant="outline" className="flex items-center w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" /> Odhlásit se
          </Button>
        </div>
      </div>

      <div className="text-center mb-8 w-full">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Zadejte ID článku pro zjištění jeho umístění a patra.
        </p>
      </div>
      <WarehouseSearch onSearch={handleSearch} />
      <div className="mt-8 w-full max-w-sm">
        <WarehouseLocationDisplay article={foundArticle} />
      </div>
      <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-sm">
        <Link to="/skenovat-carkod" className="w-full">
          <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
            <Scan className="h-4 w-4 mr-2" /> Skenovat čárový kód
          </Button>
        </Link>
      </div>

      {/* Přesunutá tlačítka do patičky */}
      <div className="mt-auto pt-8 w-full max-w-sm flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
        <Button
          variant="outline"
          className="flex items-center border-jyskBlue-dark text-jyskBlue-dark hover:bg-jyskBlue-light hover:text-jyskBlue-foreground dark:border-jyskBlue-light dark:text-jyskBlue-light w-full sm:w-auto"
          onClick={() => handleOpenIframe("https://myjysk.thinktime.com/ui/dashboards/177")}
        >
          MyJysk
        </Button>
        <Button
          variant="outline"
          className="flex items-center border-jyskBlue-dark text-jyskBlue-dark hover:bg-jyskBlue-light hover:text-jyskBlue-foreground dark:border-jyskBlue-light dark:text-jyskBlue-light w-full sm:w-auto"
          onClick={() => handleOpenIframe("http://storefront.jysk.com/")}
        >
          StoreFront
        </Button>
      </div>
      <IframeViewer src={iframeSrc} onClose={handleCloseIframe} />
    </div>
  );
};

export default Index;