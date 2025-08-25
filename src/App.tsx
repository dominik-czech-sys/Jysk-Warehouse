import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import ManageArticles from "./pages/ManageArticles";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage"; // Import
import SiteDashboard from "./pages/SiteDashboard";
import CteckaCarkoduPage from "./pages/CteckaCarkoduPage";
import MassAddArticlesPage from "./pages/MassAddArticlesPage";
import ManageShelfRacksPage from "./pages/ManageShelfRacksPage";
import ExportDataPage from "./pages/ExportDataPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import ManageHelpPostsPage from "./pages/ManageHelpPostsPage";
import ManageUsersPage from "./pages/ManageUsersPage"; // Import
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { LogProvider } from "./contexts/LogContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { useContext } from "react";
import { Permission } from "./data/users";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import MainLayout from "./components/MainLayout";
import ReplenishmentPage from "./pages/ReplenishmentPage";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const auth = useContext(AuthContext);
  if (!auth || !auth.isAuthenticated) {
    return <Navigate to="/prihlaseni" replace />;
  }
  return <MainLayout />;
};

const PrivateRoute: React.FC<{ children: JSX.Element; requiredPermission?: Permission }> = ({
  children,
  requiredPermission,
}) => {
  const auth = useContext(AuthContext);
  if (!auth) return <Navigate to="/prihlaseni" replace />;
  if (requiredPermission && !auth.hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/prihlaseni" element={<LoginPage />} />
      <Route path="/registrace" element={<SignUpPage />} />
      
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/spravovat-artikly" element={<PrivateRoute requiredPermission="article:view"><ManageArticles /></PrivateRoute>} />
        <Route path="/admin/site-dashboard" element={<PrivateRoute requiredPermission="store:view"><SiteDashboard /></PrivateRoute>} />
        <Route path="/admin/regaly" element={<PrivateRoute requiredPermission="rack:view"><ManageShelfRacksPage /></PrivateRoute>} />
        <Route path="/admin/sprava-uzivatelu" element={<PrivateRoute requiredPermission="user:view"><ManageUsersPage /></PrivateRoute>} />
        <Route path="/skenovat-carkod" element={<PrivateRoute requiredPermission="article:scan"><CteckaCarkoduPage /></PrivateRoute>} />
        <Route path="/mass-add-artikly" element={<PrivateRoute requiredPermission="article:mass_add"><MassAddArticlesPage /></PrivateRoute>} />
        <Route path="/export-dat" element={<PrivateRoute requiredPermission="log:view"><ExportDataPage /></PrivateRoute>} />
        <Route path="/account-settings" element={<PrivateRoute><AccountSettingsPage /></PrivateRoute>} />
        <Route path="/help-center" element={<PrivateRoute><HelpCenterPage /></PrivateRoute>} />
        <Route path="/admin/help-posts" element={<PrivateRoute requiredPermission="help_posts:manage"><ManageHelpPostsPage /></PrivateRoute>} />
        <Route path="/doplnovani" element={<PrivateRoute><ReplenishmentPage /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LogProvider>
          <AuthProvider>
            <ThemeProvider>
              <I18nextProvider i18n={i18n}>
                <NotificationProvider>
                  <DashboardProvider>
                    <AppContent />
                  </DashboardProvider>
                </NotificationProvider>
              </I18nextProvider>
            </ThemeProvider>
          </AuthProvider>
        </LogProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;