import { useTranslation } from "react-i18next";
import { IoSearchOutline } from "react-icons/io5";
import { useEffect, useMemo, useRef, useState } from "react";
import "./char-search.css";
import type { CharacterGuess } from "../../types/characterGuess";
import type { Character } from "../../types/character";

interface CharacterSearchProps {
  characters: Character[];
  guessedCharacters: CharacterGuess[];
  disabled?: boolean;
  onGuess: (guess: string) => Promise<void>;
}

export default function CharacterSearch({
  characters,
  guessedCharacters,
  disabled = true,
  onGuess,
}: CharacterSearchProps) {
  const { t } = useTranslation();
  const [characterSearch, setCharacterSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const search = debouncedSearch.toLowerCase().trim();
  const isValidSearch =
    search.length >= 2 ||
    (search.length === 1 &&
      characters.some((c) => c.name.toLowerCase() === search));
  const filteredCharacters = useMemo(() => {
    if (!isValidSearch) return [];
    return characters
      .filter(
        (c) =>
          c.name.toLowerCase().includes(search) &&
          !guessedCharacters.some((g) => g.slug === c.slug),
      )
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(search);
        const bStarts = b.name.toLowerCase().startsWith(search);

        if (aStarts === bStarts) return a.name.localeCompare(b.name);
        return aStarts ? -1 : 1;
      });
  }, [characters, guessedCharacters, search, isValidSearch]);

  const handleGuessAppend = async (slug: string) => {
    await onGuess(slug);
    setCharacterSearch("");
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (filteredCharacters.length === 0) return;
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredCharacters.length - 1),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter": {
        e.preventDefault();
        const selected = filteredCharacters[selectedIndex];
        if (!selected) return;
        await handleGuessAppend(selected.slug);
        break;
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [characterSearch]);

  useEffect(() => {
    if (selectedIndex < 0) return;
    itemRefs.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(characterSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [characterSearch]);

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <IoSearchOutline />

      <input
        className="input-character"
        type="text"
        placeholder={
          disabled ? t("input.placeholderTrue") : t("input.placeholderFalse")
        }
        value={characterSearch}
        onChange={(e) => setCharacterSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        name="character-input-search"
      />

      {isFocused && isValidSearch && (
        <div className="search-dropdown">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.slice(0, 8).map((c, index) => (
              <button
                className={`search-select ${index === selectedIndex ? "selected" : ""}`}
                key={c.slug}
                onClick={() => handleGuessAppend(c.slug)}
                onMouseEnter={() => setSelectedIndex(index)}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
              >
                <img src={`/icons/${c.slug}.webp`} alt={c.name} />
                <p>{c.name}</p>
              </button>
            ))
          ) : (
            <div className="search-select">
              <p>{t("input.noCharacterFound")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
