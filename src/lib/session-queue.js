export function removeFutureOccurrences(queue, queueIndex, cardId) {
  return queue.filter((queuedId, index) => index <= queueIndex || queuedId !== cardId);
}

function randomInt(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function queueAgainCard(queue, queueIndex, cardId, options = {}) {
  const { minOffset = 3, maxOffset = 5, offset, random = Math.random } = options;
  const nextQueue = removeFutureOccurrences(queue, queueIndex, cardId);
  const chosenOffset = Number.isInteger(offset) ? offset : randomInt(minOffset, maxOffset, random);
  const insertAt = Math.min(nextQueue.length, queueIndex + chosenOffset);
  nextQueue.splice(insertAt, 0, cardId);
  return nextQueue;
}

export function queueHardCard(queue, queueIndex, cardId) {
  const nextQueue = removeFutureOccurrences(queue, queueIndex, cardId);
  nextQueue.push(cardId);
  return nextQueue;
}
