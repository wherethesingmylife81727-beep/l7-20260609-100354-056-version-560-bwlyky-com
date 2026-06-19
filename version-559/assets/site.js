(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function yearMatched(cardYear, selected) {
    if (!selected) {
      return true;
    }
    var year = Number(cardYear || 0);
    var target = Number(selected);
    if (target >= 1990 && target <= 2010) {
      return year >= target && year < target + 10;
    }
    return year === target;
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var typeSelect = scope.querySelector('[data-type-filter]');
      var yearSelect = scope.querySelector('[data-year-filter]');
      var empty = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      function apply() {
        var query = normalize(input ? input.value : '');
        var typeValue = normalize(typeSelect ? typeSelect.value : '');
        var yearValue = yearSelect ? yearSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' '));
          var type = normalize(card.getAttribute('data-type'));
          var okQuery = !query || haystack.indexOf(query) !== -1;
          var okType = !typeValue || type.indexOf(typeValue) !== -1;
          var okYear = yearMatched(card.getAttribute('data-year'), yearValue);
          var show = okQuery && okType && okYear;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  window.initializePlayer = function (videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !url) {
      return;
    }
    var hlsInstance = null;
    var started = false;
    function begin() {
      button.classList.add('is-hidden');
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = url;
      video.play().catch(function () {});
    }
    button.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
