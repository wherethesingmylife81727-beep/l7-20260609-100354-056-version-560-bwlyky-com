(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = !panel.hasAttribute('hidden');
      if (isOpen) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var index = 0;

    if (!slides.length || !dots.length) {
      return;
    }

    function show(nextIndex) {
      slides[index].classList.remove('is-active');
      dots[index].classList.remove('is-active');
      index = nextIndex;
      slides[index].classList.add('is-active');
      dots[index].classList.add('is-active');
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function setupFiltering() {
    var input = document.getElementById('movieFilter');
    var grid = document.querySelector('.filter-grid');
    var noResults = document.querySelector('.no-results');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.sort-button'));

    if (!cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = input ? normalize(input.value) : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.hidden = visible !== 0;
      }
    }

    function sortCards(type) {
      if (!grid) {
        return;
      }

      var sorted = cards.slice().sort(function (a, b) {
        var aYear = Number(a.getAttribute('data-year')) || 0;
        var bYear = Number(b.getAttribute('data-year')) || 0;
        var aScore = Number(a.getAttribute('data-score')) || 0;
        var bScore = Number(b.getAttribute('data-score')) || 0;

        if (type === 'oldest') {
          return aYear - bYear;
        }

        if (type === 'newest') {
          return bYear - aYear;
        }

        return bScore - aScore;
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
    }

    if (input) {
      input.addEventListener('input', applyFilter);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        sortCards(button.getAttribute('data-sort'));
        applyFilter();
      });
    });

    applyFilter();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
  });
}());
