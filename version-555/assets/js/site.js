(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, currentIndex) {
            slide.classList.toggle('is-active', currentIndex === activeIndex);
        });

        dots.forEach(function (dot, currentIndex) {
            dot.classList.toggle('is-active', currentIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-library-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var status = document.querySelector('[data-filter-status]');
    var empty = document.querySelector('[data-empty-message]');

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function applyFilter(value) {
        var keyword = value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-title') || '').toLowerCase();
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (status) {
            status.textContent = keyword ? '正在展示与“' + value.trim() + '”相关的影片' : '';
        }

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterInput) {
        var initialQuery = getQueryValue();
        filterInput.value = initialQuery;
        applyFilter(initialQuery);

        filterInput.addEventListener('input', function () {
            applyFilter(filterInput.value);
        });
    }
})();
