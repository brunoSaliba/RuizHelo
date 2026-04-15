const subscribers = new Set();
const DEFAULT_POLL_INTERVAL_MS = 10000;

const config = window.CounterConfig ?? {};
const isConfigured =
  typeof config.supabaseUrl === "string" &&
  typeof config.supabaseAnonKey === "string" &&
  config.supabaseUrl.length > 0 &&
  config.supabaseAnonKey.length > 0 &&
  !config.supabaseUrl.includes("YOUR_PROJECT") &&
  !config.supabaseAnonKey.includes("YOUR_SUPABASE_ANON_KEY");

const counterRowId = Number.isInteger(config.counterRowId) ? config.counterRowId : 1;
const pollIntervalMs =
  Number.isInteger(config.pollIntervalMs) && config.pollIntervalMs > 0
    ? config.pollIntervalMs
    : DEFAULT_POLL_INTERVAL_MS;

let pollTimer = null;
let refreshPromise = null;

let state = {
  value: 0,
  isLoading: true,
  isConfigured,
  isSyncing: false,
  error: isConfigured
    ? ""
    : "Configure o Supabase em scripts/counter-config.js para ativar o contador global.",
};

function sanitizeValue(value) {
  const parsed = Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function emit() {
  const snapshot = getSnapshot();
  subscribers.forEach((listener) => listener(snapshot));
}

function setState(nextState) {
  state = {
    ...state,
    ...nextState,
  };

  emit();
}

function getSnapshot() {
  return { ...state };
}

function getHeaders() {
  return {
    apikey: config.supabaseAnonKey,
    Authorization: `Bearer ${config.supabaseAnonKey}`,
    "Content-Type": "application/json",
  };
}

function getRestUrl(path) {
  const baseUrl = config.supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/rest/v1/${path}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      typeof body === "object" && body !== null && "message" in body
        ? body.message
        : "Nao foi possivel sincronizar o contador global.";
    throw new Error(String(errorMessage));
  }

  return body;
}

async function fetchRemoteCounter() {
  const url = `${getRestUrl(`counters?id=eq.${counterRowId}&select=value`)}&limit=1`;
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  const body = await parseResponse(response);
  const [row] = Array.isArray(body) ? body : [];

  if (!row || typeof row.value === "undefined") {
    throw new Error("O registro do contador global ainda nao foi criado no Supabase.");
  }

  return sanitizeValue(row.value);
}

async function runRpc(functionName, payload) {
  const response = await fetch(getRestUrl(`rpc/${functionName}`), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const body = await parseResponse(response);
  return sanitizeValue(body);
}

async function refreshCounter() {
  if (!state.isConfigured) {
    setState({
      isLoading: false,
    });
    return getSnapshot();
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const value = await fetchRemoteCounter();
      setState({
        value,
        isLoading: false,
        error: "",
      });
      return value;
    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : "Falha ao carregar o contador global.",
      });
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function executeRemoteUpdate(task) {
  if (!state.isConfigured) {
    const message = "Configure o Supabase antes de editar o contador global.";
    setState({ error: message });
    throw new Error(message);
  }

  setState({
    isSyncing: true,
    error: "",
  });

  try {
    const nextValue = await task();
    setState({
      value: nextValue,
      isLoading: false,
      isSyncing: false,
      error: "",
    });
    return nextValue;
  } catch (error) {
    setState({
      isSyncing: false,
      error: error instanceof Error ? error.message : "Falha ao atualizar o contador global.",
    });
    throw error;
  }
}

function setCounter(nextValue) {
  return executeRemoteUpdate(() =>
    runRpc("set_counter_value", {
      next_value: sanitizeValue(nextValue),
    }),
  );
}

function incrementCounter() {
  return executeRemoteUpdate(() =>
    runRpc("increment_counter", {
      delta_value: 1,
    }),
  );
}

function decrementCounter() {
  return executeRemoteUpdate(() =>
    runRpc("increment_counter", {
      delta_value: -1,
    }),
  );
}

function resetCounter() {
  return setCounter(0);
}

function subscribe(listener) {
  subscribers.add(listener);
  listener(getSnapshot());
  return () => subscribers.delete(listener);
}

function startPolling() {
  if (!state.isConfigured || pollTimer) {
    return;
  }

  pollTimer = window.setInterval(() => {
    refreshCounter().catch(() => {
      // Keep polling even if a request fails momentarily.
    });
  }, pollIntervalMs);
}

startPolling();
refreshCounter().catch(() => {
  // Pages should still render even when the backend is not ready.
});

window.CounterStore = {
  getSnapshot,
  refreshCounter,
  setCounter,
  incrementCounter,
  decrementCounter,
  resetCounter,
  subscribe,
};
