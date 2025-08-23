import { toast } from "sonner";

// Default API URL, který může být přepsán v AdminApiConfig
export const getApiUrl = (): string => {
  return localStorage.getItem('API_URL') || 'http://127.0.0.1:3001/api'; // Změněno na 127.0.0.1
};

interface UserApiData {
  username: string;
  password?: string;
  role: string;
  storeId?: string;
  permissions: string[];
  firstLogin: boolean;
}

export interface StoreApiData {
  id: string;
  name: string;
}

export interface Shelf {
  shelfNumber: string;
  description: string;
}

export interface ShelfRackApiData {
  id: string;
  rowId: string;
  rackId: string;
  shelves: Shelf[];
  storeId: string;
}

export interface ArticleApiData {
  id: string;
  name: string;
  rackId: string;
  shelfNumber: string;
  storeId: string;
  status: string;
  quantity: number;
}


// Funkce pro přihlášení uživatele
export const loginUser = async (username: string, password: string): Promise<any | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data.user; // Předpokládáme, že backend vrátí objekt uživatele
  } catch (error: any) {
    console.error('Login Error:', error);
    toast.error(error.message || 'common.loginFailed');
    return null;
  }
};

// Funkce pro získání uživatele (např. po přihlášení nebo pro ověření)
export const getUser = async (username: string): Promise<UserApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/users/${username}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }
    return data;
  } catch (error: any) {
    console.error('Get User Error:', error);
    toast.error(error.message || 'common.userNotFound');
    return null;
  }
};

// Funkce pro vytvoření uživatele
export const createUser = async (user: UserApiData): Promise<UserApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create user');
    }
    return data;
  } catch (error: any) {
    console.error('Create User Error:', error);
    toast.error(error.message || 'common.userExists');
    return null;
  }
};

// Funkce pro aktualizaci uživatele
export const updateUser = async (username: string, user: Partial<UserApiData>): Promise<UserApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }
    return data;
  } catch (error: any) {
    console.error('Update User Error:', error);
    toast.error(error.message || 'common.userUpdateFailed');
    return null;
  }
};

// Funkce pro smazání uživatele
export const deleteUser = async (username: string): Promise<boolean> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/users/${username}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete user');
    }
    return true;
  } catch (error: any) {
    console.error('Delete User Error:', error);
    toast.error(error.message || 'common.userDeleteFailed');
    return false;
  }
};

// Funkce pro inicializaci databáze na backendu
export const initDatabase = async (): Promise<boolean> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/init-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize database');
    }
    return true;
  } catch (error: any) {
    console.error('Database Init Error:', error);
    toast.error(error.message || 'common.dbInitFailed');
    return false;
  }
};

// Funkce pro získání všech uživatelů (pro admin panel)
export const getAllUsers = async (): Promise<UserApiData[]> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/users`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch all users');
    }
    return data;
  } catch (error: any) {
    console.error('Get All Users Error:', error);
    toast.error(error.message || 'common.usersFetchFailed');
    return [];
  }
};

// --- API volání pro Stores ---
export const getAllStores = async (): Promise<StoreApiData[]> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/stores`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch stores');
    }
    return data;
  } catch (error: any) {
    console.error('Get All Stores Error:', error);
    toast.error(error.message || 'common.storesFetchFailed');
    return [];
  }
};

export const createStore = async (store: StoreApiData): Promise<StoreApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create store');
    }
    return data;
  } catch (error: any) {
    console.error('Create Store Error:', error);
    toast.error(error.message || 'common.storeExists');
    return null;
  }
};

export const updateStore = async (id: string, store: Partial<StoreApiData>): Promise<StoreApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/stores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update store');
    }
    return data;
  } catch (error: any) {
    console.error('Update Store Error:', error);
    toast.error(error.message || 'common.storeUpdateFailed');
    return null;
  }
};

export const deleteStore = async (id: string): Promise<boolean> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/stores/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete store');
    }
    return true;
  } catch (error: any) {
    console.error('Delete Store Error:', error);
    toast.error(error.message || 'common.storeDeleteFailed');
    return false;
  }
};

// --- API volání pro ShelfRacks ---
export const getAllShelfRacks = async (): Promise<ShelfRackApiData[]> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/racks`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch racks');
    }
    return data;
  } catch (error: any) {
    console.error('Get All Racks Error:', error);
    toast.error(error.message || 'common.racksFetchFailed');
    return [];
  }
};

export const createShelfRack = async (rack: ShelfRackApiData): Promise<ShelfRackApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/racks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rack),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create rack');
    }
    return data;
  } catch (error: any) {
    console.error('Create Rack Error:', error);
    toast.error(error.message || 'common.rackExists');
    return null;
  }
};

export const updateShelfRack = async (id: string, rack: Partial<ShelfRackApiData>): Promise<ShelfRackApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/racks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rack),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update rack');
    }
    return data;
  } catch (error: any) {
    console.error('Update Rack Error:', error);
    toast.error(error.message || 'common.rackUpdateFailed');
    return null;
  }
};

export const deleteShelfRack = async (id: string): Promise<boolean> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/racks/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete rack');
    }
    return true;
  } catch (error: any) {
    console.error('Delete Rack Error:', error);
    toast.error(error.message || 'common.rackDeleteFailed');
    return false;
  }
};

// --- API volání pro Articles ---
export const getAllArticles = async (): Promise<ArticleApiData[]> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/articles`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch articles');
    }
    return data;
  } catch (error: any) {
    console.error('Get All Articles Error:', error);
    toast.error(error.message || 'common.articlesFetchFailed');
    return [];
  }
};

export const createArticle = async (article: ArticleApiData): Promise<ArticleApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create article');
    }
    return data;
  } catch (error: any) {
    console.error('Create Article Error:', error);
    toast.error(error.message || 'common.articleExistsInStore');
    return null;
  }
};

export const updateArticle = async (id: string, storeId: string, article: Partial<ArticleApiData>): Promise<ArticleApiData | null> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/articles/${id}/${storeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update article');
    }
    return data;
  } catch (error: any) {
    console.error('Update Article Error:', error);
    toast.error(error.message || 'common.articleUpdateFailed');
    return null;
  }
};

export const deleteArticle = async (id: string, storeId: string): Promise<boolean> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/articles/${id}/${storeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete article');
    }
    return true;
  } catch (error: any) {
    console.error('Delete Article Error:', error);
    toast.error(error.message || 'common.articleDeleteFailed');
    return false;
  }
};