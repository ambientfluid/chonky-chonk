"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WORD_LISTS } from "@/lib/games/word-lists";

/* -------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

export interface WordPickerProps {
  onSubmit: (word: string, category: string) => void;
  loading?: boolean;
}

type PickMode = "category" | "custom";

/* -------------------------------------------------------------------------
 * Category badge colors
 * ----------------------------------------------------------------------- */

const categoryBadgeVariant: Record<string, "pink" | "purple" | "green" | "blue" | "gray"> = {
  animals: "pink",
  foods: "green",
  sports: "blue",
  nature: "purple",
  colors: "pink",
};

/* -------------------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------------- */

export function WordPicker({ onSubmit, loading = false }: WordPickerProps) {
  const [mode, setMode] = useState<PickMode>("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customWord, setCustomWord] = useState("");
  const [error, setError] = useState<string | null>(null);

  const categories = Object.keys(WORD_LISTS);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setError(null);
  }, []);

  const handleWordSelect = useCallback(
    (word: string, category: string) => {
      if (loading) return;
      onSubmit(word, category);
    },
    [loading, onSubmit],
  );

  const handleCustomSubmit = useCallback(() => {
    const trimmed = customWord.trim().toLowerCase();

    if (trimmed.length < 3) {
      setError("Word must be at least 3 letters");
      return;
    }

    if (trimmed.length > 20) {
      setError("Word must be 20 letters or fewer");
      return;
    }

    if (!/^[a-z\s]+$/.test(trimmed)) {
      setError("Word can only contain letters and spaces");
      return;
    }

    setError(null);
    onSubmit(trimmed, "custom");
  }, [customWord, onSubmit]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-grape-700">
          Pick a Word
        </h2>
        <p className="mt-1 text-sm text-grape-400">
          Choose a word for your opponent to guess!
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            setMode("category");
            setError(null);
          }}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-semibold",
            "transition-all duration-200",
            mode === "category"
              ? "bg-bubblegum-500 text-white shadow-md shadow-bubblegum-300/40"
              : "bg-grape-100 text-grape-500 hover:bg-grape-200",
          )}
        >
          From Category
        </button>
        <button
          onClick={() => {
            setMode("custom");
            setSelectedCategory(null);
            setError(null);
          }}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-semibold",
            "transition-all duration-200",
            mode === "custom"
              ? "bg-bubblegum-500 text-white shadow-md shadow-bubblegum-300/40"
              : "bg-grape-100 text-grape-500 hover:bg-grape-200",
          )}
        >
          Custom Word
        </button>
      </div>

      {/* Category mode */}
      {mode === "category" && (
        <div className="space-y-4">
          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold capitalize",
                  "border-2 transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  selectedCategory === category
                    ? "border-bubblegum-400 bg-bubblegum-50 text-bubblegum-600"
                    : "border-grape-200 bg-white text-grape-600 hover:border-grape-300",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Word list for selected category */}
          {selectedCategory && (
            <Card className="animate-pop p-4">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant={categoryBadgeVariant[selectedCategory] ?? "gray"}>
                  {selectedCategory}
                </Badge>
                <span className="text-xs text-grape-400">
                  {WORD_LISTS[selectedCategory].length} words
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {WORD_LISTS[selectedCategory].map((word) => (
                  <button
                    key={word}
                    onClick={() => handleWordSelect(word, selectedCategory)}
                    disabled={loading}
                    className={cn(
                      "rounded-xl border-2 border-grape-100 px-3 py-2.5",
                      "text-sm font-semibold capitalize text-grape-700",
                      "transition-all duration-200",
                      "hover:border-bubblegum-300 hover:bg-bubblegum-50 hover:scale-105",
                      "active:scale-95",
                      "disabled:opacity-50 disabled:pointer-events-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bubblegum-400",
                    )}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Custom mode */}
      {mode === "custom" && (
        <Card className="space-y-4 p-4">
          <div>
            <label
              htmlFor="custom-word"
              className="mb-1.5 block text-sm font-semibold text-grape-600"
            >
              Enter your word
            </label>
            <Input
              id="custom-word"
              value={customWord}
              onChange={(e) => {
                setCustomWord(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCustomSubmit();
              }}
              placeholder="Type a word..."
              maxLength={20}
              autoFocus
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-grape-400">
              3-20 letters. Your opponent will not see this!
            </p>
          </div>

          {error && (
            <p className="text-sm font-medium text-bubblegum-600">{error}</p>
          )}

          <Button
            onClick={handleCustomSubmit}
            disabled={loading || customWord.trim().length < 3}
            className="w-full"
          >
            {loading ? "Setting up..." : "Use This Word"}
          </Button>
        </Card>
      )}
    </div>
  );
}
