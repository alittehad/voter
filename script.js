if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    alert("New update installed! Please refresh.");
  });
}
