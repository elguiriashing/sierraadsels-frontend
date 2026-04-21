"use client";

import { useState } from "react";
import { useCMS } from "@/context/CMSContext";
import { useAuth } from "@/context/AuthContext";

export default function Contact() {
  const { siteContent, updateSiteContent, isEditMode } = useCMS();
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(siteContent.contactEmail);
  const [phone, setPhone] = useState(siteContent.contactPhone);

  const handleSave = () => {
    updateSiteContent({
      contactEmail: email,
      contactPhone: phone,
    });
    setIsEditing(false);
  };

  const showEdit = isEditMode && isAuthenticated;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 relative">
      {/* Edit Mode Indicator */}
      {showEdit && !isEditing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-stone-800 text-white px-4 py-2 rounded-full text-xs shadow-lg">
          ✎ Klik op "Bewerk contactgegevens" om te wijzigen
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] text-stone-800 mb-12 text-center">
        CONTACT
      </h1>

      <div className="bg-stone-50 rounded-lg p-8 md:p-12">
        <p className="text-stone-600 font-light text-center mb-10 leading-relaxed">
          Interesse in een sieraad of wilt u meer informatie? Neem gerust
          contact op.
        </p>

        {isEditMode && !isEditing && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => {
                setEmail(siteContent.contactEmail);
                setPhone(siteContent.contactPhone);
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-stone-800 text-white text-xs uppercase tracking-wider rounded hover:bg-stone-700 transition-colors"
            >
              Bewerk contactgegevens
            </button>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">
                Telefoon
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 border border-stone-300 text-stone-600 text-sm uppercase tracking-wider rounded hover:bg-stone-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-stone-800 text-white text-sm uppercase tracking-wider rounded hover:bg-stone-700 transition-colors"
              >
                Opslaan
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-stone-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">
                  E-mail
                </p>
                <a
                  href={`mailto:${siteContent.contactEmail}`}
                  className="text-stone-800 hover:text-stone-600 transition-colors font-light"
                >
                  {siteContent.contactEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-stone-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">
                  Telefoon
                </p>
                <a
                  href={`tel:${siteContent.contactPhone.replace(/\s/g, "")}`}
                  className="text-stone-800 hover:text-stone-600 transition-colors font-light"
                >
                  {siteContent.contactPhone}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-stone-400 text-sm mt-8 font-light">
        Reactie binnen 24 uur gegarandeerd
      </p>
    </div>
  );
}
