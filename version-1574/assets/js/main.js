(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-carousel-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    const input = root.querySelector('[data-filter-input]');
    const region = root.querySelector('[data-filter-region]');
    const year = root.querySelector('[data-filter-year]');
    const category = root.querySelector('[data-filter-category]');
    const cards = Array.from(root.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function apply() {
      const query = normalize(input ? input.value : '');
      const selectedRegion = normalize(region ? region.value : '');
      const selectedYear = normalize(year ? year.value : '');
      const selectedCategory = normalize(category ? category.value : '');

      cards.forEach(function (card) {
        const haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        const matchesQuery = !query || haystack.indexOf(query) !== -1;
        const matchesRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
        const matchesYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        const matchesCategory = !selectedCategory || normalize(card.getAttribute('data-category')) === selectedCategory;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesRegion && matchesYear && matchesCategory));
      });
    }

    [input, region, year, category].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
