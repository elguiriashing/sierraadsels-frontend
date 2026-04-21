import { JewelryItem, Category, SiteContent } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Get auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("sierra_token");
  }
  return null;
};

// API client
async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export async function login(password: string): Promise<{ token: string }> {
  return fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// Items
export async function getItems(): Promise<JewelryItem[]> {
  return fetchApi("/items");
}

export async function createItem(
  item: Omit<JewelryItem, "id">
): Promise<JewelryItem> {
  return fetchApi("/items", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function updateItem(
  id: string,
  updates: Partial<JewelryItem>
): Promise<JewelryItem> {
  return fetchApi(`/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteItem(id: string): Promise<void> {
  return fetchApi(`/items/${id}`, {
    method: "DELETE",
  });
}

// Categories
export async function getCategories(): Promise<Category[]> {
  return fetchApi("/categories");
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category> {
  return fetchApi(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// Site Content
export async function getSiteContent(): Promise<SiteContent> {
  return fetchApi("/site-content");
}

export async function updateSiteContent(
  content: Partial<SiteContent>
): Promise<SiteContent> {
  return fetchApi("/site-content", {
    method: "PUT",
    body: JSON.stringify(content),
  });
}

// Image Upload
export async function uploadImage(file: File): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const token = getToken();
  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

export async function deleteImage(key: string): Promise<void> {
  return fetchApi(`/upload/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
}
