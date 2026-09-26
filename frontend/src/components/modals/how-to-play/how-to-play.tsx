import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { IoMdArrowBack, IoMdArrowForward, IoMdClose } from "react-icons/io";
import "./how-to-play.css";
import GuessBox from "../../guess-box/guess-box";
import { useState } from "react";

interface HowToPlayModalProps {
  onClose: () => void;
}

type ModalPage = "tutorial" | "changelog";

export default function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const { t } = useTranslation();
  const changelog = t("changelog", { returnObjects: true }) as Record<
    string,
    {
      date: string;
      changes: string[];
    }
  >;
  const CHANGELOG_VERSION = Object.keys(changelog)[0];
  const [modalPage, setModalPage] = useState<ModalPage>(() => {
    const hasSeenTutorial = localStorage.getItem("statistics");
    const lastSeenChangelog = localStorage.getItem("changelog-version");
    if (!hasSeenTutorial) return "tutorial";
    if (lastSeenChangelog !== CHANGELOG_VERSION) return "changelog";
    return "tutorial";
  });

  const changePage = () => {
    setModalPage(modalPage == "tutorial" ? "changelog" : "tutorial");
  };

  return createPortal(
    <div className="how-to-play-overlay" onClick={onClose}>
      <div
        className="how-to-play-dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="how-to-play-header">
          <h2>
            {modalPage == "tutorial"
              ? t("header.howToPlay")
              : t("header.changelog")}
          </h2>
          <div className="how-to-play-button-wrapper">
            <button className="arrow-modal" onClick={changePage}>
              {modalPage == "tutorial" ? (
                <IoMdArrowForward />
              ) : (
                <IoMdArrowBack />
              )}
            </button>
            <button className="close-modal" onClick={onClose}>
              <IoMdClose />
            </button>
          </div>
        </div>
        {modalPage == "tutorial" ? (
          <>
            <section>
              <h3>{t("htpModal.basics")}</h3>
              <p style={{ marginBottom: "1rem" }}>{t("htpModal.line1")}</p>
              <GuessBox
                slug="liang-yue"
                guessResult={{
                  name: {
                    value: "Liang Yue",
                    correct: false,
                  },
                  version: {
                    value: 2.5,
                    comparison: "Lower",
                  },
                  rarity: {
                    value: 6,
                    comparison: "Lower",
                  },
                  afflatus: {
                    value: "Star",
                    correct: true,
                  },
                  dmg_type: {
                    value: "Reality",
                    correct: false,
                  },
                  race: {
                    value: "Mixed",
                    correct: false,
                  },
                }}
                lastAnimation={false}
              />
              {Array.from({ length: 6 }, (_, index) => {
                const value = index + 2;
                return <p>{t(`htpModal.line${value}`)}</p>;
              })}
            </section>
            <section>
              <h3>{t("htpModal.notes")}</h3>
              <ul>
                {Array.from({ length: 4 }, (_, index) => {
                  return <li>{t(`htpModal.list${index + 1}`)}</li>;
                })}
                <li>Up to 3.9;</li>
              </ul>
            </section>
          </>
        ) : (
          <section>
            {Object.entries(changelog).map(([version, info]) => (
              <article key={version} className="changelog-version">
                <h3>
                  {version} - {info.date}
                </h3>
                <ul>
                  {info.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>,
    document.body,
  );
}
