import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, Users, Boxes, Warehouse, KeyRound, Settings, Home, Download, LifeBuoy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Separator } from "@/components/ui/separator";

interface MobileSidebarProps {
  onLogout: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ onLogout }) => {
  const { user, isAdmin, userStoreId, hasPermission } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const translateRole = (role: typeof user.role | "unknown") => {
    switch (role) {
      case "admin": return t("common.admin");
      case "vedouci_skladu": return t("common.warehouseManager");
      case "store_manager": return t("common.storeManager");
      case "deputy_store_manager": return t("common.deputyStoreManager");
      case "ar_assistant_of_sale": return t("common.arAssistantOfSale");
      case "skladnik": return t("common.warehouseWorker");
      default: return t("common.unknown");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("common.openMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.menu")}</SheetTitle>
        </SheetHeader>
        <div className="flex-grow flex flex-col space-y-4 py-4 overflow-y-auto">
          {user && (
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 px-3">
              <p className="font-semibold">{t("common.loggedInAs")}: {user.username}</p>
              <p>({user.role === "admin" ? t("common.admin") : t("common.warehouseWorkerStore", { storeId: userStoreId })})</p>
            </div>
          )}

          <Separator />

          <nav className="grid gap-2 text-lg font-medium">
            <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" onClick={() => setIsOpen(false)}>
              <Home className="h-5 w-5" />
              {t("common.backToMainPage")}
            </Link>

            {isAdmin && (
              <Link to="/admin/site-dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" onClick={() => setIsOpen(false)}>
                <Users className="h-5 w-5" />
                {t("common.siteDashboard")}
              </Link>
            )}

            {hasPermission("article:view") && (
              <Link to="/spravovat-artikly" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" onClick={() => setIsOpen(false)}>
                <Boxes className="h-5 w-5" />
                {t("common.articleManagement")}
              </Link>
            )}

            {hasPermission("rack:view") && (
              <Link to="/admin/regaly" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" onClick={() => setIsOpen(false)}>
                <Warehouse className="h-5 w-5" />
                {t("common.rackManagement")}
              </Link>
            )}

            {hasPermission("log:view") && (
              <Link to="/export-dat" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" onClick={() => setIsOpen(false)}>
                <Download className="h-5 w-5" />
                {t("common.exportData")}
              </Link>
            )}

            <Link to="/account-settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" onClick={() => setIsOpen(false)}>
              <Settings className="h-5 w-5" />
              {t("common.accountSettings")}
            </Link>

            <Link to="/help-center" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" onClick={() => setIsOpen(false)}>
              <LifeBuoy className="h-5 w-5" />
              {t("common.helpCenter")}
            </Link>

            {hasPermission("help_posts:manage") && (
              <Link to="/admin/help-posts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" onClick={() => setIsOpen(false)}>
                <LifeBuoy className="h-5 w-5" />
                {t("common.manageHelpPosts")}
              </Link>
            )}
          </nav>

          <Separator />

          <div className="flex flex-col space-y-2 px-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-muted-foreground">{t("common.theme")}</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-muted-foreground">{t("common.changeLanguage")}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
        <div className="mt-auto flex flex-col space-y-2 p-3 border-t">
          <Button onClick={onLogout} className="w-full flex items-center bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            <LogOut className="h-4 w-4 mr-2" /> {t("common.logout")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};