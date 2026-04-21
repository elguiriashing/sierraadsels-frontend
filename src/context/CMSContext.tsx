"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { JewelryItem, Category, SiteContent } from "@/types";
import {
  getItems,
  getCategories,
  getSiteContent,
  createItem as apiCreateItem,
  updateItem as apiUpdateItem,
  deleteItem as apiDeleteItem,
  updateCategory as apiUpdateCategory,
  updateSiteContent as apiUpdateSiteContent,
  uploadImage,
} from "@/lib/api";

interface CMSContextType {
  items: JewelryItem[];
  categories: Category[];
  siteContent: SiteContent;
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  isLoading: boolean;
  addItem: (item: Omit<JewelryItem, "id">, file?: File) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<JewelryItem>) => Promise<void>;
  reorderItems: (categoryId: string, newOrder: JewelryItem[]) => Promise<void>;
  updateSiteContent: (content: Partial<SiteContent>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  uploadItemImage: (file: File) => Promise<string>;
}

const defaultSiteContent: SiteContent = {
  title: "Sierraadsels",
  aboutText: "",
  contactEmail: "",
  contactPhone: "",
  heroTitle: "SIERRAADSELS",
  heroSubtitle: "Unieke handgemaakte zilveren sieraden",
  heroDescription: "",
  quoteText: "",
  ctaText: "",
  makerImage: "",
  makerTitle: "De Maker",
  makerName: "Tilly",
  makerDescription: "",
};

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<JewelryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [isEditMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [itemsData, categoriesData, siteContentData] = await Promise.all([
          getItems(),
          getCategories(),
          getSiteContent(),
        ]);
        setItems(itemsData);
        setCategories(categoriesData);
        setSiteContent(siteContentData);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addItem = async (item: Omit<JewelryItem, "id">, file?: File) => {
    try {
      let imageUrl = item.src;
      
      if (file) {
        const uploadResult = await uploadImage(file);
        imageUrl = uploadResult.url;
      }

      const newItem = await apiCreateItem({
        ...item,
        src: imageUrl,
      });
      setItems((prev) => [...prev, newItem]);
    } catch (err) {
      console.error("Failed to add item:", err);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await apiDeleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<JewelryItem>) => {
    try {
      const updated = await apiUpdateItem(id, updates);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error("Failed to update item:", err);
      throw err;
    }
  };

  const reorderItems = async (categoryId: string, newOrder: JewelryItem[]) => {
    try {
      await Promise.all(
        newOrder.map((item, idx) =>
          apiUpdateItem(item.id, { order: idx })
        )
      );
      
      const refreshed = await getItems();
      setItems(refreshed);
    } catch (err) {
      console.error("Failed to reorder items:", err);
      throw err;
    }
  };

  const updateSiteContent = async (content: Partial<SiteContent>) => {
    try {
      const updated = await apiUpdateSiteContent(content);
      setSiteContent(updated);
    } catch (err) {
      console.error("Failed to update site content:", err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updated = await apiUpdateCategory(id, updates);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat))
      );
    } catch (err) {
      console.error("Failed to update category:", err);
      throw err;
    }
  };

  const uploadItemImage = async (file: File): Promise<string> => {
    const result = await uploadImage(file);
    return result.url;
  };

  return (
    <CMSContext.Provider
      value={{
        items,
        categories,
        siteContent,
        isEditMode,
        setEditMode,
        isLoading,
        addItem,
        deleteItem,
        updateItem,
        reorderItems,
        updateSiteContent,
        updateCategory,
        uploadItemImage,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
}
