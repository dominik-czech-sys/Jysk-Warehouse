import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { WarehouseSearch } from "@/components/WarehouseSearch";
import { WarehouseLocationDisplay } from "@/components/WarehouseLocationDisplay";
import { useArticles, Article } from "@/data/articles";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Scan, Users } from "lucide-react";

const Index = () => {
  const { getArticleById, articles } = useArticles();
  const [foundArticle, setFoundArticle] = useState<Article | null>(null);
  const { logout, isAdmin, user, userWarehouseId } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const articleIdFromUrl = searchParams.get("articleId");
    if (articleIdFromUrl) {
      handleSearch(articleIdFromUrl);
    }
  }, [searchParams, articles]); // Re-run effect if articles change

  const handleSearch = (articleId: string) => {
    const article = getArticleById(articleId);
    if (article) {
      setFoundArticle(article);
      toast.success(`Článek ${articleId} nalezen!`);
    } else {
      setFoundArticle(null);
      toast.error(`Článek ${articleId} nebyl nalezen.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">JYSK Sklad</h1>
          {user && (
            <span className="text-lg text-gray-700 dark:text-gray-300">
              Přihlášen jako: <span className="font-semibold">{user.username}</span> ({user.role === "admin" ? "Admin" : `Skladník - ${userWarehouseId}`})
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <Link to="/admin/uzivatele">
              <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
                <Users className="h-4 w-4 mr-2" /> Správa uživatelů
              </Button>
            </Link>
          )}
          <Button onClick={logout} variant="outline" className="flex items-center">
            <LogOut className="h-4 w-4 mr-2" /> Odhlásit se
          </Button>
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Zadejte ID článku pro zjištění jeho umístění a patra.
        </p>
      </div>
      <WarehouseSearch onSearch={handleSearch} />
      <div className="mt-8">
        <WarehouseLocationDisplay article={foundArticle} />
      </div>
      <div className="mt-8 flex space-x-4">
        <Link to="/spravovat-clanky">
          <Button variant="outline" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">Spravovat články</Button>
        </Link>
        <Link to="/skenovat-carkod">
          <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
            <Scan className="h-4 w-4 mr-2" /> Skenovat čárový kód
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;