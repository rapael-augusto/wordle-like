const DEFAULT_STATS = {
  daily: {
    played: 0,
    wins: 0,
    totalGuesses: 0,
  },
  unlimited: {
    played: 0,
    wins: 0,
    totalGuesses: 0,
  },
  allCharacters: {
    minutes: 0,
    seconds: 0,
    score: 0,
  },
};

export function getStoredStatistics() {
  try {
    const raw = localStorage.getItem("statistics");
    const saved = raw ? JSON.parse(raw) : {};
    const mergedStats = {
      ...DEFAULT_STATS,
      ...saved,
      daily: { ...DEFAULT_STATS.daily, ...saved.daily },
      unlimited: { ...DEFAULT_STATS.unlimited, ...saved.unlimited },
      allCharacters: { ...DEFAULT_STATS.allCharacters, ...saved.allCharacters },
    };
    
    if (!saved.allCharacters) {
      localStorage.setItem("statistics", JSON.stringify(mergedStats));
    }
    return mergedStats;
  } catch (e) {
    console.error("Erro ao carregar estatísticas, resetando para o padrão:", e);
    return DEFAULT_STATS;
  }
}