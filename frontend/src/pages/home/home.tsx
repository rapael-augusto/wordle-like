import Navbar from "../../components/layout/nav/nav";
import { useEffect, useState } from "react";
import { CharacterService } from "../../services/characterService";
import type { CharacterGuess } from "../../types/characterGuess";
import confetti from "canvas-confetti";
import WinnerModal from "../../components/modals/winner/winner";
import GuessLegend from "../../components/guess-legend/guess-legend";
import CharacterSearch from "../../components/char-search/char-search";
import type { Character } from "../../types/character";
import GuessHistory from "../../components/guess-history/guess-history";
import type { GuessResult } from "../../types/guessResult";
import LoadingScreen from "../exceptions/loading/loading";
import ErrorScreen from "../exceptions/error/error";
import ProgressBar from "../../components/progress-bar/progress-bar";
import "./home.css";
import { useTranslation } from "react-i18next";
import { getBrazilDate, getBrazilDateString } from "../../utils/date";
import { getStoredStatistics } from "../../utils/stats";

const characterService = new CharacterService();

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [dailyCharacter, setDailyCharacter] = useState<Character | null>(null);
  const [yesterdayCharacter, setYesterdayCharacter] =
    useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const { t } = useTranslation();
  const MAX_TRIES = 5;
  const todayString = getBrazilDateString();

  const [characterGuesses, setCharacterGuesses] = useState<CharacterGuess[]>(
    () => {
      const saved = localStorage.getItem("daily-game");
      if (!saved) return [];
      const data = JSON.parse(saved);
      return data.date === todayString ? data.guesses : [];
    },
  );
  const [isFinished, setIsFinished] = useState(() => {
    const saved = localStorage.getItem("daily-game");
    if (!saved) return false;
    const data = JSON.parse(saved);
    return data.date === todayString ? data.finished : false;
  });

  function isCorrectGuess(result: GuessResult) {
    return (
      result.name.correct &&
      result.afflatus.correct &&
      result.dmg_type.correct &&
      result.race.correct &&
      result.rarity.comparison &&
      result.version.comparison
    );
  }

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

  const handleGuessAppend = async (guess: string) => {
    if (isFinished || characterGuesses.length >= MAX_TRIES) return;
    try {
      const guessResult = await characterService.dailyGuess(guess);
      const newGuess: CharacterGuess = {
        slug: guess,
        guessResult,
      };
      const newGuesses = [newGuess, ...characterGuesses];
      setCharacterGuesses(newGuesses);

      if (isCorrectGuess(guessResult)) {
        await finishGame(true, newGuesses.length);
      } else if (newGuesses.length >= MAX_TRIES) {
        await finishGame(false, newGuesses.length);
      }
    } catch (e) {
      setError("Failed to send guess...");
      console.log(e);
    }
  };

  const fetchDailyResult = async () => {
    try {
      const data = await characterService.getDailyResult();
      setDailyCharacter(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load daily result...");
    }
  };

  const finishGame = async (won: boolean, guessesCount: number) => {
    setIsFinished(won);
    await fetchDailyResult();
    if (won) {
      handleCelebrate();
    }

    setTimeout(() => setIsWinModalOpen(true), 2000);
    const alreadyUpdated =
      localStorage.getItem("statistics-date") === todayString;
    if (alreadyUpdated) return;

    const stats = getStoredStatistics();

    stats.daily.played += 1;

    const streak = JSON.parse(
      localStorage.getItem("streak") ??
        JSON.stringify({
          date: todayString,
          value: 0,
        }),
    );

    if (won) {
      stats.daily.wins += 1;
      stats.daily.totalGuesses += guessesCount;
      const yesterday = getBrazilDate();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayString = `${yesterday.getFullYear()}-${String(
        yesterday.getMonth() + 1,
      ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

      if (streak.date === yesterdayString) {
        streak.value += 1;
      } else {
        streak.value = 1;
      }
      streak.date = todayString;
    } else {
      streak.value = 0;
      streak.date = todayString;
    }

    localStorage.setItem("streak", JSON.stringify(streak));
    localStorage.setItem("statistics", JSON.stringify(stats));
    localStorage.setItem("statistics-date", todayString);
  };

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await characterService.getAllCharactersNames();
        const yesterdayData = await characterService.getYesterdayResult();
        setCharacters(data);
        setYesterdayCharacter(yesterdayData);
      } catch (e) {
        setError("Failed to load...");
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "daily-game",
      JSON.stringify({
        date: todayString,
        guesses: characterGuesses,
        finished: isFinished,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterGuesses, isFinished]);

  useEffect(() => {
    if (!isFinished) return;
    const load = async () => {
      await fetchDailyResult();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const now = getBrazilDate();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    const timer = setTimeout(() => {
      window.location.reload();
    }, timeUntilMidnight);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  const changelog = t("changelog", { returnObjects: true }) as Record<
    string,
    {
      date: string;
      changes: string[];
    }
  >;
  const CHANGELOG_DATE = Object.values(changelog)[0].date;

  return (
    <>
      {isWinModalOpen && dailyCharacter && (
        <WinnerModal
          character={dailyCharacter}
          characterGuesses={characterGuesses}
          onClose={() => setIsWinModalOpen(false)}
          showDailyTime
          winStatus={isFinished}
        />
      )}
      <Navbar />
      {isFinished ? (
        <div className="result-button-wrapper">
          <button
            className="result-button"
            onClick={() => setIsWinModalOpen(true)}
          >
            {t("input.result")}
          </button>
        </div>
      ) : (
        <CharacterSearch
          characters={characters}
          guessedCharacters={characterGuesses}
          disabled={isFinished || characterGuesses.length >= MAX_TRIES}
          onGuess={handleGuessAppend}
        />
      )}
      {CHANGELOG_DATE !== todayString ? (
        <p className="yesterday-char">
          {t("nav.yesterday")}{" "}
          {yesterdayCharacter ? yesterdayCharacter.name : ""}
        </p>
      ) : null}
      <ProgressBar
        currentTries={characterGuesses.length}
        maxTries={MAX_TRIES}
        streakOn={true}
      />
      <GuessHistory guessedCharacters={characterGuesses} />
      <GuessLegend />
    </>
  );
}
