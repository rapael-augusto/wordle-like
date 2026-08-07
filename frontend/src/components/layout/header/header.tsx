import { useEffect, useRef, useState } from "react";
import type { Theme } from "../../../types/theme";
import { useTranslation } from "react-i18next";
import { FaQuestion } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";
import { IoMoon } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import "./header.css";
import HowToPlayModal from "../../modals/how-to-play/how-to-play";
import StatisticsModal from "../../modals/statistics/statistics";

interface HeaderProps {
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  setIsAnimationOn: React.Dispatch<React.SetStateAction<boolean>>;
  isAnimationOn: boolean;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  language: string;
}

export default function Header({
  setTheme,
  setIsAnimationOn,
  isAnimationOn = true,
  setLanguage,
  language,
}: HeaderProps) {
  const { t } = useTranslation();
  const changelog = t("changelog", { returnObjects: true }) as Record<
    string,
    unknown
  >;
  const CHANGELOG_VERSION = Object.keys(changelog)[0];

  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [isHtpModalOpen, setIsHtpModalOpen] = useState(() => {
    const saved = localStorage.getItem("statistics");
    const lastSeenChangelog = localStorage.getItem("changelog-version");
    if (!saved) return true;
    if (lastSeenChangelog !== CHANGELOG_VERSION) return true;
    else return false;
  });
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  const changeTheme = (theme: Theme) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  const openThemeDropdown = () => {
    setIsSettingsDropdownOpen(false);
    setIsThemeDropdownOpen((prev) => !prev);
  };

  const openSettingsDropdown = () => {
    setIsThemeDropdownOpen(false);
    setIsSettingsDropdownOpen((prev) => !prev);
  };

  const closeHtpModal = () => {
    localStorage.setItem("changelog-version", CHANGELOG_VERSION);
    setIsHtpModalOpen(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    localStorage.setItem("language", e.target.value);
  };

  const handleAnimationStatusChange = () => {
    const nextAnimationStatus = !isAnimationOn;
    setIsAnimationOn(nextAnimationStatus);
    localStorage.setItem("animation", nextAnimationStatus.toString());
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        settingsRef.current &&
        !settingsRef.current.contains(target) &&
        !settingsButtonRef.current?.contains(target)
      ) {
        setIsSettingsDropdownOpen(false);
      }
      if (
        themeRef.current &&
        !themeRef.current.contains(target) &&
        !themeButtonRef.current?.contains(target)
      ) {
        setIsThemeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header>
      {isHtpModalOpen && <HowToPlayModal onClose={closeHtpModal} />}
      {isStatisticsModalOpen && (
        <StatisticsModal onClose={() => setIsStatisticsModalOpen(false)} />
      )}
      <div className="header-title-wrapper">
        <p className="header-title">
          Reverse: 1999 <span>Wordle</span>
        </p>
      </div>
      <div className="header-button-wrapper">
        <div className="how-to-play-dropdown-wrapper">
          <button
            title={t("header.howToPlay")}
            onClick={() => setIsHtpModalOpen(!isHtpModalOpen)}
          >
            <FaQuestion />
          </button>
        </div>
        <button
          title={t("header.statistics")}
          onClick={() => setIsStatisticsModalOpen(!isStatisticsModalOpen)}
        >
          <MdBarChart />
        </button>
        <button
          title={t("header.themes")}
          onClick={openThemeDropdown}
          ref={themeButtonRef}
        >
          <IoMoon />
        </button>
        <div className="dropdown-wrapper">
          <button
            title={t("header.settings")}
            onClick={openSettingsDropdown}
            ref={settingsButtonRef}
          >
            <IoMdSettings />
          </button>
          {isSettingsDropdownOpen && (
            <div className="header-dropdown" ref={settingsRef}>
              <div className="switch-wrapper">
                <p>
                  {t("header.dropdowns.settings.animations")}{" "}
                  {isAnimationOn
                    ? t("header.dropdowns.settings.on")
                    : t("header.dropdowns.settings.off")}
                </p>
                <label className="switch">
                  <input
                    className="checkbox"
                    type="checkbox"
                    checked={isAnimationOn}
                    onChange={handleAnimationStatusChange}
                    name="checkbox-input"
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="select-wrapper">
                <p>{t("header.dropdowns.settings.language")}:</p>
                <select
                  name="language"
                  onChange={handleLanguageChange}
                  value={language}
                >
                  <option value={"en"}>English</option>
                  <option value={"pt"}>Português</option>
                  <option value={"fr"}>Français</option>
                </select>
              </div>
            </div>
          )}
          {isThemeDropdownOpen && (
            <div className="header-dropdown" ref={themeRef}>
              <button onClick={() => changeTheme("default")}>
                {t("header.dropdowns.themes.default")}
              </button>
              <button onClick={() => changeTheme("blue")}>
                {t("header.dropdowns.themes.blue")}
              </button>
              <button onClick={() => changeTheme("white")}>
                {t("header.dropdowns.themes.white")}
              </button>
              <button onClick={() => changeTheme("gray")}>
                {t("header.dropdowns.themes.gray")}
              </button>
              <button onClick={() => changeTheme("red")}>
                {t("header.dropdowns.themes.red")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
