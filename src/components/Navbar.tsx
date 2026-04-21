"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCMS } from "@/context/CMSContext";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onLoginClick: () => void;
}

export default function Navbar({
  categories,
  activeCategory,
  onCategoryChange,
  onLoginClick,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { isEditMode, setEditMode } = useCMS();

  const handleLoginLogout = () => {
    if (isAuthenticated) {
      logout();
      setEditMode(false);
    } else {
      onLoginClick();
    }
    setIsMobileMenuOpen(false);
  };

  const toggleEditMode = () => {
    setEditMode(!isEditMode);
  };

  return (
    <>
      {/* Desktop Navigation - Centered */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-center h-16">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCategoryChange("all");
              }}
              className="absolute left-4 lg:left-6 text-lg lg:text-xl font-light tracking-[0.15em] lg:tracking-[0.2em] text-stone-800 hover:text-stone-600 transition-colors whitespace-nowrap"
            >
              SIERRAADSELS
            </a>

            {/* Centered Navigation */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <button
                onClick={() => onCategoryChange("all")}
                className={cn(
                  "text-xs tracking-wide lg:tracking-widest uppercase transition-all duration-300 whitespace-nowrap",
                  activeCategory === "all"
                    ? "text-stone-900 border-b-2 border-stone-900 pb-0.5"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                Portfolio
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.slug)}
                  className={cn(
                    "text-xs tracking-wide lg:tracking-widest uppercase transition-all duration-300 whitespace-nowrap",
                    activeCategory === cat.slug
                      ? "text-stone-900 border-b-2 border-stone-900 pb-0.5"
                      : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => onCategoryChange("about")}
                className={cn(
                  "text-xs tracking-wide lg:tracking-widest uppercase transition-all duration-300 whitespace-nowrap",
                  activeCategory === "about"
                    ? "text-stone-900 border-b-2 border-stone-900 pb-0.5"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                Over
              </button>
              <button
                onClick={() => onCategoryChange("contact")}
                className={cn(
                  "text-xs tracking-wide lg:tracking-widest uppercase transition-all duration-300 whitespace-nowrap",
                  activeCategory === "contact"
                    ? "text-stone-900 border-b-2 border-stone-900 pb-0.5"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                Contact
              </button>
            </div>

            {/* Right Side - Login/Edit */}
            <div className="absolute right-4 lg:right-6 flex items-center space-x-2 lg:space-x-3">
              {isAuthenticated && (
                <button
                  onClick={toggleEditMode}
                  className={cn(
                    "text-xs tracking-wide uppercase px-3 py-1.5 rounded transition-all whitespace-nowrap",
                    isEditMode
                      ? "bg-stone-800 text-white"
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                  )}
                >
                  {isEditMode ? "Bewerken" : "Bewerk"}
                </button>
              )}
              <button
                onClick={handleLoginLogout}
                className="text-xs tracking-wide lg:tracking-widest uppercase text-stone-500 hover:text-stone-800 transition-colors whitespace-nowrap"
              >
                {isAuthenticated ? "Uitloggen" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Burger Menu */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 md:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onCategoryChange("all");
            }}
            className="text-xl font-light tracking-[0.15em] text-stone-800"
          >
            SIERRAADSELS
          </a>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-stone-800"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={cn(
                  "w-full h-0.5 bg-stone-800 transition-all duration-300",
                  isMobileMenuOpen && "rotate-45 translate-y-2"
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 bg-stone-800 transition-all duration-300",
                  isMobileMenuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 bg-stone-800 transition-all duration-300",
                  isMobileMenuOpen && "-rotate-45 -translate-y-2"
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-white z-[100] transition-transform duration-300 ease-out md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Overlay Header with Close Button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-stone-200 bg-white/95 backdrop-blur-md">
            <span className="text-xl font-light tracking-[0.15em] text-stone-800">SIERRAADSELS</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-stone-800"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col h-[calc(100vh-4rem)] py-4 px-6 overflow-y-auto bg-white">
            <button
              onClick={() => {
                onCategoryChange("all");
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "text-sm tracking-wider uppercase py-2 border-b border-stone-100/50 text-left transition-colors",
                activeCategory === "all" ? "text-stone-900" : "text-stone-500/80"
              )}
            >
              Portfolio
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.slug);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "text-sm tracking-wider uppercase py-2 border-b border-stone-100/50 text-left transition-colors",
                  activeCategory === cat.slug ? "text-stone-900" : "text-stone-500/80"
                )}
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => {
                onCategoryChange("about");
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "text-sm tracking-wider uppercase py-2 border-b border-stone-100/50 text-left transition-colors",
                activeCategory === "about" ? "text-stone-900" : "text-stone-500/80"
              )}
            >
              Over
            </button>

            <button
              onClick={() => {
                onCategoryChange("contact");
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "text-sm tracking-wider uppercase py-2 border-b border-stone-100/50 text-left transition-colors",
                activeCategory === "contact" ? "text-stone-900" : "text-stone-500/80"
              )}
            >
              Contact
            </button>

            {/* Spacer */}
            <div className="flex-1 min-h-4" />

            {/* Edit Mode Toggle (if authenticated) */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  toggleEditMode();
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "text-sm tracking-wider uppercase py-2 border-b border-stone-100/50 text-left transition-colors",
                  isEditMode ? "text-stone-900 font-medium" : "text-stone-500/80"
                )}
              >
                {isEditMode ? "Bewerken Actief" : "Bewerk Modus"}
              </button>
            )}

            {/* Login/Logout at Bottom */}
            <button
              onClick={handleLoginLogout}
              className="text-sm tracking-wider uppercase py-3 text-stone-500/80 text-left mt-auto"
            >
              {isAuthenticated ? "Uitloggen" : "Login"}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
