(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      document.body.classList.toggle("no-scroll", nav.classList.contains("open"));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = "./search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var empty = document.querySelector("[data-empty-message]");
    var params = new URLSearchParams(window.location.search);
    var activeValue = "";

    if (params.get("q")) {
      input.value = params.get("q");
    }

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function apply() {
      var query = normalize(input.value);
      var filterValue = normalize(activeValue);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-meta"),
          card.getAttribute("data-category")
        ].join(" "));
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedFilter = !filterValue || text.indexOf(filterValue) !== -1;
        var matched = matchedQuery && matchedFilter;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener("input", apply);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeValue = chip.getAttribute("data-filter-value") || "";
        apply();
      });
    });
    apply();
  }

  function initPlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var status = document.querySelector("[data-player-status]");
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    var loading = false;

    function setStatus(message) {
      if (!status) {
        return;
      }
      if (message) {
        status.textContent = message;
        status.hidden = false;
      } else {
        status.textContent = "";
        status.hidden = true;
      }
    }

    function attach() {
      if (attached || loading) {
        return Promise.resolve();
      }
      loading = true;
      setStatus("");
      return new Promise(function (resolve, reject) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            attached = true;
            loading = false;
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              loading = false;
              setStatus("播放加载失败，请稍后再试");
              reject(new Error("playback"));
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          attached = true;
          loading = false;
          resolve();
        } else {
          loading = false;
          setStatus("当前设备暂不支持播放");
          reject(new Error("unsupported"));
        }
      });
    }

    function play() {
      attach().then(function () {
        return video.play();
      }).then(function () {
        if (cover) {
          cover.classList.add("hidden");
        }
      }).catch(function () {
        setStatus("点击视频区域可继续播放");
      });
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("hidden");
      }
    });

    video.addEventListener("error", function () {
      setStatus("播放加载失败，请稍后再试");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
  });
})();
