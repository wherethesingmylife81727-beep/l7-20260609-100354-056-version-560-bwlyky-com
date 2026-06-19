
(function () {
  function queryAll(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
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

    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupFiltering() {
    var panels = queryAll('[data-filter-panel]');

    panels.forEach(function (panel) {
      var targetSelector = panel.getAttribute('data-filter-target');
      var cards = queryAll(targetSelector || '[data-search-card]');
      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var genreSelect = panel.querySelector('[data-filter-genre]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var emptyState = document.querySelector(panel.getAttribute('data-empty-target') || '');

      function normalized(value) {
        return String(value || '').trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalized(keywordInput && keywordInput.value);
        var genre = normalized(genreSelect && genreSelect.value);
        var region = normalized(regionSelect && regionSelect.value);
        var year = normalized(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalized([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var cardGenre = normalized(card.getAttribute('data-genre'));
          var cardRegion = normalized(card.getAttribute('data-region'));
          var cardYear = normalized(card.getAttribute('data-year'));
          var match = true;

          if (keyword && text.indexOf(keyword) === -1) {
            match = false;
          }

          if (genre && cardGenre.indexOf(genre) === -1) {
            match = false;
          }

          if (region && cardRegion.indexOf(region) === -1) {
            match = false;
          }

          if (year && cardYear !== year) {
            match = false;
          }

          card.style.display = match ? '' : 'none';

          if (match) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      }

      [keywordInput, genreSelect, regionSelect, yearSelect].forEach(function (field) {
        if (field) {
          field.addEventListener('input', applyFilter);
          field.addEventListener('change', applyFilter);
        }
      });
    });
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback);
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback);
    document.head.appendChild(script);
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');

    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var message = player.querySelector('[data-player-message]');
    var source = player.getAttribute('data-video-url');
    var initialized = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachSource() {
      if (initialized || !video || !source) {
        return;
      }

      initialized = true;
      setMessage('正在加载播放源…');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('');
        return;
      }

      loadHlsLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            setMessage('播放源加载中，如网络较慢请稍候。');
          });
        } else {
          video.src = source;
          setMessage('当前浏览器可能需要支持 HLS 才能播放该视频源。');
        }
      });
    }

    function startPlayback() {
      attachSource();

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setMessage('请再次点击播放按钮开始播放。');
        });
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
    setupPlayer();
  });
})();
