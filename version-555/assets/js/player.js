(function () {
    var player = document.querySelector('[data-player]');

    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play-cover]');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-source');
    var ready = false;

    function initVideo() {
        if (ready || !video || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        ready = true;
    }

    function startVideo() {
        initVideo();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        if (video) {
            video.setAttribute('controls', 'controls');
            var playTask = video.play();

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }
    }

    if (button) {
        button.addEventListener('click', startVideo);
    }

    if (cover) {
        cover.addEventListener('click', startVideo);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startVideo();
            }
        });
    }
})();
