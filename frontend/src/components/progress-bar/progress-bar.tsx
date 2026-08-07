import { useTranslation } from "react-i18next";
import "./progress-bar.css";

interface ProgressBarProps {
  currentTries: number;
  maxTries: number;
}

export default function ProgressBar({
  currentTries,
  maxTries,
}: ProgressBarProps) {
  const { t } = useTranslation();
  return (
    <div className="progress-container">
      <div className="progress-title-wrapper">
        <p>
          {t("progress.title")}: {currentTries} / {maxTries}{" "}
        </p>
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
