function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var trigger = document.getElementById(config.triggerId);
  var overlay = document.getElementById(config.overlayId);
  var attached = false;
  var hls = null;

  if (!video || !trigger || !overlay || !config.source) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(config.source);
      hls.attachMedia(video);
    } else {
      video.src = config.source;
    }
    attached = true;
  }

  function startPlayback() {
    attach();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  trigger.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    startPlayback();
  });

  overlay.addEventListener("click", function () {
    startPlayback();
  });

  overlay.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startPlayback();
    }
  });

  video.addEventListener("click", function () {
    if (!attached) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
