const counterValue = document.querySelector("#admin-counter-value");
const manualInput = document.querySelector("#manual-value");
const manualForm = document.querySelector("#manual-form");
const feedback = document.querySelector("#manual-feedback");
const incrementButton = document.querySelector("#increment-button");
const decrementButton = document.querySelector("#decrement-button");
const resetButton = document.querySelector("#reset-button");
const counterStore = window.CounterStore;

function render(value) {
  if (counterValue) {
    counterValue.textContent = String(value);
  }

  if (manualInput) {
    manualInput.value = String(value);
  }
}

function setFeedback(message) {
  if (!feedback) {
    return;
  }

  feedback.textContent = message;
}

if (incrementButton) {
  incrementButton.addEventListener("click", () => {
    if (!counterStore) {
      return;
    }

    const nextValue = counterStore.incrementCounter();
    setFeedback(`Valor atualizado para ${nextValue}.`);
  });
}

if (decrementButton) {
  decrementButton.addEventListener("click", () => {
    if (!counterStore) {
      return;
    }

    const previousValue = counterStore.getCounter();
    const nextValue = counterStore.decrementCounter();

    if (previousValue === 0 && nextValue === 0) {
      setFeedback("O contador ja esta em 0.");
      return;
    }

    setFeedback(`Valor atualizado para ${nextValue}.`);
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    if (!counterStore) {
      return;
    }

    counterStore.resetCounter();
    setFeedback("Contador zerado.");
  });
}

if (manualForm && manualInput) {
  manualForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!counterStore) {
      return;
    }

    const nextValue = counterStore.setCounter(manualInput.value);
    setFeedback(`Valor manual aplicado: ${nextValue}.`);
  });
}

if (counterStore) {
  render(counterStore.getCounter());
  counterStore.subscribe(render);
} else {
  setFeedback("Nao foi possivel iniciar o contador neste navegador.");
}
