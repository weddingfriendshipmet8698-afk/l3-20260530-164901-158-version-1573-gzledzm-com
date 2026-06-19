(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let currentSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('active', idx === currentSlide);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  function startSlides() {
    if (slideTimer) {
      clearInterval(slideTimer);
    }
    if (slides.length > 1) {
      slideTimer = setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5000);
    }
  }

  const next = document.querySelector('.hero-control.next');
  const prev = document.querySelector('.hero-control.prev');

  if (next) {
    next.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      startSlides();
    });
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      startSlides();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.slideTarget || 0));
      startSlides();
    });
  });

  showSlide(0);
  startSlides();

  function initPlayer(frame) {
    const video = frame.querySelector('video');
    const overlay = frame.querySelector('.play-overlay');

    if (!video || video.dataset.ready === '1') {
      return video;
    }

    const source = video.dataset.src;
    video.dataset.ready = '1';

    if (source) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    video.addEventListener('play', function () {
      frame.classList.add('playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        frame.classList.remove('playing');
      }
    });

    video.addEventListener('ended', function () {
      frame.classList.remove('playing');
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        frame.classList.add('playing');
        const playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            frame.classList.remove('playing');
          });
        }
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        const playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }
    });

    return video;
  }

  document.querySelectorAll('.video-frame').forEach(function (frame) {
    const video = frame.querySelector('video');
    const overlay = frame.querySelector('.play-overlay');

    if (overlay) {
      overlay.addEventListener('click', function () {
        initPlayer(frame);
      }, { once: true });
    }

    if (video) {
      video.addEventListener('play', function () {
        initPlayer(frame);
      }, { once: true });
    }
  });

  const searchResults = document.getElementById('searchResults');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const searchForm = document.getElementById('searchForm');
  const resultCount = document.getElementById('resultCount');

  function movieCard(movie) {
    const tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster" href="./' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<h2><a href="./' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch(movies) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function render() {
      const keyword = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const category = categoryFilter ? categoryFilter.value : '';
      const matched = movies.filter(function (movie) {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.tags.join(' ')
        ].join(' ').toLowerCase();
        const byKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const byCategory = !category || movie.category === category;
        return byKeyword && byCategory;
      }).slice(0, 240);

      searchResults.innerHTML = matched.length ? matched.map(movieCard).join('') : '<div class="empty-state">没有匹配结果，请换一个关键词。</div>';

      if (resultCount) {
        resultCount.textContent = matched.length + ' 条结果';
      }
    }

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', render);
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', render);
    }

    render();
  }

  if (searchResults) {
    fetch('./assets/movies.json')
      .then(function (response) {
        return response.json();
      })
      .then(runSearch)
      .catch(function () {
        searchResults.innerHTML = '<div class="empty-state">搜索数据暂时无法读取。</div>';
      });
  }
})();
