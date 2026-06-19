(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var grid = document.querySelector("[data-card-grid]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var sortSelect = document.querySelector("[data-sort-select]");
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("kw") || "";
    if (input && query) {
      input.value = query;
    }
    function searchableText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
    }
    function applyFilter() {
      var keyword = normalize(input ? input.value : query);
      cards.forEach(function (card) {
        var matched = !keyword || searchableText(card).indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden-card", !matched);
      });
    }
    function sortCards(type) {
      if (!grid || !type) {
        return;
      }
      var sorted = cards.slice().sort(function (a, b) {
        if (type === "year") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (type === "views") {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        }
        if (type === "rating") {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        }
        return 0;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }
    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (sortSelect) {
      var sortParam = params.get("sort");
      if (sortParam) {
        sortSelect.value = sortParam;
      }
      sortCards(sortSelect.value);
      sortSelect.addEventListener("change", function () {
        sortCards(sortSelect.value);
      });
    }
    applyFilter();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
