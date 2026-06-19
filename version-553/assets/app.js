(function () {
    function textOf(element) {
        return [
            element.dataset.title || "",
            element.dataset.region || "",
            element.dataset.type || "",
            element.dataset.year || "",
            element.dataset.genre || "",
            element.dataset.category || ""
        ].join(" ").toLowerCase();
    }

    function applyFilter(area) {
        var searchInput = area.querySelector("[data-local-search]");
        var activeChip = area.querySelector(".filter-chip.is-active");
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var filter = activeChip ? activeChip.dataset.filter : "all";
        area.querySelectorAll("[data-movie-card]").forEach(function (card) {
            var haystack = textOf(card);
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesFilter = filter === "all" || card.dataset.year === filter || card.dataset.category === filter;
            card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var siteNav = document.querySelector("[data-site-nav]");
        if (menuButton && siteNav) {
            menuButton.addEventListener("click", function () {
                siteNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-filter-area]").forEach(function (area) {
            var searchInput = area.querySelector("[data-local-search]");
            var syncInput = area.querySelector("[data-query-sync]");
            if (syncInput) {
                var params = new URLSearchParams(window.location.search);
                var value = params.get("q");
                if (value) {
                    syncInput.value = value;
                }
            }
            if (searchInput) {
                searchInput.addEventListener("input", function () {
                    applyFilter(area);
                });
            }
            area.querySelectorAll(".filter-chip").forEach(function (chip) {
                chip.addEventListener("click", function () {
                    area.querySelectorAll(".filter-chip").forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    applyFilter(area);
                });
            });
            applyFilter(area);
        });

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
        });
    });

    window.setupVideoPlayer = function (source) {
        var shell = document.querySelector("[data-player]");
        var video = document.querySelector("[data-player-video]");
        var button = document.querySelector("[data-player-button]");
        var attached = false;
        var manifestReady = false;
        var pendingPlay = false;
        var player = null;
        if (!shell || !video || !button || !source) {
            return;
        }
        function startPlayback() {
            shell.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                player.loadSource(source);
                player.attachMedia(video);
                player.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    manifestReady = true;
                    if (pendingPlay) {
                        startPlayback();
                    }
                });
                player.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !player) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        player.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        player.recoverMediaError();
                    } else {
                        player.destroy();
                        player = null;
                        video.src = source;
                        manifestReady = true;
                    }
                });
            } else {
                video.src = source;
                manifestReady = true;
            }
            video.load();
        }
        function play() {
            pendingPlay = true;
            attach();
            if (manifestReady) {
                startPlayback();
            }
        }
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            shell.classList.remove("is-playing");
        });
    };
})();
