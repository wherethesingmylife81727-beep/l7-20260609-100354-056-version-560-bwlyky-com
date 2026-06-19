(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.removeAttribute('src');
            image.classList.add('is-missing');
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        function play() {
            timer = setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            play();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }

        show(0);
        play();
    });

    function initializePlayer(box) {
        var video = box.querySelector('video');
        var stream = box.getAttribute('data-stream');
        var bigPlay = box.querySelector('[data-play]');
        var smallPlay = box.querySelector('[data-play-small]');
        var mute = box.querySelector('[data-mute]');
        var full = box.querySelector('[data-fullscreen]');
        var message = box.querySelector('[data-player-message]');
        var hlsInstance = null;

        if (!video || !stream) {
            if (message) {
                message.textContent = '视频加载失败，请刷新后重试';
            }
            box.classList.add('is-ready');
            return;
        }

        function markReady() {
            box.classList.add('is-ready');
        }

        function markError() {
            box.classList.add('is-ready');
            if (message) {
                message.textContent = '视频加载失败，请刷新后重试';
            }
        }

        if (globalThis.Hls && globalThis.Hls.isSupported()) {
            hlsInstance = new globalThis.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(globalThis.Hls.Events.MANIFEST_PARSED, markReady);
            hlsInstance.on(globalThis.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    markError();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.addEventListener('loadedmetadata', markReady);
            video.addEventListener('error', markError);
        } else {
            video.src = stream;
            video.addEventListener('loadedmetadata', markReady);
            video.addEventListener('error', markError);
        }

        function syncState() {
            box.classList.toggle('is-playing', !video.paused);
            if (smallPlay) {
                smallPlay.textContent = video.paused ? '▶' : 'Ⅱ';
            }
        }

        function togglePlay() {
            if (video.paused) {
                var playTask = video.play();
                if (playTask && typeof playTask.catch === 'function') {
                    playTask.catch(markError);
                }
            } else {
                video.pause();
            }
        }

        video.addEventListener('click', togglePlay);
        video.addEventListener('play', syncState);
        video.addEventListener('pause', syncState);
        video.addEventListener('canplay', markReady);

        if (bigPlay) {
            bigPlay.addEventListener('click', togglePlay);
        }

        if (smallPlay) {
            smallPlay.addEventListener('click', togglePlay);
        }

        if (mute) {
            mute.addEventListener('click', function () {
                video.muted = !video.muted;
                mute.textContent = video.muted ? '🔇' : '🔊';
            });
        }

        if (full) {
            full.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(initializePlayer);

    function escapeHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function renderSearch() {
        var panel = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-input]');
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-search-filter]'));
        var items = globalThis.movieSearchItems || [];
        var params = new URLSearchParams(location.search);
        var initialQuery = params.get('q') || '';
        var currentFilter = 'all';

        if (!panel || !input || !items.length) {
            return;
        }

        input.value = initialQuery;

        function card(item) {
            return '<a class="movie-card" href="' + escapeHTML(item.url) + '">' +
                '<span class="card-cover">' +
                '<img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '">' +
                '<span class="cover-shade"></span>' +
                '<span class="card-year">' + escapeHTML(item.year) + '</span>' +
                '<span class="card-duration">' + escapeHTML(item.duration) + '</span>' +
                '</span>' +
                '<span class="card-body">' +
                '<strong>' + escapeHTML(item.title) + '</strong>' +
                '<span class="card-desc">' + escapeHTML(item.oneLine) + '</span>' +
                '<span class="card-meta"><span>★ ' + escapeHTML(item.rating) + '</span><span>' + escapeHTML(item.region) + '</span><span>' + escapeHTML(item.type) + '</span></span>' +
                '</span>' +
                '</a>';
        }

        function apply() {
            var query = normalize(input.value);
            var results = items.filter(function (item) {
                var text = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' '));
                var filterHit = currentFilter === 'all' || normalize(item.type).indexOf(currentFilter) > -1 || normalize(item.region).indexOf(currentFilter) > -1 || normalize(item.genre).indexOf(currentFilter) > -1;
                var queryHit = !query || text.indexOf(query) > -1;
                return filterHit && queryHit;
            }).slice(0, 80);

            if (!results.length) {
                panel.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
                return;
            }

            panel.innerHTML = '<div class="movie-grid">' + results.map(card).join('') + '</div>';
        }

        input.addEventListener('input', apply);

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentFilter = button.getAttribute('data-search-filter');
                filterButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });

        apply();
    }

    renderSearch();
}());
