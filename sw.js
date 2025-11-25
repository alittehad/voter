<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
  .then(res => console.log("SW registered", res))
  .catch(err => console.log("SW error", err));
}
</script>
