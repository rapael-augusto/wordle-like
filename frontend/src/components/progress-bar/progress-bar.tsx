import { useTranslation } from "react-i18next";
import "./progress-bar.css";
import { FaFire } from "react-icons/fa";
import { getBrazilDate, getBrazilDateString } from "../../utils/date";

interface ProgressBarProps {
  currentTries: number;
  maxTries: number;
  streakOn?: boolean;
}

export default function ProgressBar({
  currentTries,
  maxTries,
  streakOn = false,
}: ProgressBarProps) {
  const { t } = useTranslation();
  const todayString = getBrazilDateString();

  const streak = JSON.parse(
    localStorage.getItem("streak") ??
      JSON.stringify({
        date: todayString,
        value: 0,
      }),
  );

  const yesterday = getBrazilDate();
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayString = `${yesterday.getFullYear()}-${String(
    yesterday.getMonth() + 1,
  ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (streak.date !== todayString && streak.date !== yesterdayString) {
    streak.value = 0;
    streak.date = todayString;
    localStorage.setItem("streak", JSON.stringify(streak));
  }

  return (
    <div className="progress-container">
      <div className="progress-title-wrapper">
        <p>
          {t("progress.title")}: {currentTries} / {maxTries}{" "}
        </p>
        {streakOn && streak.value > 1 && (
          <p>
            Streak: {streak.value} <FaFire />
          </p>
        )}
      </div>
      <div
        className="progress-items-wrapper"
        style={{
          gridTemplateColumns: `repeat(${maxTries}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: maxTries }).map((_, index) => (
          <span
            key={index}
            className={`progress-item ${index < currentTries ? "full" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
