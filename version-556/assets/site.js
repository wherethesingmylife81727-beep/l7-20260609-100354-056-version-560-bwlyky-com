document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  document.querySelectorAll('form.site-search, form.quick-search, form.search-panel').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        input.focus();
        return;
      }
      event.preventDefault();
      var action = form.getAttribute('action') || 'search.html';
      var target = new URL(action, window.location.href);
      target.searchParams.set('q', value);
      window.location.href = target.toString();
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startHero();
      });
    });
    startHero();
  }

  document.querySelectorAll('.filter-target').forEach(function (grid) {
    var section = grid.closest('section') || document;
    var textInput = section.querySelector('.local-filter-input');
    var yearSelect = section.querySelector('.local-year-filter');
    var empty = section.querySelector('.filter-empty');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var query = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var matchText = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var visible = matchText && matchYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    if (textInput) {
      textInput.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  });

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-overlay');
    var stream = shell.getAttribute('data-stream');
    var ready = false;

    function beginPlayback() {
      if (!video || !stream) {
        return;
      }
      if (button) {
        button.classList.add('is-hidden');
        button.setAttribute('hidden', 'hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', stream);
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!ready) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          video._hls = hls;
          ready = true;
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', beginPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused && !video.currentSrc) {
          beginPlayback();
        }
      });
    }
  });

  var results = document.getElementById('search-results');
  if (results && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.getElementById('search-page-input');
    var summary = document.getElementById('search-summary');
    if (input) {
      input.value = query;
    }

    function makeResult(item) {
      var tags = Array.isArray(item.tags) ? item.tags.slice(0, 4).join(' ') : '';
      return '<article class="movie-card movie-card-standard" data-title="' + escapeHtml(item.title) + '" data-year="' + escapeHtml(item.year) + '" data-region="' + escapeHtml(item.region) + '" data-tags="' + escapeHtml(tags + ' ' + item.genre + ' ' + item.category) + '">' +
        '<a class="movie-cover" href="' + escapeHtml(item.url) + '">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="play-mark">▶</span><span class="movie-year">' + escapeHtml(item.year) + '</span><span class="movie-category">' + escapeHtml(item.category) + '</span></a>' +
        '<div class="movie-info"><h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p><div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div></div></article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    if (!query) {
      if (summary) {
        summary.textContent = '请输入关键词开始搜索';
      }
      results.innerHTML = '';
    } else {
      var lower = query.toLowerCase();
      var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var haystack = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          Array.isArray(item.tags) ? item.tags.join(' ') : '',
          item.oneLine
        ].join(' ').toLowerCase();
        return haystack.indexOf(lower) !== -1;
      });
      if (summary) {
        summary.textContent = matches.length ? '相关结果' : '没有找到相关影片';
      }
      results.innerHTML = matches.slice(0, 96).map(makeResult).join('');
    }
  }
});
