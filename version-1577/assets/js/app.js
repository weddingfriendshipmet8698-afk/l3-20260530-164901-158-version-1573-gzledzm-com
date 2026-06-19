(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var button = one('[data-menu-toggle]');
    var panel = one('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    all('a', panel).forEach(function (link) {
      link.addEventListener('click', function () {
        panel.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        button.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function setupHero() {
    var root = one('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = all('.hero-slide', root);
    var dots = all('.hero-dot', root);
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    all('[data-filter-form]').forEach(function (form) {
      var targetSelector = form.getAttribute('data-target');
      var target = targetSelector ? one(targetSelector) : null;
      if (!target) {
        return;
      }
      var cards = all('.movie-card', target);
      var search = one('[name="q"]', form);
      var region = one('[name="region"]', form);
      var type = one('[name="type"]', form);
      var year = one('[name="year"]', form);
      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }
      function apply() {
        var q = normalize(search && search.value);
        var selectedRegion = normalize(region && region.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedRegion && normalize(card.getAttribute('data-region')).indexOf(selectedRegion) === -1) {
            ok = false;
          }
          if (selectedType && normalize(card.getAttribute('data-type')).indexOf(selectedType) === -1) {
            ok = false;
          }
          if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
            ok = false;
          }
          card.classList.toggle('hidden-by-filter', !ok);
        });
      }
      all('input, select', form).forEach(function (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      });
    });
  }

  function loadHls(done) {
    if (window.Hls) {
      done();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', done, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', done, { once: true });
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (stream) {
    var shell = one('[data-player]');
    var video = one('video', shell);
    var layer = one('[data-play-layer]', shell);
    if (!shell || !video || !layer || !stream) {
      return;
    }
    var prepared = false;
    var hlsInstance = null;
    function attach() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      });
    }
    function play() {
      attach();
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }
    layer.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!prepared || video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
