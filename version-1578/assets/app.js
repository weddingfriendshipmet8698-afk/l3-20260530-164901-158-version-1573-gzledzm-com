(() => {
  const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('menu-open');
    });
    selectAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => document.body.classList.remove('menu-open'));
    });
  }

  function initHero() {
    const root = document.querySelector('[data-hero]');
    if (!root) return;
    const slides = selectAll('[data-hero-slide]', root);
    const dots = selectAll('[data-hero-dot]', root);
    const prev = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const restart = () => {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function applyCards(scope) {
    const cards = selectAll('.movie-card', scope);
    const empty = scope.querySelector('[data-empty-state]') || document.querySelector('[data-empty-state]');
    let visible = 0;
    cards.forEach((card) => {
      if (!card.hidden) visible += 1;
    });
    if (empty) empty.classList.toggle('show', visible === 0);
  }

  function filterCards(scope, query, value) {
    const cards = selectAll('.movie-card', scope);
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedValue = value === 'all' ? '' : value.trim().toLowerCase();
    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.tags,
        card.dataset.category
      ].join(' ').toLowerCase();
      const queryMatch = !normalizedQuery || haystack.includes(normalizedQuery);
      const filterMatch = !normalizedValue || haystack.includes(normalizedValue);
      card.hidden = !(queryMatch && filterMatch);
    });
    applyCards(scope);
  }

  function initSearch() {
    selectAll('[data-search-input]').forEach((input) => {
      const scope = document.querySelector(input.dataset.searchScope) || document;
      const filterRow = scope.querySelector('[data-filter-row]');
      let selected = 'all';

      input.addEventListener('input', () => filterCards(scope, input.value, selected));

      if (filterRow) {
        selectAll('[data-filter-value]', filterRow).forEach((button) => {
          button.addEventListener('click', () => {
            selected = button.dataset.filterValue || 'all';
            selectAll('[data-filter-value]', filterRow).forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            filterCards(scope, input.value, selected);
          });
        });
      }
    });
  }

  function startPlayer(shell) {
    const video = shell.querySelector('video');
    const cover = shell.querySelector('[data-play-trigger]');
    if (!video) return;
    const source = video.dataset.stream;
    if (!source) return;
    if (cover) cover.classList.add('is-hidden');

    const play = () => {
      const result = video.play();
      if (result && typeof result.catch === 'function') result.catch(() => {});
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) video.src = source;
      play();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__hlsLoaded) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.__hlsLoaded = true;
        video.__hls = hls;
        video.addEventListener('canplay', play, { once: true });
      } else {
        play();
      }
      return;
    }

    if (video.src !== source) video.src = source;
    play();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach((shell) => {
      const trigger = shell.querySelector('[data-play-trigger]');
      if (trigger) trigger.addEventListener('click', () => startPlayer(shell));
      shell.addEventListener('dblclick', () => startPlayer(shell));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
