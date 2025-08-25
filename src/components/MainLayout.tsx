import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Boxes,
  Home,
  LifeBuoy,
  LogOut,
  Package,
  Users,
  Warehouse,
  RefreshCw,
  Settings,
  Globe,
  ClipboardList,
  FileCheck,
  Megaphone,
} from "lucide-react";
import { MobileSidebar } from "@/components/MobileSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationList } from "@/components/NotificationList";

const MainLayout: React.FC = () => {
  const { user, isAdmin, hasPermission, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActive
        ? "bg-muted text-primary"
        : "text-muted-foreground hover:text-primary"
    }`;

  const AdminNav = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <h3 className="my-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("common.admin.systemManagement")}</h3>
      <NavLink to="/admin/site-dashboard" end className={navLinkClasses}>
        <Home className="h-4 w-4" />
        {t("common.siteDashboard")}
      </NavLink>
      <NavLink to="/spravovat-artikly" className={navLinkClasses}>
        <Globe className="h-4 w-4" />
        {t("common.globalArticleManagement")}
      </NavLink>
    </nav>
  );

  const UserNav = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <NavLink to="/" end className={navLinkClasses}>
        <Home className="h-4 w-4" />
        {t("common.dashboard")}
      </NavLink>
      <NavLink to="/oznameni" className={navLinkClasses}>
        <Megaphone className="h-4 w-4" />
        {t("common.announcement.pageTitle")}
      </NavLink>
      
      <h3 className="my-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("common.warehouse")}</h3>
      {hasPermission("audit:view_results") && (
        <NavLink to="/audity" className={navLinkClasses}>
          <FileCheck className="h-4 w-4" />
          {t("common.audit.audits")}
        </NavLink>
      )}
      <NavLink to="/doplnovani" className={navLinkClasses}>
        <RefreshCw className="h-4 w-4" />
        {t("common.replenishment")}
      </NavLink>

      <h3 className="my-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("common.management")}</h3>
      {hasPermission("task:view") && (
        <NavLink to="/ukoly" className={navLinkClasses}>
          <ClipboardList className="h-4 w-4" />
          {t("common.task.taskManagement")}
        </NavLink>
      )}
      {hasPermission("article:view") && (
        <NavLink to="/spravovat-artikly" className={navLinkClasses}>
          <Boxes className="h-4 w-4" />
          {t("common.articleManagement")}
        </NavLink>
      )}
      {hasPermission("rack:view") && (
        <NavLink to="/admin/regaly" className={navLinkClasses}>
          <Warehouse className="h-4 w-4" />
          {t("common.rackManagement")}
        </NavLink>
      )}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6 text-jyskBlue-dark" />
              <span className="">JYSK WMS</span>
            </Link>
          </div>
          <div className="flex-1">
            {isAdmin ? <AdminNav /> : <UserNav />}
          </div>
          <div className="mt-auto p-4 border-t">
             <NavLink to="/help-center" className={navLinkClasses}>
                <LifeBuoy className="h-4 w-4" />
                {t("common.helpCenter")}
              </NavLink>
              <NavLink to="/account-settings" className={navLinkClasses}>
                <Settings className="h-4 w-4" />
                {t("common.accountSettings")}
              </NavLink>
          </div>
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <MobileSidebar />
          <div className="w-full flex-1">
            {/* Optional: Add a global search or breadcrumbs here */}
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationList />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;