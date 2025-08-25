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
    title: "common.faq.globalSearchTitle",
    content: "common.faq.globalSearchContent",
    keywords: ["vyhledat", "artikl", "sklad", "hledat", "ID", "regál", "police", "obchod", "search", "article", "warehouse", "rack", "shelf", "store"],
    category: "common.faq.categoryArticles",
    targetAudience: "all",
  },
  {
    id: "FAQ-002",
    title: "common.faq.barcodeScannerTitle",
    content: "common.faq.barcodeScannerContent",
    keywords: ["skener", "čárový kód", "kamera", "naskenovat", "artikl", "vyhledávání", "scanner", "barcode", "camera", "scan"],
    category: "common.faq.categoryScanning",
    targetAudience: "all",
  },
  {
    id: "FAQ-003",
    title: "common.faq.massAddArticlesTitle",
    content: "common.faq.massAddArticlesContent",
    keywords: ["hromadné přidání", "artikl", "skenovat", "ručně", "množství", "uložit", "police", "regál", "mass add", "articles", "scan", "manual", "quantity", "save"],
    category: "common.faq.categoryArticles",
    targetAudience: "all",
  },
  {
    id: "FAQ-004",
    title: "common.faq.articleManagementTitle",
    content: "common.faq.articleManagementContent",
    keywords: ["artikly", "správa", "přidat", "upravit", "smazat", "articles", "management", "add", "edit", "delete"],
    category: "common.faq.categoryArticles",
    targetAudience: "all",
  },
  {
    id: "FAQ-005",
    title: "common.faq.rackManagementTitle",
    content: "common.faq.rackManagementContent",
    keywords: ["regál", "správa", "police", "popis", "přidat", "upravit", "smazat", "obchod", "rack", "management", "shelf", "description", "add", "edit", "delete", "store"],
    category: "common.faq.categoryRacks",
    targetAudience: "all",
  },
  {
    id: "FAQ-006",
    title: "common.faq.changePasswordTitle",
    content: "common.faq.changePasswordContent",
    keywords: ["heslo", "změna", "bezpečnost", "nastavení účtu", "password", "change", "security", "account settings"],
    category: "common.faq.categoryAccount",
    targetAudience: "all",
  },
  {
    id: "FAQ-007",
    title: "common.faq.themeLanguageTitle",
    content: "common.faq.themeLanguageContent",
    keywords: ["téma", "jazyk", "světlý", "tmavý", "systém", "theme", "language", "light", "dark", "system"],
    category: "common.faq.categoryAccount",
    targetAudience: "all",
  },
  {
    id: "FAQ-008",
    title: "common.faq.externalLinksTitle",
    content: "common.faq.externalLinksContent",
    keywords: ["myjysk", "storefront", "externí odkazy", "external links"],
    category: "common.faq.categoryGeneral",
    targetAudience: "all",
  },
  {
    id: "FAQ-009",
    title: "common.faq.lowStockAlertsTitle",
    content: "common.faq.lowStockAlertsContent",
    keywords: ["nízký stav", "sklad", "upozornění", "low stock", "alerts", "warehouse"],
    category: "common.faq.categoryArticles",
    targetAudience: "all",
  },
  {
    id: "FAQ-010",
    title: "common.faq.barcodeGeneratorTitle",
    content: "common.faq.barcodeGeneratorContent",
    keywords: ["generátor", "čárový kód", "tisk", "artikl", "barcode generator", "print", "article"],
    category: "common.faq.categoryArticles",
    targetAudience: "all",
  },

  // Admin Panel FAQs (Tutorials)
  {
    id: "ADMIN-001",
    title: "common.adminFaq.siteDashboardOverviewTitle",
    content: "common.adminFaq.siteDashboardOverviewContent",
    keywords: ["admin", "dashboard", "přehled", "statistiky", "users", "stores", "articles", "racks", "overview", "statistics"],
    category: "common.adminFaq.categoryAdminDashboard",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-002",
    title: "common.adminFaq.storeManagementTitle",
    content: "common.adminFaq.storeManagementContent",
    keywords: ["admin", "obchody", "správa", "přidat", "upravit", "smazat", "výchozí artikly", "stores", "management", "add", "edit", "delete", "default articles"],
    category: "common.adminFaq.categoryStoreManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-003",
    title: "common.adminFaq.userManagementTitle",
    content: "common.adminFaq.userManagementContent",
    keywords: ["admin", "uživatelé", "správa", "role", "oprávnění", "přidat", "upravit", "smazat", "users", "management", "roles", "permissions", "add", "edit", "delete"],
    category: "common.adminFaq.categoryUserManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-004",
    title: "common.adminFaq.globalArticleManagementTitle",
    content: "common.adminFaq.globalArticleManagementContent",
    keywords: ["admin", "globální artikly", "správa", "výchozí artikly", "přidat", "upravit", "smazat", "global articles", "management", "default articles", "add", "edit", "delete"],
    category: "common.adminFaq.categoryArticleManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-005",
    title: "common.adminFaq.helpPostManagementTitle",
    content: "common.adminFaq.helpPostManagementContent",
    keywords: ["admin", "nápověda", "správa", "články", "přidat", "upravit", "smazat", "help posts", "management", "articles", "add", "edit", "delete"],
    category: "common.adminFaq.categoryHelpManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-006",
    title: "common.adminFaq.logViewerTitle",
    content: "common.adminFaq.logViewerContent",
    keywords: ["admin", "logy", "aktivita", "filtrovat", "smazat", "logs", "activity", "filter", "clear"],
    category: "common.adminFaq.categoryDataManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-007",
    title: "common.adminFaq.exportDataTitle",
    content: "common.adminFaq.exportDataContent",
    keywords: ["admin", "export", "data", "CSV", "JSON", "uživatelé", "obchody", "artikly", "regály", "stáhnout", "export", "data", "users", "stores", "articles", "racks", "download"],
    category: "common.adminFaq.categoryDataManagement",
    targetAudience: "admin",
  },
  {
    id: "ADMIN-008",
    title: "common.adminFaq.copyArticlesTitle",
    content: "common.adminFaq.copyArticlesContent",
    keywords: ["admin", "kopírovat", "artikly", "obchody", "přepsat", "copy", "articles", "stores", "overwrite"],
    category: "common.adminFaq.categoryArticleManagement",
    targetAudience: "admin",
  },
];