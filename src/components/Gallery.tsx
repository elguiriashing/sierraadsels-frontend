"use client";

import { useState, useCallback } from "react";
import { useCMS } from "@/context/CMSContext";
import { JewelryItem } from "@/types";
import { cn } from "@/lib/utils";
import Lightbox from "./Lightbox";

interface GalleryProps {
  items: JewelryItem[];
  category: string;
}

export default function Gallery({ items, category }: GalleryProps) {
  const { isEditMode, updateItem, deleteItem, reorderItems, addItem, uploadItemImage } = useCMS();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState<JewelryItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredItems = items
    .filter((item) => (category === "all" ? true : item.category === category))
    .sort((a, b) => a.order - b.order);

  const openLightbox = (index: number) => {
    if (!isEditMode) {
      setCurrentIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: JewelryItem) => {
    if (!isEditMode) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetItem: JewelryItem) => {
    if (!isEditMode || !draggedItem || draggedItem.id === targetItem.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetItem: JewelryItem) => {
    if (!isEditMode || !draggedItem || draggedItem.id === targetItem.id) return;
    e.preventDefault();

    const newOrder = [...filteredItems];
    const draggedIndex = newOrder.findIndex((i) => i.id === draggedItem.id);
    const targetIndex = newOrder.findIndex((i) => i.id === targetItem.id);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    // Update order property
    const reordered = newOrder.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    reorderItems(category, reordered);
    setDraggedItem(null);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadItemImage(file);
      await updateItem(itemId, { src: imageUrl });
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Uploaden mislukt. Probeer opnieuw.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newItem: Omit<JewelryItem, "id"> = {
        src: "",
        title: "",
        description: "",
        category: category === "all" ? "ringen-2" : category,
        order: filteredItems.length,
      };
      await addItem(newItem, file);
    } catch (err) {
      console.error("Failed to add item:", err);
      alert("Toevoegen mislukt. Probeer opnieuw.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, item)}
            onDrop={(e) => handleDrop(e, item)}
            className={cn(
              "group relative aspect-square overflow-hidden bg-stone-100 rounded-lg",
              isEditMode && "cursor-move hover:ring-2 hover:ring-stone-400",
              !isEditMode && "cursor-pointer"
            )}
            onClick={() => openLightbox(index)}
          >
            {/* Image */}
            <img
              src={item.src}
              alt={item.title || "Jewelry"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // Fallback for missing images
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23e7e5e4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2378716c'%3ESierraadsels%3C/text%3E%3C/svg%3E";
              }}
            />

            {/* Hover Overlay */}
            {!isEditMode && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            )}

            {/* Edit Controls - Always visible on mobile, hover on desktop */}
            {isEditMode && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity">
                <label className="px-3 py-1.5 bg-white text-stone-800 text-[10px] uppercase tracking-wider rounded cursor-pointer hover:bg-stone-100 transition-colors">
                  Vervang foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, item.id)}
                  />
                </label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(item.id);
                  }}
                  className="px-3 py-1.5 bg-stone-200 text-stone-800 text-[10px] uppercase tracking-wider rounded hover:bg-stone-300 transition-colors"
                >
                  Info
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Weet je zeker dat je dit item wilt verwijderen?")) {
                      deleteItem(item.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-500 text-white text-[10px] uppercase tracking-wider rounded hover:bg-red-600 transition-colors"
                >
                  Verwijder
                </button>
              </div>
            )}

            {/* Title overlay (if exists) */}
            {item.title && !isEditMode && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm font-light">{item.title}</p>
              </div>
            )}
          </div>
        ))}

        {/* Add New Button (Edit Mode Only) */}
        {isEditMode && (
          <label className="aspect-square border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-stone-500 hover:bg-stone-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAddNew}
              disabled={isUploading}
            />
            {isUploading ? (
              <span className="text-xs uppercase tracking-wider text-stone-500">
                Uploaden...
              </span>
            ) : (
              <>
                <svg
                  className="w-8 h-8 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-xs uppercase tracking-wider text-stone-500">
                  Nieuw item
                </span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Edit Item Modal */}
      {editingId && (
        <EditItemModal
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updates) => {
            updateItem(editingId, updates);
            setEditingId(null);
          }}
        />
      )}

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={filteredItems}
        currentIndex={currentIndex}
        onNavigate={setCurrentIndex}
      />
    </>
  );
}

// Edit Item Modal Component
function EditItemModal({
  item,
  onClose,
  onSave,
}: {
  item: JewelryItem;
  onClose: () => void;
  onSave: (updates: Partial<JewelryItem>) => void;
}) {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-light tracking-widest text-stone-800 mb-6">
          ITEM BEWERKEN
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800"
              placeholder="Titel van het sieraad..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">
              Beschrijving
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800"
              placeholder="Beschrijving..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-stone-300 text-stone-600 text-sm uppercase tracking-wider rounded hover:bg-stone-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={() => onSave({ title, description })}
            className="flex-1 py-3 bg-stone-800 text-white text-sm uppercase tracking-wider rounded hover:bg-stone-700 transition-colors"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
