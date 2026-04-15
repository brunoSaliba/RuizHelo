const counterValue = document.querySelector("#counter-value");
const counterStore = window.CounterStore;

function render(value) {
  if (!counterValue) {
    return;
  }

  counterValue.textContent = String(value);
}

if (counterStore) {
  render(counterStore.getCounter());
  counterStore.subscribe(render);
}
