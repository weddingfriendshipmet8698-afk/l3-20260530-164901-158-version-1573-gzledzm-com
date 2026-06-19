(function () {
    window.setupPlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var overlay = document.getElementById(config.overlayId);
        var source = config.source;
        var started = false;
        var attached = false;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return Promise.resolve();
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({
                    maxBufferLength: 30,
                    enableWorker: true,
                    lowLatencyMode: false
                });
                video._hls = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }

            video.src = source;
            return Promise.resolve();
        }

        function startPlayback() {
            if (started) {
                if (video.paused) {
                    var replay = video.play();
                    if (replay && replay.catch) {
                        replay.catch(function () {});
                    }
                }
                return;
            }

            started = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            attachSource().then(function () {
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            });
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
            overlay.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    startPlayback();
                }
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
    };
})();
