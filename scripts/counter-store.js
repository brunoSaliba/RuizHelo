const STORAGE_KEY = "birthday-post-counter";
const subscribers = new Set();

function sanitizeValue(value) {
  const parsed = Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function getCounter() {
  try {
    return sanitizeValue(window.localStorage.getItem(STORAGE_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function setCounter(nextValue) {
  const safeValue = sanitizeValue(nextValue);

  try {
    window.localStorage.setItem(STORAGE_KEY, String(safeValue));
  } catch {
    // Ignore storage failures and still update in-memory subscribers.
  }

  notify(safeValue);
  return safeValue;
}

function incrementCounter() {
  return setCounter(getCounter() + 1);
}

function decrementCounter() {
  return setCounter(getCounter() - 1);
}

function resetCounter() {
  return setCounter(0);
}

function subscribe(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function notify(value) {
  subscribers.forEach((listener) => listener(value));
}

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  notify(getCounter());
});

window.CounterStore = {
  getCounter,
  setCounter,
  incrementCounter,
  decrementCounter,
  resetCounter,
  subscribe,
};
