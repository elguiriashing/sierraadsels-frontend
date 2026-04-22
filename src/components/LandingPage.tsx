"use client";

import { useState } from "react";
import { useCMS } from "@/context/CMSContext";
import { useAuth } from "@/context/AuthContext";

interface LandingPageProps {
  onCategoryChange: (category: string) => void;
}

// Editable text component
function EditableText({
  value,
  onSave,
  isEditing,
  setIsEditing,
  multiline = false,
  className = "",
  inputClassName = "",
  placeholder = "",
}: {
  value: string;
  onSave: (val: string) => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const [editValue, setEditValue] = useState(value);

  if (!isEditing) {
    return (
      <span className={className} onClick={() => setIsEditing(true)}>
        {value || placeholder}
      </span>
    );
  }

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (multiline) {
    return (
      <div className="w-full">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={`${inputClassName} w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800`}
          rows={3}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-stone-800 text-white text-xs rounded"
          >
            Opslaan
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-stone-200 text-stone-700 text-xs rounded"
          >
            Annuleren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center gap-2">
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className={`${inputClassName} flex-1 px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800`}
        autoFocus
      />
      <button
        onClick={handleSave}
        className="px-3 py-2 bg-stone-800 text-white text-xs rounded"
      >
        ✓
      </button>
      <button
        onClick={handleCancel}
        className="px-3 py-2 bg-stone-200 text-stone-700 text-xs rounded"
      >
        ✕
      </button>
    </div>
  );
}

export default function LandingPage({ onCategoryChange }: LandingPageProps) {
  const { categories, items, siteContent, updateSiteContent, isEditMode, uploadItemImage } = useCMS();
  const { isAuthenticated } = useAuth();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveText = async (key: string, val: string) => {
    await updateSiteContent({ [key]: val });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadItemImage(file);
      await updateSiteContent({ makerImage: imageUrl });
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Uploaden mislukt. Probeer opnieuw.");
    } finally {
      setIsUploading(false);
    }
  };

  // Get count of items per category
  const getCategoryCount = (slug: string) => {
    return items.filter((item) => item.category === slug).length;
  };

  const showEdit = isEditMode && isAuthenticated;

  return (
    <div className="min-h-screen bg-white">
      {/* Edit Mode Indicator */}
      {showEdit && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-stone-800 text-white px-4 py-2 rounded-full text-xs shadow-lg">
          ✎ Klik op tekst om te bewerken
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-stone-100">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-400" />
              <path d="M0,60 Q25,40 50,60 T100,60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-300" />
              <path d="M0,40 Q25,20 50,40 T100,40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-300" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1 className={`text-4xl md:text-6xl font-light tracking-[0.15em] text-stone-800 mb-6 ${showEdit ? 'cursor-pointer hover:bg-stone-200/50 rounded px-2' : ''}`}>
            {showEdit ? (
              <EditableText
                value={siteContent.heroTitle}
                onSave={(val) => handleSaveText("heroTitle", val)}
                isEditing={editingSection === "heroTitle"}
                setIsEditing={(v) => setEditingSection(v ? "heroTitle" : null)}
                inputClassName="text-4xl md:text-6xl font-light tracking-[0.15em] text-center"
              />
            ) : (
              siteContent.heroTitle
            )}
          </h1>

          <p className={`text-lg md:text-xl font-light text-stone-500 tracking-wide mb-8 ${showEdit ? 'cursor-pointer hover:bg-stone-200/50 rounded px-2' : ''}`}>
            {showEdit ? (
              <EditableText
                value={siteContent.heroSubtitle}
                onSave={(val) => handleSaveText("heroSubtitle", val)}
                isEditing={editingSection === "heroSubtitle"}
                setIsEditing={(v) => setEditingSection(v ? "heroSubtitle" : null)}
                inputClassName="text-lg md:text-xl font-light text-center"
              />
            ) : (
              siteContent.heroSubtitle
            )}
          </p>

          <p className={`text-sm md:text-base text-stone-400 max-w-lg mx-auto leading-relaxed ${showEdit ? 'cursor-pointer hover:bg-stone-200/50 rounded px-2' : ''}`}>
            {showEdit ? (
              <EditableText
                value={siteContent.heroDescription}
                onSave={(val) => handleSaveText("heroDescription", val)}
                isEditing={editingSection === "heroDescription"}
                setIsEditing={(v) => setEditingSection(v ? "heroDescription" : null)}
                inputClassName="text-sm md:text-base text-center"
              />
            ) : (
              siteContent.heroDescription
            )}
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-center text-sm uppercase tracking-[0.3em] text-stone-400 mb-12">
          Collecties
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.slug);
            const sampleImage = items.find((item) => item.category === cat.slug);

            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.slug)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100 hover:shadow-lg transition-all duration-300"
              >
                {sampleImage ? (
                  <img
                    src={sampleImage.src}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-200">
                    <span className="text-stone-400 text-4xl font-light">{cat.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                  <h3 className="text-white text-sm md:text-base font-light tracking-wider uppercase">{cat.name}</h3>
                  <p className="text-white/70 text-xs mt-1">
                    {count} {count === 1 ? "sieraad" : "sieraden"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Meet the Creator Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Editable Maker Image */}
          <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 relative group">
            {showEdit && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer text-white text-xs text-center px-2">
                  {isUploading ? (
                    <span>Uploaden...</span>
                  ) : (
                    <>
                      <span className="block mb-1">✎</span>
                      <span>Upload foto</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
            <img
              src={siteContent.makerImage}
              alt={`${siteContent.makerName} - Creator of Sierraadsels`}
              className="w-full h-full object-contain rounded-full shadow-lg bg-stone-100"
            />
          </div>
          <div className="text-center md:text-left">
            {/* Editable Maker Title */}
            <h2 className={`text-sm uppercase tracking-[0.3em] text-stone-400 mb-4 ${showEdit ? 'cursor-pointer hover:bg-stone-100 rounded px-2 inline-block' : ''}`}>
              {showEdit ? (
                <EditableText
                  value={siteContent.makerTitle}
                  onSave={(val) => handleSaveText("makerTitle", val)}
                  isEditing={editingSection === "makerTitle"}
                  setIsEditing={(v) => setEditingSection(v ? "makerTitle" : null)}
                  inputClassName="text-sm uppercase tracking-[0.3em] text-center"
                />
              ) : (
                siteContent.makerTitle
              )}
            </h2>
            {/* Editable Maker Name */}
            <h3 className={`text-2xl md:text-3xl font-light text-stone-800 mb-4 ${showEdit ? 'cursor-pointer hover:bg-stone-100 rounded px-2 inline-block' : ''}`}>
              {showEdit ? (
                <EditableText
                  value={siteContent.makerName}
                  onSave={(val) => handleSaveText("makerName", val)}
                  isEditing={editingSection === "makerName"}
                  setIsEditing={(v) => setEditingSection(v ? "makerName" : null)}
                  inputClassName="text-2xl md:text-3xl font-light text-center"
                />
              ) : (
                siteContent.makerName
              )}
            </h3>
            {/* Editable Maker Description */}
            <div className={`text-stone-600 font-light leading-relaxed ${showEdit ? 'cursor-pointer hover:bg-stone-100 rounded px-2 py-1 inline-block' : ''}`}>
              {showEdit ? (
                <EditableText
                  value={siteContent.makerDescription}
                  onSave={(val) => handleSaveText("makerDescription", val)}
                  isEditing={editingSection === "makerDescription"}
                  setIsEditing={(v) => setEditingSection(v ? "makerDescription" : null)}
                  multiline
                  inputClassName="text-stone-600 font-light leading-relaxed text-center md:text-left"
                />
              ) : (
                siteContent.makerDescription
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <blockquote 
            className={`text-xl md:text-2xl font-light text-stone-600 italic leading-relaxed ${showEdit ? 'cursor-pointer hover:bg-white/50 rounded px-2 py-1' : ''}`}
            onClick={() => showEdit && setEditingSection("quoteText")}
          >
            "
            {showEdit ? (
              <EditableText
                value={siteContent.quoteText}
                onSave={(val) => handleSaveText("quoteText", val)}
                isEditing={editingSection === "quoteText"}
                setIsEditing={(v) => setEditingSection(v ? "quoteText" : null)}
                inputClassName="text-xl md:text-2xl font-light italic text-center"
                placeholder="Klik om een quote toe te voegen..."
              />
            ) : (
              siteContent.quoteText || (showEdit && <span className="text-stone-400">Klik om een quote toe te voegen...</span>)
            )}
            "
          </blockquote>
          <div className="mt-6 w-12 h-px bg-stone-300 mx-auto" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <p className={`text-stone-500 mb-6 ${showEdit ? 'cursor-pointer hover:bg-stone-100 rounded px-2 py-1 inline-block' : ''}`}>
          {showEdit ? (
            <EditableText
              value={siteContent.ctaText}
              onSave={(val) => handleSaveText("ctaText", val)}
              isEditing={editingSection === "ctaText"}
              setIsEditing={(v) => setEditingSection(v ? "ctaText" : null)}
            />
          ) : (
            siteContent.ctaText
          )}
        </p>
        <button
          onClick={() => onCategoryChange("contact")}
          className="px-8 py-4 bg-stone-800 text-white text-sm uppercase tracking-widest rounded hover:bg-stone-700 transition-colors"
        >
          Neem contact op
        </button>
      </section>
    </div>
  );
}
