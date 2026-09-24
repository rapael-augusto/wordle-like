import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "./statistcs.css";
import { IoMdClose } from "react-icons/io";
import { getStoredStatistics } from "../../../utils/stats";

interface StatisticsModalProps {
  onClose: () => void;
}

interface StatisticsMetrics {
  played: number;
  wins: number;
  totalGuesses: number;
}

interface AllCharactersMetrics {
  score: number;
  seconds: number;
  minutes: number;
}

interface StatisticsObjects {
  daily: StatisticsMetrics;
  unlimited: StatisticsMetrics;
  allCharacters: AllCharactersMetrics;
}

export default function StatisticsModal({ onClose }: StatisticsModalProps) {
  const [statistics, setStatistics] = useState<StatisticsObjects | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const saved = getStoredStatistics();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatistics(saved);
    }
  }, []);

  const getMetrics = (stats: StatisticsMetrics) => {
    const winRate =
      stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    const averageGuesses =
      stats.wins > 0 ? Number((stats.totalGuesses / stats.wins).toFixed(2)) : 0;
    return { winRate, averageGuesses };
  };

  const dailyMetrics = statistics ? getMetrics(statistics.daily) : null;
  const unlimitedMetrics = statistics ? getMetrics(statistics.unlimited) : null;

  return createPortal(
    <div className="statistics-overlay" onClick={onClose}>
      <div className="statistics-dropdown" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <IoMdClose />
        </button>
        {statistics ? (
          <div className="statistics-container">
            <p>{t("statisticsModal.daily")}</p>
            <div className="statistics-display-grip">
              {Array.from({ length: 4 }, (_, index) => {
                return (
                  <p key={index}>{t(`statisticsModal.title${index + 1}`)}</p>
                );
              })}

              <p>{statistics.daily.wins}</p>
              <p>{dailyMetrics!.winRate}%</p>
              <p>{statistics.daily.played}</p>
              <p>{dailyMetrics!.averageGuesses}</p>
            </div>
            <hr className="statistcs-break-line" />

            <p>{t("statisticsModal.unlimited")}</p>
            <div className="statistics-display-grip">
              {Array.from({ length: 4 }, (_, index) => {
                return (
                  <p key={index}>{t(`statisticsModal.title${index + 1}`)}</p>
                );
              })}

              <p>{statistics.unlimited.wins}</p>
              <p>{unlimitedMetrics!.winRate}%</p>
              <p>{statistics.unlimited.played}</p>
              <p>{unlimitedMetrics!.averageGuesses}</p>
            </div>
            <hr className="statistcs-break-line" />
            
            <p>{t("statisticsModal.allCharacters")}</p>
            <div className="statistics-all-characters-display-grip">
              <p>{t("statisticsModal.score")}</p>
              <p>{t("all-characters.label3")}</p>

              <p>{statistics.allCharacters.score}</p>
              <p>{statistics.allCharacters.minutes}:{statistics.allCharacters.seconds}</p>
            </div>
          </div>
        ) : (
          <div>
            <p>{t("statisticsModal.zero")}</p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
