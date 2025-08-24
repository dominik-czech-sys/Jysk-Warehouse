import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ManageArticles from "./pages/ManageArticles";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard"; // Old AdminDashboard, now redirects
import SiteDashboard from "./pages/SiteDashboard"; // New SiteDashboard
import CteckaCarkoduPage from "./pages/CteckaCarkoduPage";
import MassAddArticlesPage from "./pages/MassAddArticlesPage";
import ManageShelfRacksPage from "./pages/ManageShelfRacksPage";
import ExportDataPage from "./pages/ExportDataPage"; // Import ExportDataPage
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { LogProvider } from "./contexts/LogContext";
import { useContext } from "react";
import { Permission } from "./data/users"; // Import Permission type
import { ThemeProvider } from "./contexts/ThemeContext"; // Import ThemeProvider
import { I18nextProvider } from "react-i18next"; // Import I18nextProvider
import i18n from "./i18n"; // Import i18n instance
import { useTranslation } from "react-i18next"; // Import useTranslation for loading message

// const queryClient = new QueryClient(); // Removed QueryClient

// PrivateRoute component to protect routes based on permissions
const PrivateRoute: React.FC<{ children: JSX.Element; requiredPermission?: Permission }> = ({
  children,
  requiredPermission,
}) => {
  const auth = useContext(AuthContext);
  const { t } = useTranslation();

  if (!auth) {
    // This should ideally not happen if AuthProvider wraps AppContent
    return <Navigate to="/prihlaseni" replace />;
  }

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/prihlaseni" replace />;
  }

  if (requiredPermission && !auth.hasPermission(requiredPermission)) {
    // Redirect to home or show an unauthorized message
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/prihlaseni" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Index />
          </PrivateRoute>
        }
      />
      <Route
        path="/spravovat-artikly"
        element={
          <PrivateRoute requiredPermission="article:view">
            <ManageArticles />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/uzivatele" // This route now redirects to SiteDashboard
        element={
          <PrivateRoute requiredPermission="user:view">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/site-dashboard" // New route for the comprehensive admin dashboard
        element={
          <PrivateRoute requiredPermission="store:view">
            <SiteDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/regaly"
        element={
          <PrivateRoute requiredPermission="rack:view">
            <ManageShelfRacksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/skenovat-carkod"
        element={
          <PrivateRoute requiredPermission="article:scan">
            <CteckaCarkoduPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/mass-add-artikly"
        element={
          <PrivateRoute requiredPermission="article:mass_add">
            <MassAddArticlesPage />
          </PrivateRoute>
        }
      />
      {/* Export is typically an admin/manager function */}
      <Route
        path="/export-dat"
        element={
          <PrivateRoute requiredPermission="log:view">
            <ExportDataPage />
          </PrivateRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <LogProvider>
        <AuthProvider>
          <ThemeProvider>
            <I18nextProvider i18n={i18n}>
              <AppContent />
            </I18nextProvider>
          </ThemeProvider>
        </AuthProvider>
      </LogProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;