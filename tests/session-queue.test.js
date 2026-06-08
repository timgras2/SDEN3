import assert from "node:assert/strict";
import { queueAgainCard, queueHardCard, removeFutureOccurrences } from "../src/lib/session-queue.js";

function testRemoveFutureOccurrencesRemovesOnlyFutureDuplicates() {
  const queue = ["a", "b", "x", "c", "x", "d"];
  const next = removeFutureOccurrences(queue, 2, "x");

  assert.deepEqual(next, ["a", "b", "x", "c", "d"]);
}

function testQueueAgainCardReinsertsWithDelay() {
  const queue = ["a", "b", "c", "d", "e", "f", "g"];
  const queueIndex = 1; // currently on "b"
  const next = queueAgainCard(queue, queueIndex, "b", { offset: 4 });

  assert.equal(next[2], "c");
  assert.equal(next[3], "d");
  assert.equal(next[4], "e");
  assert.equal(next[5], "b");
}

function testQueueHardCardMovesCardToEnd() {
  const queue = ["a", "b", "c", "b", "d"];
  const queueIndex = 1; // currently on first "b"
  const next = queueHardCard(queue, queueIndex, "b");

  assert.deepEqual(next, ["a", "b", "c", "d", "b"]);
}

export function runSessionQueueTests() {
  testRemoveFutureOccurrencesRemovesOnlyFutureDuplicates();
  testQueueAgainCardReinsertsWithDelay();
  testQueueHardCardMovesCardToEnd();
}
