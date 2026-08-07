import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import type { GuessResult, NumericComparison } from "../../types/guessResult";
import "./guess-box.css";

interface GuessBoxProps {
  slug: string;
  guessResult: GuessResult;
  lastAnimation: boolean;
}

export default function GuessBox({
  slug,
  guessResult,
  lastAnimation,
}: GuessBoxProps) {
  const allCorrect =
    guessResult.name.correct &&
    guessResult.afflatus.correct &&
    guessResult.dmg_type.correct &&
    guessResult.race.correct &&
    guessResult.rarity.comparison === true &&
    guessResult.version.comparison === true;
  const renderArrow = (value: NumericComparison) => {
    if (value === "Higher") return <FaArrowUp />;
    if (value === "Lower") return <FaArrowDown />;
    return null;
  };
  const getComparisonClass = (value: NumericComparison) => {
    return value === true ? "correct" : "partial";
  };
  const typeAnimation =
    lastAnimation && allCorrect
      ? "bounce-animate"
      : lastAnimation
        ? "flip-animate"
        : "";

  return (
    <div className={`guess-container ${lastAnimation ? "fade-in" : ""}`}>
      <div
        className={`guess-character ${allCorrect ? "correct" : "incorrect"}`}
      >
        <img src={`/icons/${slug}.webp`} alt={slug} className="guess-image" />
        <span>{guessResult.name.value}</span>
      </div>

      <div
        className={`guess-cell ${getComparisonClass(guessResult.version.comparison)} ${typeAnimation}`}
      >
        <span>{guessResult.version.value}</span>
        {renderArrow(guessResult.version.comparison)}
      </div>

      <div
        className={`guess-cell ${getComparisonClass(guessResult.rarity.comparison)} ${typeAnimation}`}
      >
        <span>{guessResult.rarity.value}</span>
        {renderArrow(guessResult.rarity.comparison)}
      </div>

      <div
        className={`guess-cell ${guessResult.afflatus.correct ? "correct" : "incorrect"} ${typeAnimation}`}
      >
        {guessResult.afflatus.value}
      </div>

      <div
        className={`guess-cell ${guessResult.dmg_type.correct ? "correct" : "incorrect"} ${typeAnimation}`}
      >
        {guessResult.dmg_type.value}
      </div>

      <div
        className={`guess-cell ${
          guessResult.race.correct ? "correct" : "incorrect"
        } ${typeAnimation} ${guessResult.race.value.length > 10 ? "small-text" : ""}`}
      >
        {guessResult.race.value}
      </div>
    </div>
  );
}
