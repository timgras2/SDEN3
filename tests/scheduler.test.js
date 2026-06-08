import assert from "node:assert/strict";
import { scheduleNext } from "../src/lib/scheduler.js";

function baseProgress(overrides = {}) {
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
    ...overrides,
  };
}

function testAgainIncrementsLapseAndHardCount() {
  const next = scheduleNext(baseProgress(), "again");

  assert.equal(next.intervalDays, 1);
  assert.equal(next.repetitions, 0);
  assert.equal(next.lapseCount, 1);
  assert.equal(next.hardCount, 1);
  assert.equal(next.correctCount, 0);
}

function testHardSetsMinimumIntervalAndHardCount() {
  const next = scheduleNext(baseProgress({ intervalDays: 1 }), "hard");

  assert.equal(next.intervalDays, 2);
  assert.equal(next.repetitions, 1);
  assert.equal(next.hardCount, 1);
  assert.equal(next.correctCount, 1);
}

function testGoodAndEasyDoNotIncrementHardCount() {
  const fromGood = scheduleNext(baseProgress(), "good");
  const fromEasy = scheduleNext(baseProgress(), "easy");

  assert.equal(fromGood.hardCount, 0);
  assert.equal(fromEasy.hardCount, 0);
}

export function runSchedulerTests() {
  testAgainIncrementsLapseAndHardCount();
  testHardSetsMinimumIntervalAndHardCount();
  testGoodAndEasyDoNotIncrementHardCount();
}
