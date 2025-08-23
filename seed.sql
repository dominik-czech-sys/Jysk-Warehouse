-- Heslo 'koplkoplko1A' hashované pomocí bcryptjs (salt rounds 10)
-- Generovaný hash: $2a$10$g.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0
-- Pro účely tohoto příkladu použijeme tento hash.
-- Doporučuji si vygenerovat vlastní hash pro produkční prostředí.
INSERT IGNORE INTO users (username, password, role, permissions, firstLogin) VALUES
('Dczech', '$2a$10$g.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5.6.7.8.9.0', 'admin', '["user:view", "user:create", "user:update", "user:delete", "store:view", "store:create", "store:update", "store:delete", "rack:view", "rack:create", "rack:update", "rack:delete", "article:view", "article:create", "article:update", "article:delete", "article:scan", "article:mass_add", "log:view", "default_articles:manage", "article:copy_from_store"]', TRUE);