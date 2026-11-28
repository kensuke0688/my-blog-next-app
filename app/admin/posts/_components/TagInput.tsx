"use client";

import { useEffect, useRef, useState } from "react";
import type { ListTagsResponseBody } from "@/app/api/admin/tags/route";

type TagInputProps = {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
};

export default function TagInput({
  id,
  value,
  onChange,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<ListTagsResponseBody>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = inputValue.trim();
    if (!query) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/tags?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) return;
        const tags: ListTagsResponseBody = await res.json();
        const selectedLower = new Set(
          value.map((tag) => tag.toLowerCase())
        );
        setSuggestions(tags.filter((tag) => !selectedLower.has(tag.name.toLowerCase())));
        setHighlightedIndex(0);
        setIsOpen(true);
      } catch {
        // 候補取得に失敗しても入力自体は継続できるようにする
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const alreadySelected = value.some(
      (tag) => tag.toLowerCase() === trimmed.toLowerCase()
    );
    if (!alreadySelected) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const removeTag = (name: string) => {
    onChange(value.filter((tag) => tag !== name));
  };

  const commitInput = () => {
    if (isOpen && suggestions[highlightedIndex]) {
      addTag(suggestions[highlightedIndex].name);
      return;
    }
    const exactMatch = suggestions.find(
      (tag) => tag.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    addTag(exactMatch ? exactMatch.name : inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitInput();
      return;
    }
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md shadow-sm p-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className="text-gray-400 hover:text-gray-700"
              aria-label={`${tag}を削除`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.trim() && setIsOpen(true)}
          disabled={disabled}
          placeholder={value.length === 0 ? "タグを入力してEnter" : ""}
          className="flex-1 min-w-[8rem] outline-none text-sm py-1"
        />
      </div>

      {isOpen && inputValue.trim().length > 0 && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg text-sm">
          {suggestions.map((tag, index) => (
            <li key={tag.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(tag.name)}
                className={`w-full text-left px-3 py-2 hover:bg-sky-100 ${
                  index === highlightedIndex ? "bg-sky-100" : ""
                }`}
              >
                #{tag.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
