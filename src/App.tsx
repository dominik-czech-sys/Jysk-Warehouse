import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import ManageArticles from "./pages/ManageArticles";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SiteDashboard from "./pages/SiteDashboard";
import CteckaCarkoduPage from "./pages/CteckaCarkoduPage";
import MassAddArticlesPage from "./pages/MassAddArticlesPage";
import ManageShelfRacksPage from "./pages/ManageShelfRacksPage";
import ExportDataPage from "./pages/ExportDataPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import ManageHelpPostsPage from "./pages/ManageHelpPostsPage";
import TaskManagementPage from "./pages/TaskManagementPage";
import ManageAuditTemplatesPage from "./pages/ManageAuditTemplatesPage";
import AuditListPage from "./pages/AuditListPage";
import PerformAuditPage from "./pages/PerformAuditPage";
import AuditDetailPage from "./pages/AuditDetailPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { LogProvider } from "./contexts/LogContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { useContext } from "react";
import { Permission } from "./data/users";
import { ThemeProvider } from "./contexts/ThemeContext";
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
        <Route path="/skenovat-carkod" element={<PrivateRoute requiredPermission="article:scan"><CteckaCarkoduPage /></PrivateRoute>} />
        <Route path="/mass-add-artikly" element={<PrivateRoute requiredPermission="article:mass_add"><MassAddArticlesPage /></PrivateRoute>} />
        <Route path="/export-dat" element={<PrivateRoute requiredPermission="log:view"><ExportDataPage /></PrivateRoute>} />
        <Route path="/account-settings" element={<PrivateRoute><AccountSettingsPage /></PrivateRoute>} />
        <Route path="/help-center" element={<PrivateRoute><HelpCenterPage /></PrivateRoute>} />
        <Route path="/admin/help-posts" element={<PrivateRoute requiredPermission="help_posts:manage"><ManageHelpPostsPage /></PrivateRoute>} />
        <Route path="/doplnovani" element={<PrivateRoute><ReplenishmentPage /></PrivateRoute>} />
        <Route path="/ukoly" element={<PrivateRoute requiredPermission="task:view"><TaskManagementPage /></PrivateRoute>} />
        <Route path="/admin/audit-templates" element={<PrivateRoute requiredPermission="audit:manage_templates"><ManageAuditTemplatesPage /></PrivateRoute>} />
        <Route path="/audity" element={<PrivateRoute requiredPermission="audit:view_results"><AuditListPage /></PrivateRoute>} />
        <Route path="/audity/provadet" element={<PrivateRoute requiredPermission="audit:perform"><PerformAuditPage /></PrivateRoute>} />
        <Route path="/audity/:auditId" element={<PrivateRoute requiredPermission="audit:view_results"><AuditDetailPage /></PrivateRoute>} />
        <Route path="/oznameni" element={<PrivateRoute><AnnouncementsPage /></PrivateRoute>} />
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
              <NotificationProvider>
                <DashboardProvider>
                  <AppContent />
                </DashboardProvider>
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </LogProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;