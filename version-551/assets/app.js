(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        play();
      });
    });
    show(0);
    play();
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var year = qs('[data-filter-year]', scope);
      var type = qs('[data-filter-type]', scope);
      var empty = qs('[data-empty-state]', scope);
      var cards = qsa('[data-filter-card]', scope);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (input && query) {
        input.value = query;
      }

      function update() {
        var text = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = card.getAttribute('data-search') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matched = true;

          if (text && haystack.indexOf(text) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener('input', update);
          element.addEventListener('change', update);
        }
      });
      update();
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-player-button]', player);
      if (!video || !button) {
        return;
      }
      var url = video.getAttribute('data-hls') || '';
      var ready = false;
      var hls = null;

      function prepare() {
        if (ready || !url) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        ready = true;
      }

      function begin() {
        prepare();
        player.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', begin);
      video.addEventListener('click', function () {
        if (video.paused) {
          begin();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
