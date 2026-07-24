import { useTranslation } from "react-i18next";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
import "./winner.css";
import { createPortal } from "react-dom";
import type { Character } from "../../../types/character";
import type { CharacterGuess } from "../../../types/characterGuess";
import { FaCopy, FaTwitter } from "react-icons/fa";
import { getBrazilDate } from "../../../utils/date";

interface WinnerModalProps {
  onClose: () => void;
  character: Character;
  characterGuesses: CharacterGuess[];
  showDailyTime: boolean;
  winStatus: boolean;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const FIRST_GAME_DATE = new Date(2026, 6, 22);
FIRST_GAME_DATE.setHours(0, 0, 0, 0);

function getDayNumber(): number {
  const today = getBrazilDate();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - FIRST_GAME_DATE.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function guessToEmojis(guess: CharacterGuess): string {
  const r = guess.guessResult;
  const toEmoji = (val: boolean | string) =>
    val === true ? "🟩" : val === false ? "⬛" : "🟨";

  return [
    toEmoji(r.name.correct),
    toEmoji(r.version.comparison),
    toEmoji(r.rarity.comparison),
    toEmoji(r.afflatus.correct),
    toEmoji(r.dmg_type.correct),
    toEmoji(r.race.correct),
  ].join(" ");
}

function buildShareText(
  characterGuesses: CharacterGuess[],
  winStatus: boolean,
): string {
  const day = getDayNumber();
  const tries = winStatus ? `${characterGuesses.length}/5` : "X/5";
  const rows = [...characterGuesses].reverse().map(guessToEmojis).join("\n");

  return `📖 R1999dle #${day} ${tries}\n${rows}\n\nhttps://r1999dle.vercel.app/`;
}

export default function WinnerModal({
  onClose,
  character,
  characterGuesses,
  showDailyTime = true,
  winStatus = true,
}: WinnerModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const calculateTimeLeft = (): TimeLeft => {
    const now = getBrazilDate();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const difference = +tomorrow - +now;

    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shareText = buildShareText(characterGuesses, winStatus);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  };

  return createPortal(
    <div className="winner-overlay" onClick={onClose}>
      <div
        className="winner-dropdown fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="winner-header">
          <div className="winner-title">
            <h2>
              {winStatus ? t("winnerModal.title") : t("winnerModal.loseTitle")}
            </h2>
            <h2>{t("winnerModal.subtitle")}</h2>
          </div>
          <button className="close-modal" onClick={onClose}>
            <IoMdClose />
          </button>
        </div>
        <div className="winner-body">
          <img
            src={`/splashs/${character.slug}.webp`}
            alt={character.slug}
            className="winner-image"
          />
          <p>{character.name}</p>
        </div>
        <div className="winner-footer">
          {showDailyTime && (
            <>
              <div className="winner-footer-timer">
                <p>{t("winnerModal.footer")}</p>
                <p>
                  {String(timeLeft.hours).padStart(2, "0")}h{" "}
                  {String(timeLeft.minutes).padStart(2, "0")}m{" "}
                  {String(timeLeft.seconds).padStart(2, "0")}s
                </p>
              </div>
              {winStatus && (
                <div className="winner-footer-share">
                  <p>{t("winnerModal.share")}</p>
                  <div className="share-buttons">
                    <button
                      className="share-button"
                      onClick={handleTwitter}
                      title="Share on Twitter"
                    >
                      <FaTwitter />
                    </button>
                    <button
                      className="share-button"
                      onClick={handleCopy}
                      title={copied ? "Copied!" : "Copy result"}
                    >
                      {copied ? <IoMdCheckmark /> : <FaCopy />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
