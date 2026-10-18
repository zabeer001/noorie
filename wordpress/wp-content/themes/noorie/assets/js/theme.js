document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".noorie-menu-toggle"),
    nav = document.querySelector(".noorie-nav");
  menu?.addEventListener("click", () => {
    const open = !nav.classList.contains("hidden");
    nav.classList.toggle("hidden");
    nav.classList.toggle("absolute");
    nav.classList.toggle("top-full");
    nav.classList.toggle("left-0");
    nav.classList.toggle("w-full");
    nav.classList.toggle("bg-white");
    nav.classList.toggle("p-6");
    menu.setAttribute("aria-expanded", String(!open));
  });
  const searchToggle = document.querySelector(".noorie-search-toggle"),
    search = document.querySelector(".noorie-search");
  searchToggle?.addEventListener("click", () => {
    search.classList.toggle("hidden");
    searchToggle.setAttribute(
      "aria-expanded",
      String(!search.classList.contains("hidden")),
    );
    search.querySelector("input")?.focus();
  });
  document.querySelectorAll("[data-fit]").forEach((button) =>
    button.addEventListener("click", () => {
      const fit = button.dataset.fit;
      document
        .querySelectorAll("[data-fit]")
        .forEach((b) => b.classList.toggle("bg-emeraldDeep", b === button));
      document
        .querySelectorAll(".noorie-product")
        .forEach((card) =>
          card.classList.toggle(
            "hidden",
            fit !== "all" && card.dataset.fit !== fit,
          ),
        );
    }),
  );
  document.querySelectorAll(".faq-toggle").forEach((button) =>
    button.addEventListener("click", () => {
      const panel = document.getElementById(
        button.getAttribute("aria-controls"),
      );
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("hidden");
      button.querySelector("i")?.classList.toggle("rotate-180");
    }),
  );
  const box = document.getElementById("loupe-box"),
    img = document.getElementById("loupe-img"),
    lens = document.getElementById("loupe-lens");
  if (box && img && lens) {
    const move = (e) => {
      const r = box.getBoundingClientRect(),
        x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left,
        y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      lens.style.display = "block";
      lens.style.left = `${x - 70}px`;
      lens.style.top = `${y - 70}px`;
      lens.style.backgroundImage = `url(${img.src})`;
      lens.style.backgroundSize = `${img.width * 2.5}px ${img.height * 2.5}px`;
      lens.style.backgroundPosition = `${-(x * 2.5 - 70)}px ${-(y * 2.5 - 70)}px`;
    };
    box.addEventListener("mousemove", move);
    box.addEventListener("mouseleave", () => (lens.style.display = "none"));
  }
});
