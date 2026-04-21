"use client";

import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CMSProvider, useCMS } from "@/context/CMSContext";
import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import LandingPage from "@/components/LandingPage";
import LoginModal from "@/components/LoginModal";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { cn } from "@/lib/utils";

// Editable text component for category pages
function CategoryEditableText({
  value,
  onSave,
  placeholder,
  multiline = false,
  className = "",
}: {
  value: string;
  onSave: (val: string) => void;
  placeholder: string;
  multiline?: boolean;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  if (!isEditing) {
    return (
      <div
        className={cn(
          "cursor-pointer hover:bg-stone-100 rounded px-2 py-1 transition-colors",
          className
        )}
        onClick={() => setIsEditing(true)}
      >
        {value || <span className="text-stone-400 italic">{placeholder}</span>}
      </div>
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
          className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800"
          rows={4}
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
        className="flex-1 px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800"
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

function MainContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { items, categories, isEditMode, updateCategory } = useCMS();

  // Find current category for category pages
  const currentCategory = categories.find((cat) => cat.slug === activeCategory);
  const showEdit = isEditMode;

  const renderContent = () => {
    switch (activeCategory) {
      case "about":
        return <About />;
      case "contact":
        return <Contact />;
      case "all":
        return <LandingPage onCategoryChange={setActiveCategory} />;
      default:
        const hasTopText = currentCategory?.topText || showEdit;
        const hasBottomText = currentCategory?.bottomText || showEdit;

        return (
          <div className="px-4 md:px-6 py-6">
            {isEditMode && (
              <div className="mb-6 p-4 bg-stone-100 rounded-lg">
                <p className="text-sm text-stone-600">
                  <span className="font-medium">Bewerkmodus actief:</span> Sleep
                  items om ze te herordenen. Klik op een item om de foto te
                  vervangen of te verwijderen.
                </p>
              </div>
            )}

            {/* Top Text Section */}
            {hasTopText && currentCategory && (
              <div className="mb-8 max-w-3xl">
                {showEdit ? (
                  <CategoryEditableText
                    value={currentCategory.topText || ""}
                    onSave={(val) => updateCategory(currentCategory.id, { topText: val })}
                    placeholder="Klik om introtekst toe te voegen..."
                    multiline
                    className="text-stone-600 font-light leading-relaxed"
                  />
                ) : (
                  currentCategory.topText && (
                    <p className="text-stone-600 font-light leading-relaxed">
                      {currentCategory.topText}
                    </p>
                  )
                )}
              </div>
            )}

            <Gallery items={items} category={activeCategory} />

            {/* Bottom Text Section */}
            {hasBottomText && currentCategory && (
              <div className="mt-12 max-w-3xl">
                {showEdit ? (
                  <CategoryEditableText
                    value={currentCategory.bottomText || ""}
                    onSave={(val) => updateCategory(currentCategory.id, { bottomText: val })}
                    placeholder="Klik om outro tekst toe te voegen..."
                    multiline
                    className="text-stone-600 font-light leading-relaxed"
                  />
                ) : (
                  currentCategory.bottomText && (
                    <p className="text-stone-600 font-light leading-relaxed">
                      {currentCategory.bottomText}
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen",
          activeCategory === "all" ? "" : "pt-16 md:pt-16",
          activeCategory === "about" || activeCategory === "contact"
            ? "bg-stone-50"
            : "bg-white"
        )}
      >
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-light tracking-[0.2em] mb-2">
                SIERRAADSELS
              </h3>
              <p className="text-stone-400 text-sm">
                Handgemaakte zilveren sieraden
              </p>
            </div>

            <div className="flex items-center gap-8 text-sm text-stone-400">
              <button
                onClick={() => setActiveCategory("about")}
                className="hover:text-white transition-colors"
              >
                Over
              </button>
              <button
                onClick={() => setActiveCategory("contact")}
                className="hover:text-white transition-colors"
              >
                Contact
              </button>
            </div>

            <p className="text-stone-500 text-xs">
              © {new Date().getFullYear()} Sierraadsels. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <CMSProvider>
        <MainContent />
      </CMSProvider>
    </AuthProvider>
  );
}
