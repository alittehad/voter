if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => console.log("ServiceWorker registered:", reg))
      .catch(err => console.log("SW registration failed:", err));
  });
}
