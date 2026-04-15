const counterValue = document.querySelector("#admin-counter-value");
const manualInput = document.querySelector("#manual-value");
const manualForm = document.querySelector("#manual-form");
const feedback = document.querySelector("#manual-feedback");
const incrementButton = document.querySelector("#increment-button");
const decrementButton = document.querySelector("#decrement-button");
const resetButton = document.querySelector("#reset-button");
const counterStore = window.CounterStore;

function getActionButtons() {
  return [incrementButton, decrementButton, resetButton].filter(Boolean);
}

function setFeedback(message) {
  if (!feedback) {
    return;
  }

  feedback.textContent = message;
}

function render(snapshot) {
  if (counterValue) {
    counterValue.textContent = snapshot.isLoading ? "..." : String(snapshot.value);
  }

  if (manualInput && !snapshot.isSyncing) {
    manualInput.value = String(snapshot.value);
  }

  getActionButtons().forEach((button) => {
    button.disabled = snapshot.isSyncing || !snapshot.isConfigured;
  });

  if (manualInput) {
    manualInput.disabled = snapshot.isSyncing || !snapshot.isConfigured;
  }

  if (!snapshot.isConfigured) {
    setFeedback("Preencha scripts/counter-config.js com os dados do Supabase.");
    return;
  }

  if (snapshot.error) {
    setFeedback(snapshot.error);
    return;
  }

  if (snapshot.isSyncing) {
    setFeedback("Sincronizando alteracao global...");
  }
}

async function runAction(action, successMessage) {
  if (!counterStore) {
    return;
  }

  try {
    const nextValue = await action();
    setFeedback(successMessage(nextValue));
  } catch {
    // The store already exposes the error message to the UI.
  }
}

if (incrementButton) {
  incrementButton.addEventListener("click", () => {
    runAction(() => counterStore.incrementCounter(), (nextValue) => `Valor global atualizado para ${nextValue}.`);
  });
}

if (decrementButton) {
  decrementButton.addEventListener("click", async () => {
    if (!counterStore) {
      return;
    }

    const currentValue = counterStore.getSnapshot().value;

    await runAction(
      () => counterStore.decrementCounter(),
      (nextValue) =>
        currentValue === 0 && nextValue === 0
          ? "O contador global ja esta em 0."
          : `Valor global atualizado para ${nextValue}.`,
    );
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    runAction(() => counterStore.resetCounter(), () => "Contador global zerado.");
  });
}

if (manualForm && manualInput) {
  manualForm.addEventListener("submit", (event) => {
    event.preventDefault();

    runAction(
      () => counterStore.setCounter(manualInput.value),
      (nextValue) => `Valor global aplicado: ${nextValue}.`,
    );
  });
}

if (counterStore) {
  counterStore.subscribe(render);
} else {
  setFeedback("Nao foi possivel iniciar o contador global neste navegador.");
}
