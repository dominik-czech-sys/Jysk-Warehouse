export interface HelpPost {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  targetAudience: "all" | "admin"; // New field to distinguish audience
}

export const helpPosts: HelpPost[] = [
  // General User FAQs
  {
    id: "FAQ-001",
    title: "faq.globalSearchTitle",
    content: "faq.globalSearchContent",
    keywords: ["vyhledat", "artikl", "sklad", "hledat", "ID", "regál", "police", "obchod", "search", "article", "warehouse", "rack", "shelf", "store"],
    category: "faq.categoryArticles",
    targetAudience: "all",
  },
  {
    id: "FAQ-002",
    title: "faq.barcodeScannerTitle",
    content: "faq.barcodeScannerContent",
    keywords: ["skener", "čárový kód", "kamera", "naskenovat", "artikl", "vyhledávání", "scanner", "barcode", "camera", "scan"],
    category: "faq.categoryScanning",
    targetAudience: "all",
  },
  {
    id: "FAQ-003",
    title: "faq.massAddArticlesTitle",
    content: "faq.massAddArticlesContent",
    keywords: ["hromadné přidání", "artikl", "skenovat", "ručně", "množství", "uložit", "police", "regál", "mass add", "articles", "scan", "manual", "quantity", "save"],
    category: "faq.categoryArticles",
    targetAudience: "all",
  },
  {
    id: "FAQ-004",
    title: "faq.articleManagementTitle",
    content: "faq.articleManagementContent",
    keywords: ["artikly", "správa", "přidat", "upravit", "smazat", "articles", "management", "add", "edit", "delete"],
    category: "faq.categoryArticles",
    targetAudience: "all",
  },
  {
    id: "FAQ-005",
    title: "faq.rackManagementTitle",
    content: "faq.rackManagementContent",
    keywords: ["regál", "správa", "police", "popis", "přidat", "upravit", "smazat", "obchod", "rack", "management", "shelf", "description", "add", "edit", "delete", "store"],
    category: "faq.categoryRacks",
    targetAudience: "all",
  },
  {
    id: "FAQ-006",
    title: "faq.changePasswordTitle",
    content: "faq.changePasswordContent",
    keywords: ["heslo", "změna", "bezpečnost", "nastavení účtu", "password", "change", "security", "account settings"],
    category: "faq.categoryAccount",
    targetAudience: "all",
  },
  {
    id: "FAQ-007",
    title: "faq.themeLanguageTitle",
    content: "faq.themeLanguageContent",
    keywords: ["téma", "jazyk", "světlý", "tmavý", "systém", "theme", "language", "light", "dark", "system"],
    category: "faq.categoryAccount",
    targetAudience: "all",
  },
  {
    id: "FAQ-008",
    title: "faq.externalLinksTitle",
    content: "faq.externalLinksContent",
    keywords: ["myjysk", "storefront", "externí odkazy", "external links"],
    category: "faq.categoryGeneral",
    targetAudience: "all",
  },
  {
    id: "FAQ-009",
    title: "faq.lowStockAlertsTitle",
    content: "faq.lowStockAlertsContent",
    keywords: ["nízký stav", "sklad", "upozornění", "low stock", "alerts", "warehouse"],
    category: "faq.categoryArticles",
    targetAudience: "all",
  },
  {
    id: "FAQ-010",
    title: "faq.barcodeGeneratorTitle",
    content: "faq.barcodeGeneratorContent",
    keywords: ["generátor", "čárový kód", "tisk", "artikl", "barcode generator", "print", "article"],
    category: "faq.categoryArticles",
    targetAudience: "all",
  },

  // Admin Panel FAQs (Tutorials)
  {
    id: "ADMIN-001",
    title: "adminFaq.siteDashboardOverviewTitle",
    content: "adminFaq.siteDashboardOverviewContent",
    keywords: ["admin", "dashboard", "přehled", "statistiky", "users", "stores", "articles", "racks", "overview", "statistics"],
    category: "adminFaq.categoryAdminDashboard",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-002",
    title: "adminFaq.storeManagementTitle",
    content: "adminFaq.storeManagementContent",
    keywords: ["admin", "obchody", "správa", "přidat", "upravit", "smazat", "výchozí artikly", "stores", "management", "add", "edit", "delete", "default articles"],
    category: "adminFaq.categoryStoreManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-003",
    title: "adminFaq.userManagementTitle",
    content: "adminFaq.userManagementContent",
    keywords: ["admin", "uživatelé", "správa", "role", "oprávnění", "přidat", "upravit", "smazat", "users", "management", "roles", "permissions", "add", "edit", "delete"],
    category: "adminFaq.categoryUserManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-004",
    title: "adminFaq.globalArticleManagementTitle",
    content: "adminFaq.globalArticleManagementContent",
    keywords: ["admin", "globální artikly", "správa", "výchozí artikly", "přidat", "upravit", "smazat", "global articles", "management", "default articles", "add", "edit", "delete"],
    category: "adminFaq.categoryArticleManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-005",
    title: "adminFaq.helpPostManagementTitle",
    content: "adminFaq.helpPostManagementContent",
    keywords: ["admin", "nápověda", "správa", "články", "přidat", "upravit", "smazat", "help posts", "management", "articles", "add", "edit", "delete"],
    category: "adminFaq.categoryHelpManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-006",
    title: "adminFaq.logViewerTitle",
    content: "adminFaq.logViewerContent",
    keywords: ["admin", "logy", "aktivita", "filtrovat", "smazat", "logs", "activity", "filter", "clear"],
    category: "adminFaq.categoryDataManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-007",
    title: "adminFaq.exportDataTitle",
    content: "adminFaq.exportDataContent",
    keywords: ["admin", "export", "data", "CSV", "JSON", "uživatelé", "obchody", "artikly", "regály", "stáhnout", "export", "data", "users", "stores", "articles", "racks", "download"],
    category: "adminFaq.categoryDataManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-008",
    title: "adminFaq.copyArticlesTitle",
    content: "adminFaq.copyArticlesContent",
    keywords: ["admin", "kopírovat", "artikly", "obchody", "přepsat", "copy", "articles", "stores", "overwrite"],
    category: "adminFaq.categoryArticleManagement",
    targetAudience: "admin",
  },
];