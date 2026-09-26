import "./unlimited.css";
import Navbar from "../../components/layout/nav/nav";
import { CharacterService } from "../../services/characterService";
import LoadingScreen from "../exceptions/loading/loading";
import ErrorScreen from "../exceptions/error/error";
import { useEffect, useState } from "react";
import type { CharacterGuess } from "../../types/characterGuess";
import confetti from "canvas-confetti";
import type { GuessResult } from "../../types/guessResult";
import type { Character } from "../../types/character";
import WinnerModal from "../../components/modals/winner/winner";
import CharacterSearch from "../../components/char-search/char-search";
import GuessHistory from "../../components/guess-history/guess-history";
import GuessLegend from "../../components/guess-legend/guess-legend";
import { useTranslation } from "react-i18next";
import { getStoredStatistics } from "../../utils/stats";

const characterService = new CharacterService();

export default function Unlimited() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [unlimitedCharId, setUnlimitedCharId] = useState(103);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [characterGuesses, setCharacterGuesses] = useState<CharacterGuess[]>(
    [],
  );
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const { t } = useTranslation();

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

  const showWinnerModal = () => {
    setTimeout(() => {
      setIsWinModalOpen(true);
    }, 2000);
  };

  const handleCloseWinnerModal = () => {
    setIsWinModalOpen(false);
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

  const finishGame = async (won: boolean, guessesCount: number) => {
    setIsFinished(true);
    if (won) {
      handleCelebrate();
    }
    showWinnerModal();

    const stats = getStoredStatistics();

    if (won) {
      stats.unlimited.wins += 1;
      stats.unlimited.totalGuesses += guessesCount;
    }

    localStorage.setItem("statistics", JSON.stringify(stats));
  };

  const handleGuessAppend = async (guess: string) => {
    if (isFinished || !unlimitedCharId) return;

    if (!hasStartedGame) {
      const stats = getStoredStatistics();
      stats.unlimited.played += 1;
      localStorage.setItem("statistics", JSON.stringify(stats));
      setHasStartedGame(true);
    }

    try {
      const guessResult = await characterService.idGuess(
        unlimitedCharId,
        guess,
      );
      const newGuess: CharacterGuess = {
        slug: guess,
        guessResult,
      };
      const newGuesses = [newGuess, ...characterGuesses];
      setCharacterGuesses(newGuesses);

      if (isCorrectGuess(guessResult)) {
        await finishGame(true, newGuesses.length);
      }
    } catch (e) {
      setError("Failed to send guess...");
      console.error(e);
    }
  };

  const newGame = async () => {
    try {
      setIsLoading(true);
      setIsFinished(false);
      setIsWinModalOpen(false);
      setHasStartedGame(false);
      setCharacterGuesses([]);
      const charId = await characterService.getRandomId();
      setUnlimitedCharId(charId.id);
    } catch (e) {
      console.error(e);
      setError("Failed to start new game...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await characterService.getAllCharactersNames();
        setCharacters(data);
        await newGame();
      } catch (e) {
        setError("Failed to load...");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  useEffect(() => {
    const handleFilterChange = () => {
      newGame();
    };

    window.addEventListener("storage_filter_changed", handleFilterChange);
    return () => {
      window.removeEventListener("storage_filter_changed", handleFilterChange);
    };
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <>
      {isWinModalOpen && characterGuesses?.[0] && (
        <WinnerModal
          character={{
            slug: characterGuesses[0].slug,
            name: characterGuesses[0].guessResult.name.value,
          }}
          characterGuesses={characterGuesses}
          onClose={handleCloseWinnerModal}
          showDailyTime={false}
          winStatus
        />
      )}
      <Navbar />
      {!isFinished ? (
        <CharacterSearch
          characters={characters}
          guessedCharacters={characterGuesses}
          disabled={isFinished}
          restart={true}
          restartFunc={newGame}
          onGuess={handleGuessAppend}
        />
      ) : (
        <div className="restart-wrapper">
          <button onClick={newGame} className="restart-button">
            {t("input.restartGame")}
          </button>
        </div>
      )}
      <GuessHistory guessedCharacters={characterGuesses} />
      <GuessLegend />
    </>
  );
}
