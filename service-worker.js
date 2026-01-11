self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("shopping-v6").then(c =>
      c.addAll(["./", "./index.html", "./style.css", "./app.js"])
    )
  );
});
