import { addDays } from "./utils.js";

export function getCardProgress(progressStore, cardId) {
  const existing = progressStore.cards[cardId];
  if (existing) return existing;
  return {
    repetitions: 0,
    intervalDays: 0,
    ease: 2.5,
    dueAt: new Date().toISOString(),
    lastReviewedAt: null,
    lapseCount: 0,
    seenCount: 0,
    correctCount: 0,
    hardCount: 0,
  };
}

export function isDue(progressStore, cardId, now = Date.now()) {
  const dueAt = new Date(getCardProgress(progressStore, cardId).dueAt).getTime();
  return Number.isFinite(dueAt) ? dueAt <= now : true;
}

export function isNew(progressStore, cardId) {
  return !progressStore.cards[cardId];
}

export function scheduleNext(cardProgress, rating) {
  const next = { ...cardProgress };
  const now = new Date().toISOString();

  next.lastReviewedAt = now;
  next.seenCount += 1;

  if (rating === "again") {
    next.repetitions = 0;
    next.intervalDays = 1;
    next.ease = Math.max(1.3, next.ease - 0.2);
    next.lapseCount += 1;
    next.hardCount = Number(next.hardCount || 0) + 1;
  }

  if (rating === "hard") {
    next.repetitions += 1;
    next.intervalDays = next.intervalDays <= 1 ? 2 : Math.ceil(next.intervalDays * 1.2);
    next.ease = Math.max(1.3, next.ease - 0.15);
    next.correctCount += 1;
    next.hardCount = Number(next.hardCount || 0) + 1;
  }

  if (rating === "good") {
    next.repetitions += 1;
    if (next.repetitions === 1) next.intervalDays = 1;
    else if (next.repetitions === 2) next.intervalDays = 3;
    else next.intervalDays = Math.ceil(next.intervalDays * next.ease);
    next.correctCount += 1;
  }

  if (rating === "easy") {
    next.repetitions += 1;
    next.ease += 0.15;
    if (next.repetitions === 1) next.intervalDays = 3;
    else next.intervalDays = Math.ceil(next.intervalDays * next.ease * 1.25);
    next.correctCount += 1;
  }

  next.dueAt = addDays(now, next.intervalDays);
  return next;
}

export function previewIntervals(cardProgress) {
  return {
    again: scheduleNext(cardProgress, "again").intervalDays,
    hard: scheduleNext(cardProgress, "hard").intervalDays,
    good: scheduleNext(cardProgress, "good").intervalDays,
    easy: scheduleNext(cardProgress, "easy").intervalDays,
  };
}

export function getFilteredCards(db, setup) {
  return db.flashcards.filter((card) => {
    const categoryMatch = setup.category === "all" || card.category === setup.category;
    const difficultyMatch = setup.difficulty === "all" || card.difficulty === setup.difficulty;
    return categoryMatch && difficultyMatch;
  });
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildQueue(db, progressStore, setup, mode = setup.mode) {
  const cards = getFilteredCards(db, setup);
  const due = cards.filter((c) => isDue(progressStore, c.id));
  const fresh = cards.filter((c) => isNew(progressStore, c.id));

  if (mode === "due") {
    return due
      .sort(
        (a, b) =>
          new Date(getCardProgress(progressStore, a.id).dueAt).getTime() -
          new Date(getCardProgress(progressStore, b.id).dueAt).getTime()
      )
      .map((c) => c.id);
  }

  if (mode === "new") return shuffle(fresh).map((c) => c.id);
  if (mode === "quick") return shuffle(cards).slice(0, 12).map((c) => c.id);
  if (mode === "all") return shuffle(cards).map((c) => c.id);

  const dailyDue = due
    .sort(
      (a, b) =>
        new Date(getCardProgress(progressStore, a.id).dueAt).getTime() -
        new Date(getCardProgress(progressStore, b.id).dueAt).getTime()
    )
    .slice(0, 24);

  const fillWithNew = shuffle(fresh).slice(0, Math.max(0, 24 - dailyDue.length));
  return [...dailyDue, ...fillWithNew].map((c) => c.id);
}
