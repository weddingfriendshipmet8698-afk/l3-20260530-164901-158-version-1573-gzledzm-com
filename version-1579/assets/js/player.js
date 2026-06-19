document.addEventListener("DOMContentLoaded", function () {
    var shell = document.querySelector("[data-player]");

    if (!shell) {
        return;
    }

    var video = shell.querySelector("video");
    var overlay = shell.querySelector("[data-player-overlay]");
    var button = shell.querySelector("[data-play-button]");
    var stream = shell.getAttribute("data-stream");
    var prepared = false;
    var hlsInstance = null;

    if (!video || !stream) {
        return;
    }

    var prepare = function () {
        if (prepared) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
        } else {
            video.src = stream;
        }

        prepared = true;
    };

    var start = function () {
        prepare();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        video.controls = true;
        var result = video.play();

        if (result && typeof result.catch === "function") {
            result.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    };

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
        }
    });
});
