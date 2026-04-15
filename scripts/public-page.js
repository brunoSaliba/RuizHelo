const counterValue = document.querySelector("#counter-value");
const counterStatus = document.querySelector("#counter-status");
const counterStore = window.CounterStore;

function render(snapshot) {
  if (!counterValue) {
    return;
  }

  if (snapshot.isLoading) {
    counterValue.textContent = "...";
  } else {
    counterValue.textContent = String(snapshot.value);
  }

  if (!counterStatus) {
    return;
  }

  if (snapshot.error) {
    counterStatus.textContent = snapshot.error;
    return;
  }

  if (snapshot.isSyncing) {
    counterStatus.textContent = "Sincronizando contador global...";
    return;
  }

  counterStatus.textContent = "Contador global sincronizado para todos.";
}

if (counterStore) {
  counterStore.subscribe(render);
} else if (counterStatus) {
  counterStatus.textContent = "Nao foi possivel iniciar o contador global nesta pagina.";
}
