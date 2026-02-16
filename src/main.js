import { defaultProgress, defaultSetup, loadPersistedState, savePersistedState } from "./lib/storage.js";
import {
  buildQueue,
  getCardProgress,
  getFilteredCards,
  isDue,
  isNew,
  previewIntervals,
  scheduleNext,
} from "./lib/scheduler.js";
import { queueAgainCard, queueHardCard } from "./lib/session-queue.js";
import { escapeHtml, formatPercent, localDateKey, safeColor } from "./lib/utils.js";

const app = document.getElementById("app");

const state = {
  db: null,
  cardsById: {},
  view: "loading",
  setup: { ...defaultSetup },
  progress: structuredClone(defaultProgress),
  queue: [],
  queueIndex: 0,
  answerRevealed: false,
  session: null,
};

function persist() {
  savePersistedState(state.progress, state.setup);
}

function loadState() {
  const persisted = loadPersistedState();
  state.progress = persisted.progress;
  state.setup = persisted.setup;
}

function updateStreakAndCalendar() {
  const today = localDateKey();
  const last = state.progress.meta.lastStudyDate;

  if (!last) {
    state.progress.meta.streak = 1;
  } else if (last !== today) {
    const prev = new Date(last);
    prev.setDate(prev.getDate() + 1);
    const expected = localDateKey(prev);
    state.progress.meta.streak = expected === today ? state.progress.meta.streak + 1 : 1;
  }

  state.progress.meta.maxStreak = Math.max(state.progress.meta.maxStreak || 0, state.progress.meta.streak || 0);
  state.progress.meta.lastStudyDate = today;
  state.progress.meta.dailyReviews[today] = Number(state.progress.meta.dailyReviews[today] || 0) + 1;
}

function setupStats() {
  const cards = state.db.flashcards;
  const totalCards = cards.length;
  const dueNow = cards.filter((c) => isDue(state.progress, c.id)).length;
  const newCards = cards.filter((c) => isNew(state.progress, c.id)).length;
  const mastered = cards.filter((c) => getCardProgress(state.progress, c.id).repetitions >= 4).length;

  const byCategory = Object.fromEntries(
    state.db.categories.map((cat) => [cat.id, { name: cat.name, icon: cat.icon, seen: 0, correct: 0 }])
  );

  for (const card of cards) {
    const p = getCardProgress(state.progress, card.id);
    if (!byCategory[card.category]) continue;
    byCategory[card.category].seen += p.seenCount;
    byCategory[card.category].correct += p.correctCount;
  }

  const weakest = Object.values(byCategory)
    .filter((x) => x.seen > 0)
    .sort((a, b) => a.correct / a.seen - b.correct / b.seen)[0];

  return {
    totalCards,
    dueNow,
    newCards,
    mastered,
    weakest,
    streak: state.progress.meta.streak || 0,
    totalReviews: state.progress.meta.totalReviews || 0,
  };
}

function currentCard() {
  if (state.queueIndex >= state.queue.length) return null;
  return state.cardsById[state.queue[state.queueIndex]] || null;
}

function startSession(mode = state.setup.mode) {
  const queue = buildQueue(state.db, state.progress, state.setup, mode);

  state.setup.mode = mode;
  state.queue = queue;
  state.queueIndex = 0;
  state.answerRevealed = false;
  state.session = {
    startedAt: new Date().toISOString(),
    mode,
    reviewed: 0,
    ratings: { again: 0, hard: 0, good: 0, easy: 0 },
    uniqueReviewed: new Set(),
    undoStack: [],
  };

  state.view = "study";
  persist();
  render();
}

function finishSession() {
  state.view = "summary";
  render();
}

function rateCard(rating) {
  if (!state.session) return;
  const card = currentCard();
  if (!card || !state.answerRevealed) return;

  const snapshot = {
    queue: [...state.queue],
    queueIndex: state.queueIndex,
    answerRevealed: state.answerRevealed,
    ratings: { ...state.session.ratings },
    reviewed: state.session.reviewed,
    uniqueReviewed: [...state.session.uniqueReviewed],
    progressCard: { ...getCardProgress(state.progress, card.id) },
    meta: { ...state.progress.meta, dailyReviews: { ...state.progress.meta.dailyReviews } },
  };
  state.session.undoStack.push(snapshot);

  const before = getCardProgress(state.progress, card.id);
  const updated = scheduleNext(before, rating);
  state.progress.cards[card.id] = updated;
  state.progress.meta.totalReviews += 1;
  updateStreakAndCalendar();

  state.session.ratings[rating] += 1;
  state.session.reviewed += 1;
  state.session.uniqueReviewed.add(card.id);

  if (rating === "again") {
    state.queue = queueAgainCard(state.queue, state.queueIndex, card.id);
  }
  if (rating === "hard") {
    state.queue = queueHardCard(state.queue, state.queueIndex, card.id);
  }

  state.queueIndex += 1;
  state.answerRevealed = false;
  persist();

  if (state.queueIndex >= state.queue.length) {
    finishSession();
    return;
  }

  render();
}

function undoLastRating() {
  if (!state.session || state.session.undoStack.length === 0) return;
  const card = state.cardsById[state.queue[state.queueIndex - 1]];
  const previous = state.session.undoStack.pop();

  state.queue = previous.queue;
  state.queueIndex = previous.queueIndex;
  state.answerRevealed = previous.answerRevealed;

  state.session.ratings = previous.ratings;
  state.session.reviewed = previous.reviewed;
  state.session.uniqueReviewed = new Set(previous.uniqueReviewed);

  if (card) {
    state.progress.cards[card.id] = previous.progressCard;
  }
  state.progress.meta = previous.meta;

  persist();
  render();
}

function revealAnswer() {
  if (state.view !== "study") return;
  if (!currentCard()) return;
  state.answerRevealed = true;
  render();
}

function shortcutsMarkup() {
  return `
    <ul class="shortcut-list">
      <li><strong>Spatie</strong>: antwoord tonen</li>
      <li><strong>1-4</strong>: beoordeling</li>
      <li><strong>Ctrl/Cmd + Z</strong>: ongedaan maken</li>
    </ul>
  `;
}

function renderAnswerMarkup(card) {
  const summary = card.answer_short || card.answer || "";
  const points = Array.isArray(card.answer_core_points) ? card.answer_core_points : [];
  const why = card.answer_why || card.explanation || "";
  const pitfall = card.answer_pitfall || "";
  const hook = card.answer_memory_hook || "";

  const pointsMarkup =
    points.length > 0
      ? `<ul class="answer-points">${points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`
      : "";

  const pitfallMarkup = pitfall
    ? `<div class="answer-callout answer-pitfall"><p class="eyebrow">Examenvalkuil</p><p>${escapeHtml(pitfall)}</p></div>`
    : "";

  const hookMarkup = hook
    ? `<div class="answer-callout answer-hook"><p class="eyebrow">Geheugensteun</p><p>${escapeHtml(hook)}</p></div>`
    : "";

  return `
    <div class="answer-block" role="region" aria-label="Antwoord">
      <p class="eyebrow" style="margin-bottom:8px;">Kort antwoord</p>
      <p class="answer-short"><strong>${escapeHtml(summary)}</strong></p>
      ${pointsMarkup ? `<p class="eyebrow" style="margin-top:12px;">Kernpunten</p>${pointsMarkup}` : ""}
      <p class="eyebrow" style="margin-top:12px;">Waarom</p>
      <p class="muted">${escapeHtml(why)}</p>
      ${pitfallMarkup}
      ${hookMarkup}
    </div>
  `;
}

function renderRatingButtons(nextPreview, disabled) {
  return `
    <div class="rating-grid">
      <button class="btn-again" data-action="rate" data-value="again" ${disabled ? "disabled" : ""}>Opnieuw · ${nextPreview.again}d</button>
      <button class="btn-hard" data-action="rate" data-value="hard" ${disabled ? "disabled" : ""}>Moeilijk · ${nextPreview.hard}d</button>
      <button class="btn-good" data-action="rate" data-value="good" ${disabled ? "disabled" : ""}>Goed · ${nextPreview.good}d</button>
      <button class="btn-easy" data-action="rate" data-value="easy" ${disabled ? "disabled" : ""}>Makkelijk · ${nextPreview.easy}d</button>
    </div>
  `;
}

function renderDashboard() {
  const stats = setupStats();
  const dailyQueue = buildQueue(state.db, state.progress, state.setup, "daily");
  const hardMarked = Object.values(state.progress.cards).filter((p) => Number(p.hardCount || 0) > 0).length;
  const today = localDateKey();
  const reviewedToday = Number(state.progress.meta.dailyReviews?.[today] || 0);
  const dailyGoal = Math.max(12, dailyQueue.length || 0);
  const progressPct = Math.min(100, Math.round((reviewedToday / Math.max(1, dailyGoal)) * 100));
  const weakestText = stats.weakest ? `${stats.weakest.icon} ${stats.weakest.name}` : "Nog geen data";
  const knownCards = stats.mastered;
  const todoCards = Math.max(0, stats.totalCards - knownCards);

  app.innerHTML = `
    <section class="resume-home fade-in">
      <article class="card surface resume-hero">
        <div class="resume-kicker row space-between">
          <p class="eyebrow">SDEN3 Wijnexamen</p>
          <span class="badge">Reeks ${stats.streak} dagen</span>
        </div>

        <h1>Verder waar je proeftraining stopte</h1>
        <p class="muted">Vandaag: ${reviewedToday}/${dailyGoal} afgerond.</p>
        <div class="progress-shell" aria-label="Dagsessie voortgang">
          <div class="progress-bar" style="width:${progressPct}%"></div>
        </div>

        <div class="home-option-buttons">
          <button class="btn-primary" data-action="start_daily" ${dailyQueue.length === 0 ? "disabled" : ""}>Dagsessie</button>
          <button class="btn-ghost" data-action="start_mode" data-value="quick" ${stats.totalCards === 0 ? "disabled" : ""}>Random 12</button>
          <button class="btn-ghost" data-action="start_hard" ${hardMarked === 0 ? "disabled" : ""}>Moeilijke oefenen</button>
          <button class="btn-ghost" data-action="open_setup">Custom sessie</button>
        </div>
      </article>

      <section class="metric-grid">
        <article class="card metric-card">
          <p class="eyebrow">Al bekend</p>
          <p class="kpi">${knownCards}</p>
          <p class="muted">kaarten</p>
        </article>
        <article class="card metric-card">
          <p class="eyebrow">Nog te doen</p>
          <p class="kpi">${todoCards}</p>
          <p class="muted">kaarten</p>
        </article>
        <article class="card metric-card">
          <p class="eyebrow">Gemarkeerd moeilijk</p>
          <p class="kpi">${hardMarked}</p>
          <p class="muted">kaarten</p>
        </article>
      </section>

      <details class="card exam-brief">
        <summary>Examenbriefing</summary>
        <div class="exam-brief-content">
          <p><strong>Zwakste domein:</strong> ${escapeHtml(weakestText)}</p>
          <p><strong>Totaal herhalingen:</strong> ${stats.totalReviews}</p>
          <p><strong>Tip:</strong> start met geplande kaarten, sluit af met 5 minuten sprint.</p>
        </div>
      </details>
    </section>
  `;
}

function renderSetup() {
  const difficulties = ["all", ...new Set(state.db.flashcards.map((c) => c.difficulty))];
  const counts = Object.fromEntries(state.db.categories.map((cat) => [cat.id, 0]));
  state.db.flashcards.forEach((c) => {
    counts[c.category] = Number(counts[c.category] || 0) + 1;
  });

  const filtered = getFilteredCards(state.db, state.setup).length;

  const categoryChips = [
    `<button class="chip ${state.setup.category === "all" ? "active" : ""}" data-action="set_category" data-value="all">Alle categorieen</button>`,
    ...state.db.categories.map(
      (cat) =>
        `<button class="chip ${state.setup.category === cat.id ? "active" : ""}" data-action="set_category" data-value="${cat.id}">${cat.icon} ${escapeHtml(cat.name)} (${counts[cat.id]})</button>`
    ),
  ].join("");

  const difficultyChips = difficulties
    .map(
      (diff) =>
        `<button class="chip ${state.setup.difficulty === diff ? "active" : ""}" data-action="set_difficulty" data-value="${diff}">${
          diff === "all" ? "Alle niveaus" : escapeHtml(diff)
        }</button>`
    )
    .join("");

  app.innerHTML = `
    <section class="row space-between fade-in" style="margin-bottom:16px;">
      <h2>Aangepaste sessie</h2>
      <button class="btn-ghost" data-action="go_dashboard">Terug naar dashboard</button>
    </section>

    <section class="card fade-in" style="margin-bottom:14px;">
      <p class="eyebrow">Modus</p>
      <div class="chips" style="margin-top:10px;">
        <button class="chip ${state.setup.mode === "daily" ? "active" : ""}" data-action="set_mode" data-value="daily">Dagelijks</button>
        <button class="chip ${state.setup.mode === "due" ? "active" : ""}" data-action="set_mode" data-value="due">Gepland</button>
        <button class="chip ${state.setup.mode === "new" ? "active" : ""}" data-action="set_mode" data-value="new">Nieuw</button>
        <button class="chip ${state.setup.mode === "quick" ? "active" : ""}" data-action="set_mode" data-value="quick">Korte 12</button>
        <button class="chip ${state.setup.mode === "all" ? "active" : ""}" data-action="set_mode" data-value="all">Alles gemixt</button>
      </div>
    </section>

    <section class="card fade-in" style="margin-bottom:14px;">
      <p class="eyebrow">Categorie</p>
      <div class="chips" style="margin-top:10px;">${categoryChips}</div>
    </section>

    <section class="card fade-in" style="margin-bottom:14px;">
      <p class="eyebrow">Niveau</p>
      <div class="chips" style="margin-top:10px;">${difficultyChips}</div>
    </section>

    <section class="card fade-in row space-between">
      <div>
        <h3>${filtered} kaarten passen bij je instellingen</h3>
        <p class="muted" style="margin-top:8px;">Start een gerichte sessie met je gekozen modus en filters.</p>
      </div>
      <button class="btn-primary" data-action="start_custom" ${filtered === 0 ? "disabled" : ""}>Start sessie</button>
    </section>
  `;
}

function renderStudy() {
  const card = currentCard();
  if (!card) {
    if (state.queue.length === 0) {
      app.innerHTML = `
        <section class="card fade-in">
          <h2>Geen kaarten in deze wachtrij</h2>
          <p class="muted" style="margin-top:10px;">Pas je modus of filters aan om verder te leren.</p>
          <div class="row" style="margin-top:14px;">
            <button class="btn-ghost" data-action="go_dashboard">Dashboard</button>
            <button class="btn-primary" data-action="open_setup">Filters aanpassen</button>
          </div>
        </section>
      `;
      return;
    }
    finishSession();
    return;
  }

  const category = state.db.categories.find((x) => x.id === card.category);
  const categoryColor = safeColor(category?.color || "#2b7a46");
  const progress = getCardProgress(state.progress, card.id);
  const nextPreview = previewIntervals(progress);
  const pct = Math.round(((state.queueIndex + 1) / state.queue.length) * 100);

  app.innerHTML = `
    <section class="row space-between fade-in" style="margin-bottom:12px;">
      <button class="btn-ghost" data-action="go_dashboard">Sessie verlaten</button>
      <span class="badge" aria-label="Sessievoortgang">Kaart ${state.queueIndex + 1} van ${state.queue.length}</span>
    </section>

    <section class="progress-shell fade-in" style="margin-bottom:14px;">
      <div class="progress-bar" style="width:${pct}%"></div>
    </section>

    <section class="study-layout fade-in">
      <article class="card study-card" style="--category-color:${categoryColor};">
        <div class="row space-between">
          <span class="badge">${category ? `${category.icon} ${escapeHtml(category.name)}` : escapeHtml(card.category)}</span>
          <span class="badge">${escapeHtml(card.difficulty)}</span>
        </div>

        <div class="study-content">
          <p class="eyebrow">Vraag</p>
          <h2>${escapeHtml(card.question)}</h2>

          ${
            state.answerRevealed
              ? renderAnswerMarkup(card)
              : `<p class="muted">Toon het antwoord, beoordeel direct.</p>`
          }
        </div>

        <div class="row">
          <button class="btn-primary" data-action="reveal_answer" ${state.answerRevealed ? "disabled" : ""}>Toon antwoord</button>
          <button class="btn-ghost" data-action="undo" ${state.session.undoStack.length > 0 ? "" : "disabled"}>Laatste ongedaan maken</button>
        </div>
      </article>

      <aside class="card session-meta">
        <h3>Beoordeel recall</h3>
        <p class="muted">Kies je zekerheid.</p>
        ${renderRatingButtons(nextPreview, !state.answerRevealed)}
        <section class="notice" aria-label="Sneltoetsen">
          <p class="eyebrow" style="margin-bottom:8px;">Sneltoetsen</p>
          ${shortcutsMarkup()}
        </section>
      </aside>
    </section>

    ${
      state.answerRevealed
        ? `<section class="mobile-rate-dock fade-in" aria-label="Snelle beoordeling op mobiel">${renderRatingButtons(nextPreview, false)}</section>`
        : ""
    }
  `;
}

function renderSummary() {
  if (!state.session) {
    state.view = "dashboard";
    render();
    return;
  }

  const reviewed = state.session.reviewed || 1;
  const confidence = (state.session.ratings.good + state.session.ratings.easy) / reviewed;

  app.innerHTML = `
    <section class="hero fade-in">
      <article class="card surface">
        <p class="eyebrow">Sessie afgerond</p>
        <h1>${formatPercent(confidence)} zelfverzekerde recall</h1>
        <p class="muted" style="margin-top:10px;">${state.session.reviewed} kaarten, ${state.session.uniqueReviewed.size} unieke prompts.</p>
        <div class="row" style="margin-top:14px;">
          <button class="btn-primary" data-action="restart_same">Modus herhalen</button>
          <button class="btn-ghost" data-action="go_dashboard">Dashboard</button>
        </div>
      </article>
      <article class="card">
        <h3>Scoreverdeling</h3>
        <div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr)); margin-top:12px; gap:10px;">
          <div class="notice">Opnieuw: <strong>${state.session.ratings.again}</strong></div>
          <div class="notice">Moeilijk: <strong>${state.session.ratings.hard}</strong></div>
          <div class="notice">Goed: <strong>${state.session.ratings.good}</strong></div>
          <div class="notice">Makkelijk: <strong>${state.session.ratings.easy}</strong></div>
        </div>
      </article>
    </section>
  `;
}

function renderLoading() {
  app.innerHTML = `<section class="card"><p>Flashcards laden...</p></section>`;
}

function renderError(message) {
  app.innerHTML = `
    <section class="card">
      <h2>Flashcards konden niet geladen worden</h2>
      <p class="muted" style="margin-top:8px;">${escapeHtml(message)}</p>
    </section>
  `;
}

function render() {
  if (state.view === "loading") {
    renderLoading();
    return;
  }
  if (state.view === "dashboard") {
    renderDashboard();
    return;
  }
  if (state.view === "setup") {
    renderSetup();
    return;
  }
  if (state.view === "study") {
    renderStudy();
    return;
  }
  if (state.view === "summary") {
    renderSummary();
    return;
  }
  renderDashboard();
}

function onClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const value = target.dataset.value;

  if (action === "start_daily") {
    startSession("daily");
    return;
  }
  if (action === "start_mode") {
    startSession(value);
    return;
  }
  if (action === "open_setup") {
    state.view = "setup";
    render();
    return;
  }
  if (action === "start_hard") {
    const hardQueue = Object.entries(state.progress.cards)
      .filter(([, progress]) => Number(progress.hardCount || 0) > 0)
      .sort((a, b) => new Date(a[1].dueAt).getTime() - new Date(b[1].dueAt).getTime())
      .map(([cardId]) => cardId)
      .filter((cardId) => Boolean(state.cardsById[cardId]));

    if (hardQueue.length === 0) return;

    state.queue = hardQueue;
    state.queueIndex = 0;
    state.answerRevealed = false;
    state.session = {
      startedAt: new Date().toISOString(),
      mode: "hard_marked",
      reviewed: 0,
      ratings: { again: 0, hard: 0, good: 0, easy: 0 },
      uniqueReviewed: new Set(),
      undoStack: [],
    };
    state.view = "study";
    persist();
    render();
    return;
  }
  if (action === "go_dashboard") {
    state.view = "dashboard";
    state.session = null;
    state.queue = [];
    state.queueIndex = 0;
    state.answerRevealed = false;
    render();
    return;
  }
  if (action === "set_category") {
    state.setup.category = value;
    persist();
    render();
    return;
  }
  if (action === "set_difficulty") {
    state.setup.difficulty = value;
    persist();
    render();
    return;
  }
  if (action === "set_mode") {
    state.setup.mode = value;
    persist();
    render();
    return;
  }
  if (action === "start_custom") {
    startSession(state.setup.mode);
    return;
  }
  if (action === "reveal_answer") {
    revealAnswer();
    return;
  }
  if (action === "rate") {
    rateCard(value);
    return;
  }
  if (action === "undo") {
    undoLastRating();
    return;
  }
  if (action === "restart_same") {
    startSession(state.session?.mode || state.setup.mode);
  }
}

function onKeydown(event) {
  if (state.view !== "study") return;

  if (event.key === " " && !state.answerRevealed) {
    event.preventDefault();
    revealAnswer();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undoLastRating();
    return;
  }

  if (!state.answerRevealed) return;

  if (event.key === "1") rateCard("again");
  if (event.key === "2") rateCard("hard");
  if (event.key === "3") rateCard("good");
  if (event.key === "4") rateCard("easy");
}

async function init() {
  try {
    loadState();
    const response = await fetch("./sden3_flashcards_database.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const db = await response.json();
    if (!Array.isArray(db.categories) || !Array.isArray(db.flashcards)) {
      throw new Error("Ongeldig JSON-schema: categories[] en flashcards[] verwacht");
    }

    db.flashcards = db.flashcards.map((card, index) => ({
      ...card,
      id: card.id || `card_${index + 1}`,
    }));

    state.db = db;
    state.cardsById = Object.fromEntries(db.flashcards.map((card) => [card.id, card]));
    state.view = "dashboard";

    app.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeydown);

    render();
  } catch (err) {
    renderError(err?.message || "Onbekende fout");
  }
}

init();
