CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    storeId VARCHAR(255),
    permissions JSON,
    firstLogin BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS shelfracks (
    id VARCHAR(255) PRIMARY KEY,
    rowId VARCHAR(50) NOT NULL,
    rackId VARCHAR(50) NOT NULL,
    shelves JSON,
    storeId VARCHAR(255) NOT NULL,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    rackId VARCHAR(255) NOT NULL,
    shelfNumber VARCHAR(50) NOT NULL,
    storeId VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    quantity INT,
    PRIMARY KEY (id, storeId),
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);