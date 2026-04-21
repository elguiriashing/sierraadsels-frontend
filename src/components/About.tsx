"use client";

import { useState } from "react";
import { useCMS } from "@/context/CMSContext";
import { useAuth } from "@/context/AuthContext";

export default function About() {
  const { siteContent, updateSiteContent, isEditMode } = useCMS();
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(siteContent.aboutText);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteContent({ aboutText: editText });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Opslaan mislukt. Probeer opnieuw.");
    } finally {
      setIsSaving(false);
    }
  };

  const paragraphs = siteContent.aboutText.split("\n\n");

  const showEdit = isEditMode && isAuthenticated;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 relative">
      {/* Edit Mode Indicator */}
      {showEdit && !isEditing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-stone-800 text-white px-4 py-2 rounded-full text-xs shadow-lg">
          ✎ Klik op "Bewerk tekst" om de inhoud te wijzigen
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] text-stone-800 mb-12 text-center">
        OVER SIERRAADSELS
      </h1>

      {isEditMode && !isEditing && (
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-stone-800 text-white text-xs uppercase tracking-wider rounded hover:bg-stone-700 transition-colors"
          >
            Bewerk tekst
          </button>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={15}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 font-light leading-relaxed text-stone-800"
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditText(siteContent.aboutText);
                setIsEditing(false);
              }}
              className="px-6 py-3 border border-stone-300 text-stone-600 text-sm uppercase tracking-wider rounded hover:bg-stone-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-stone-800 text-white text-sm uppercase tracking-wider rounded hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Bezig..." : "Opslaan"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-stone-600 font-light leading-relaxed text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-stone-200">
        <div className="flex flex-col items-center gap-2 text-stone-500">
          <span className="text-sm tracking-widest uppercase">
            Handgemaakte sieraden
          </span>
          <span className="text-xs tracking-wide">Sinds 1999</span>
        </div>
      </div>
    </div>
  );
}
