import "./all-characters.css";
import Navbar from "../../components/layout/nav/nav";
import { useEffect, useMemo, useState } from "react";
import type { CharacterFull } from "../../types/characterFull";
import { useTranslation } from "react-i18next";
import { CharacterService } from "../../services/characterService";
import LoadingScreen from "../exceptions/loading/loading";
import ErrorScreen from "../exceptions/error/error";
import { MdOutlineRestartAlt } from "react-icons/md";
import { IoFlagOutline, IoSearchOutline } from "react-icons/io5";
import confetti from "canvas-confetti";
import { getStoredStatistics } from "../../utils/stats";

const characterService = new CharacterService();
const AFFLATUS_KEYS = [
  "beast",
  "plant",
  "star",
  "mineral",
  "spirit",
  "intellect",
] as const;
const cleanStr = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

export default function AllCharacters() {
  const [characters, setCharacters] = useState<CharacterFull[]>([]);
  const [guessedSlugs, setGuessedSlugs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [hasStartedGame, setHasStartedGame] = useState(false);

  const { t } = useTranslation();

  const resetGame = (data: CharacterFull[] = characters) => {
    setTimeLeft(data.length * 10);
    setGuessedSlugs(new Set());
    setSearchText("");
    setIsFinished(false);
    setHasStartedGame(false);
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      angle: 60,
      origin: { x: 0, y: 0.7 },
    });

    confetti({
      particleCount: 80,
      angle: 120,
      origin: { x: 1, y: 0.7 },
    });
  };

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await characterService.getAllCharactersFull();
        setCharacters(data);
        if (data && data.length > 0) {
          resetGame(data);
        }
      } catch (e) {
        setError("Failed to load...");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer, don't change it;
  useEffect(() => {
    if (isLoading || isFinished || !hasStartedGame) return;
    if (timeLeft <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFinished(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isLoading, isFinished, hasStartedGame]);

  useEffect(() => {
    if (characters.length > 0 && guessedSlugs.size === characters.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFinished(true);
      handleCelebrate();
    }

    if (isFinished) {
      const stats = getStoredStatistics();

      const totalSeconds = characters.length * 10;
      const elapsedSeconds = totalSeconds - timeLeft;
      const spentMinutes = Math.floor(elapsedSeconds / 60);
      const spentSeconds = elapsedSeconds % 60;

      const currentScore = guessedSlugs.size;
      const currentTime = elapsedSeconds;

      const storedScore = stats.allCharacters?.score ?? 0;
      const storedTime =
        (stats.allCharacters?.minutes ?? 0) * 60 +
        (stats.allCharacters?.seconds ?? 0);

      if (
        currentScore > storedScore ||
        (currentScore === storedScore && currentTime < storedTime)
      ) {
        stats.allCharacters = {
          score: currentScore,
          minutes: spentMinutes,
          seconds: spentSeconds,
        };
        localStorage.setItem("statistics", JSON.stringify(stats));
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessedSlugs, characters, isFinished]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    const inputClean = cleanStr(value);
    if (!inputClean) return;
    const match = characters.find(
      (c) => cleanStr(c.name) === inputClean || cleanStr(c.slug) === inputClean,
    );
    if (match && !guessedSlugs.has(match.slug)) {
      setGuessedSlugs((prev) => new Set(prev).add(match.slug));
      setSearchText("");
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const charByAfflatus = useMemo(() => {
    const grouped: Record<string, CharacterFull[]> = {
      star: [],
      mineral: [],
      beast: [],
      plant: [],
      spirit: [],
      intellect: [],
    };
    characters.forEach((char) => {
      const afflatuses = char.afflatus.includes("/")
        ? char.afflatus.split("/")
        : [char.afflatus];
      afflatuses.forEach((aff) => {
        const key = aff.toLowerCase();
        if (grouped[key]) {
          grouped[key].push(char);
        }
      });
    });
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        if (b.rarity !== a.rarity) {
          return b.rarity - a.rarity;
        }
        return String(a.version).localeCompare(String(b.version), undefined, {
          numeric: true,
        });
      });
    });
    return grouped;
  }, [characters]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <>
      <Navbar />
      <div className="all-characters-container">
        <div className="search-all-container">
          <p className="search-label">
            {hasStartedGame ? t("all-characters.label1") : ""}
          </p>
          <p className="search-label">{t("all-characters.label2")}</p>
          <p className="search-label">{t("all-characters.label3")}</p>
          {hasStartedGame ? (
            <div className="search-all-wrapper">
              <IoSearchOutline />
              <input
                className="input-character"
                type="text"
                placeholder={
                  isFinished
                    ? t("input.placeholderTrue")
                    : t("input.placeholderFalse")
                }
                value={searchText}
                onChange={handleInputChange}
                disabled={isFinished}
                autoComplete="off"
                autoFocus
              />
              {isFinished ? (
                <button
                  className="search-restart-button"
                  onClick={() => resetGame()}
                  title={t("input.restartGame")}
                >
                  <MdOutlineRestartAlt size={"1.3rem"} />
                </button>
              ) : (
                <button
                  className="search-restart-button"
                  onClick={() => setIsFinished(true)}
                  title={t("input.giveUp")}
                >
                  <IoFlagOutline size={"1.3rem"} />
                </button>
              )}
            </div>
          ) : (
            <button
              className="all-start-button"
              onClick={() => setHasStartedGame(true)}
            >
              {t("all-characters.startButton")}
            </button>
          )}
          <p className="stat-value">
            {guessedSlugs.size}/{characters.length}
          </p>
          <p className={`stat-value ${timeLeft <= 30 ? "time-low" : ""}`}>
            {formatTime}
          </p>
        </div>
        <div className="all-characters-grid">
          {AFFLATUS_KEYS.map((afflatus) => (
            <div key={afflatus} className="afflatus-column">
              <div className="afflatus-header">
                <span className="afflatus-title">{afflatus}</span>
                <span className="afflatus-count">
                  (
                  {charByAfflatus[afflatus]?.filter((char) =>
                    guessedSlugs.has(char.slug),
                  ).length ?? 0}
                  /{charByAfflatus[afflatus]?.length ?? 0})
                </span>
              </div>

              <div className="afflatus-list">
                {charByAfflatus[afflatus]?.map((char, index) => {
                  const isGuessed = guessedSlugs.has(char.slug);
                  const isMissed = isFinished && !isGuessed;

                  return (
                    <div
                      key={`${afflatus}-${char.slug}-${index}`}
                      className={`character-slot ${isGuessed ? "correct fade-in" : ""} ${isMissed ? "incorrect fade-in" : ""}`}
                    >
                      {isGuessed && (
                        <>
                          <img
                            src={`/icons/${char.slug}.webp`}
                            alt={char.name}
                            className="character-slot-image"
                          />
                          <span className="character-slot-name">
                            {char.name}
                          </span>
                        </>
                      )}

                      {isMissed && (
                        <>
                          <img
                            src={`/icons/${char.slug}.webp`}
                            alt={char.name}
                            className="character-slot-image"
                          />
                          <span className="character-slot-name">
                            {char.name}
                          </span>
                        </>
                      )}

                      {!isGuessed && !isMissed && (
                        <span className="character-slot-hidden">
                          {"✦".repeat(char.rarity)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
