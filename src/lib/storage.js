const STORAGE_KEY = "sden3trainer.v3.progress";
const SETTINGS_KEY = "sden3trainer.v3.settings";

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_err) {
    return fallback;
  }
}

function saveJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const defaultSetup = {
  category: "all",
  difficulty: "all",
  mode: "daily",
};

export const defaultProgress = {
  cards: {},
  meta: {
    totalReviews: 0,
    streak: 0,
    maxStreak: 0,
    lastStudyDate: null,
    dailyReviews: {},
  },
};

export function loadPersistedState() {
  const progress = loadJson(STORAGE_KEY, defaultProgress);
  const setup = loadJson(SETTINGS_KEY, defaultSetup);

  const safeProgress =
    progress && typeof progress === "object" && progress.cards && progress.meta
      ? {
          cards: progress.cards,
          meta: {
            ...defaultProgress.meta,
            ...progress.meta,
            dailyReviews: progress.meta.dailyReviews || {},
          },
        }
      : structuredClone(defaultProgress);

  const safeSetup =
    setup && setup.mode && setup.category && setup.difficulty
      ? { ...defaultSetup, ...setup }
      : { ...defaultSetup };

  return { progress: safeProgress, setup: safeSetup };
}

export function savePersistedState(progress, setup) {
  saveJson(STORAGE_KEY, progress);
  saveJson(SETTINGS_KEY, setup);
}
