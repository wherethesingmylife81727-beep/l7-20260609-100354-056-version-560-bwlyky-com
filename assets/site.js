(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        window.clearInterval(timer);
        show(nextIndex);
        play();
      });
    });

    play();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var form = scope.querySelector("[data-filter-form]");
      var items = Array.prototype.slice.call(scope.querySelectorAll(".filter-item"));
      var empty = scope.querySelector("[data-empty-state]");
      if (!form || items.length === 0) {
        return;
      }
      var keyword = form.querySelector("[data-filter-keyword]");
      var type = form.querySelector("[data-filter-type]");
      var year = form.querySelector("[data-filter-year]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var key = normalize(keyword ? keyword.value : "");
        var typeValue = type ? type.value : "all";
        var yearValue = year ? year.value : "all";
        var visible = 0;

        items.forEach(function (item) {
          var text = normalize(item.getAttribute("data-filter-text") + " " + item.textContent);
          var itemType = item.getAttribute("data-type") || "";
          var itemYear = item.getAttribute("data-year") || "";
          var matched = true;

          if (key && text.indexOf(key) === -1) {
            matched = false;
          }
          if (typeValue !== "all" && itemType !== typeValue) {
            matched = false;
          }
          if (yearValue !== "all" && itemYear !== yearValue) {
            matched = false;
          }

          item.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible === 0 ? "block" : "none";
        }
      }

      [keyword, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var stream = player.getAttribute("data-stream");
      var isReady = false;

      if (!video || !cover || !stream) {
        return;
      }

      function attachStream() {
        if (isReady) {
          return;
        }
        isReady = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          player.hls = hls;
        } else {
          video.src = stream;
        }
      }

      function start() {
        attachStream();
        player.classList.add("is-playing");
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      cover.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!isReady) {
          start();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
