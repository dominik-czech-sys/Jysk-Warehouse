import { toast } from "sonner";

// Default API URL, který může být přepsán v AdminApiConfig
export const getApiUrl = (): string => {
  return localStorage.getItem('API_URL') || 'http://127.0.0.1:3001/api'; // Změněno na 127.0.0.1
};

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

// Removed UserApiData interface as user management is now local.
// Removed loginUser, getUser, createUser, updateUser, deleteUser, getAllUsers functions.

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

// Funkce pro inicializaci databáze na backendu (stále relevantní pro ostatní data)
export const initDatabase = async (): Promise<boolean> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/init-db`, {
      method: 'POST',
      headers: getAuthHeaders(), // init-db should also be authenticated (admin action)
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

// --- API volání pro Stores ---
export const getAllStores = async (): Promise<StoreApiData[]> => {
  const API_URL = getApiUrl();
  try {
    const response = await fetch(`${API_URL}/stores`, {
      headers: getAuthHeaders(),
    });
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_URL}/racks`, {
      headers: getAuthHeaders(),
    });
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_URL}/articles`, {
      headers: getAuthHeaders(),
    });
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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