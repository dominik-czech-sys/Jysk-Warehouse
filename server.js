const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs'); // Pro čtení SQL souborů
const path = require('path'); // Pro práci s cestami k souborům

const app = express();
const port = process.env.PORT || 3001;

// Načtení proměnných prostředí (např. z .env souboru)
require('dotenv').config();

// Middleware
app.use(cors()); // Povolit CORS pro frontend
app.use(express.json()); // Povolit parsování JSON těla požadavků

// Konfigurace databáze s vašimi údaji
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306, // Přidán port
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'koplkoplko1A',
  database: process.env.DB_DATABASE || 'Jysk-Warehouse', // Změněno na Jysk-Warehouse
};

let dbConnection;

// Funkce pro připojení k databázi
async function connectToDatabase() {
  try {
    dbConnection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    process.exit(1); // Ukončit aplikaci, pokud se nelze připojit k DB
  }
}

// Middleware pro ověření JWT tokenu
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Authentication token required' }); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' }); // Forbidden
    req.user = user;
    next();
  });
};

// --- API Endpoints ---

// Endpoint pro inicializaci databáze
app.post('/api/init-db', async (req, res) => {
  try {
    const schemaSqlPath = path.join(__dirname, 'schema.sql');
    const seedSqlPath = path.join(__dirname, 'seed.sql');

    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

    // Vymazání existujících dat (pokud existují) a vytvoření nových tabulek
    await dbConnection.query('DROP TABLE IF EXISTS articles, shelfracks, stores, users;');
    await dbConnection.query(schemaSql);
    await dbConnection.query(seedSql);

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ message: 'Failed to initialize database' });
  }
});

// Endpoint pro přihlášení uživatele
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await dbConnection.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generování JWT tokenu
    const token = jwt.sign({ username: user.username, role: user.role, storeId: user.storeId }, process.env.JWT_SECRET || 'your_super_secret_jwt_key', { expiresIn: '1h' });

    res.json({ message: 'Login successful', token, user: { username: user.username, role: user.role, storeId: user.storeId, permissions: JSON.parse(user.permissions), firstLogin: user.firstLogin } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint pro získání všech uživatelů (vyžaduje autentizaci)
app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && !req.user.permissions.includes('user:view')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const [rows] = await dbConnection.execute('SELECT username, role, storeId, permissions, firstLogin FROM users');
    const users = rows.map(user => ({
      ...user,
      permissions: JSON.parse(user.permissions)
    }));
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint pro získání jednoho uživatele
app.get('/api/users/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;
  if (req.user.username !== username && req.user.role !== 'admin' && !req.user.permissions.includes('user:view')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const [rows] = await dbConnection.execute('SELECT username, role, storeId, permissions, firstLogin FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];
    res.json({ ...user, permissions: JSON.parse(user.permissions) });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint pro vytvoření uživatele
app.post('/api/users', authenticateToken, async (req, res) => {
  const { username, password, role, storeId, permissions, firstLogin } = req.body;
  if (req.user.role !== 'admin' && !req.user.permissions.includes('user:create')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await dbConnection.execute(
      'INSERT INTO users (username, password, role, storeId, permissions, firstLogin) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, role, storeId, JSON.stringify(permissions), firstLogin]
    );
    res.status(201).json({ id: result.insertId, username, role, storeId, permissions, firstLogin });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User with this username already exists' });
    }
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Endpoint pro aktualizaci uživatele
app.put('/api/users/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;
  const { password, role, storeId, permissions, firstLogin } = req.body;
  if (req.user.username !== username && req.user.role !== 'admin' && !req.user.permissions.includes('user:update')) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    let updateFields = [];
    let updateValues = [];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (storeId !== undefined) {
      updateFields.push('storeId = ?');
      updateValues.push(storeId);
    }
    if (permissions) {
      updateFields.push('permissions = ?');
      updateValues.push(JSON.stringify(permissions));
    }
    if (firstLogin !== undefined) {
      updateFields.push('firstLogin = ?');
      updateValues.push(firstLogin);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE username = ?`;
    updateValues.push(username);

    await dbConnection.execute(sql, updateValues);

    const [rows] = await dbConnection.execute('SELECT username, role, storeId, permissions, firstLogin FROM users WHERE username = ?', [username]);
    const updatedUser = rows[0];

    res.status(200).json({ ...updatedUser, permissions: JSON.parse(updatedUser.permissions) });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Endpoint pro smazání uživatele
app.delete('/api/users/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;
  if (req.user.username === username) {
    return res.status(400).json({ message: 'Cannot delete self' });
  }
  if (req.user.role !== 'admin' && !req.user.permissions.includes('user:delete')) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await dbConnection.execute('DELETE FROM users WHERE username = ?', [username]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// --- CRUD operace pro Stores ---
app.get('/api/stores', authenticateToken, async (req, res) => {
  if (!req.user.permissions.includes('store:view')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const [rows] = await dbConnection.execute('SELECT * FROM stores');
    res.json(rows);
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/stores', authenticateToken, async (req, res) => {
  const { id, name } = req.body;
  if (!req.user.permissions.includes('store:create')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const [result] = await dbConnection.execute('INSERT INTO stores (id, name) VALUES (?, ?)', [id, name]);
    res.status(201).json({ id, name });
  } catch (error) {
    console.error('Create store error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Store with this ID already exists' });
    }
    res.status(500).json({ message: 'Failed to create store' });
  }
});

app.put('/api/stores/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!req.user.permissions.includes('store:update')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    await dbConnection.execute('UPDATE stores SET name = ? WHERE id = ?', [name, id]);
    res.status(200).json({ id, name });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Failed to update store' });
  }
});

app.delete('/api/stores/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!req.user.permissions.includes('store:delete')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    await dbConnection.execute('DELETE FROM stores WHERE id = ?', [id]);
    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Failed to delete store' });
  }
});

// --- CRUD operace pro ShelfRacks ---
app.get('/api/racks', authenticateToken, async (req, res) => {
  if (!req.user.permissions.includes('rack:view')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const [rows] = await dbConnection.execute('SELECT * FROM shelfracks');
    const racks = rows.map(rack => ({
      ...rack,
      shelves: JSON.parse(rack.shelves)
    }));
    res.json(racks);
  } catch (error) {
    console.error('Get all racks error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/racks', authenticateToken, async (req, res) => {
  const { id, rowId, rackId, shelves, storeId } = req.body;
  if (!req.user.permissions.includes('rack:create')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const [result] = await dbConnection.execute('INSERT INTO shelfracks (id, rowId, rackId, shelves, storeId) VALUES (?, ?, ?, ?, ?)',
      [id, rowId, rackId, JSON.stringify(shelves), storeId]);
    res.status(201).json({ id, rowId, rackId, shelves, storeId });
  } catch (error) {
    console.error('Create rack error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Rack with this ID already exists in this store' });
    }
    res.status(500).json({ message: 'Failed to create rack' });
  }
});

app.put('/api/racks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { rowId, rackId, shelves, storeId } = req.body; // rowId and rackId might be updated too
  if (!req.user.permissions.includes('rack:update')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    await dbConnection.execute('UPDATE shelfracks SET rowId = ?, rackId = ?, shelves = ?, storeId = ? WHERE id = ?',
      [rowId, rackId, JSON.stringify(shelves), storeId, id]);
    res.status(200).json({ id, rowId, rackId, shelves, storeId });
  } catch (error) {
    console.error('Update rack error:', error);
    res.status(500).json({ message: 'Failed to update rack' });
  }
});

app.delete('/api/racks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!req.user.permissions.includes('rack:delete')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    await dbConnection.execute('DELETE FROM shelfracks WHERE id = ?', [id]);
    res.status(200).json({ message: 'Rack deleted successfully' });
  } catch (error) {
    console.error('Delete rack error:', error);
    res.status(500).json({ message: 'Failed to delete rack' });
  }
});

// --- CRUD operace pro Articles ---
app.get('/api/articles', authenticateToken, async (req, res) => {
  if (!req.user.permissions.includes('article:view')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const [rows] = await dbConnection.execute('SELECT * FROM articles');
    res.json(rows);
  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/articles', authenticateToken, async (req, res) => {
  const { id, name, rackId, shelfNumber, storeId, status, quantity } = req.body;
  if (!req.user.permissions.includes('article:create')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const [result] = await dbConnection.execute('INSERT INTO articles (id, name, rackId, shelfNumber, storeId, status, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, rackId, shelfNumber, storeId, status, quantity]);
    res.status(201).json({ id, name, rackId, shelfNumber, storeId, status, quantity });
  } catch (error) {
    console.error('Create article error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Article with this ID already exists in this store' });
    }
    res.status(500).json({ message: 'Failed to create article' });
  }
});

app.put('/api/articles/:id/:storeId', authenticateToken, async (req, res) => {
  const { id, storeId } = req.params;
  const { name, rackId, shelfNumber, status, quantity } = req.body;
  if (!req.user.permissions.includes('article:update')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    await dbConnection.execute('UPDATE articles SET name = ?, rackId = ?, shelfNumber = ?, status = ?, quantity = ? WHERE id = ? AND storeId = ?',
      [name, rackId, shelfNumber, status, quantity, id, storeId]);
    res.status(200).json({ id, name, rackId, shelfNumber, storeId, status, quantity });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Failed to update article' });
  }
});

app.delete('/api/articles/:id/:storeId', authenticateToken, async (req, res) => {
  const { id, storeId } = req.params;
  if (!req.user.permissions.includes('article:delete')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    await dbConnection.execute('DELETE FROM articles WHERE id = ? AND storeId = ?', [id, storeId]);
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Failed to delete article' });
  }
});


// Spuštění serveru
async function startServer() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
}

startServer();