(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var currentIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === currentIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(currentIndex + 1);
        }, 5200);
    }

    function applyFilters() {
        var searchInput = document.querySelector('[data-search-input]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid] article'));
        var empty = document.querySelector('[data-filter-empty]');
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var yearValue = yearFilter ? yearFilter.value : '';
        var typeValue = typeFilter ? typeFilter.value : '';
        var visibleCount = 0;

        items.forEach(function (item) {
            var haystack = [
                item.dataset.title,
                item.dataset.region,
                item.dataset.type,
                item.dataset.genre,
                item.dataset.category,
                item.dataset.year
            ].join(' ').toLowerCase();
            var itemYear = parseInt(item.dataset.year || '0', 10);
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesYear = true;
            var matchesType = !typeValue || item.dataset.type === typeValue;

            if (yearValue === '2022') {
                matchesYear = itemYear <= 2022;
            } else if (yearValue) {
                matchesYear = String(itemYear) === yearValue;
            }

            var visible = matchesQuery && matchesYear && matchesType;
            item.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });

        if (empty) {
            empty.hidden = visibleCount !== 0;
        }
    }

    ['input', 'change'].forEach(function (eventName) {
        document.addEventListener(eventName, function (event) {
            if (event.target.matches('[data-search-input], [data-year-filter], [data-type-filter]')) {
                applyFilters();
            }
        });
    });

    var resetButton = document.querySelector('[data-filter-reset]');
    if (resetButton) {
        resetButton.addEventListener('click', function () {
            var searchInput = document.querySelector('[data-search-input]');
            var yearFilter = document.querySelector('[data-year-filter]');
            var typeFilter = document.querySelector('[data-type-filter]');

            if (searchInput) {
                searchInput.value = '';
            }
            if (yearFilter) {
                yearFilter.value = '';
            }
            if (typeFilter) {
                typeFilter.value = '';
            }
            applyFilters();
        });
    }

    function setupPlayer() {
        var video = document.querySelector('[data-video-src]');
        var playButton = document.querySelector('[data-play-button]');
        var status = document.querySelector('[data-video-status]');

        if (!video || !playButton) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function loadAndPlay() {
            var source = video.dataset.videoSrc;
            if (!source) {
                setStatus('当前页面没有可用播放源。');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        setStatus('视频已加载，请再次点击播放器开始播放。');
                    });
                });
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        setStatus('播放源加载失败，请稍后重试。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {
                        setStatus('视频已加载，请再次点击播放器开始播放。');
                    });
                }, { once: true });
            } else {
                video.src = source;
                video.play().catch(function () {
                    setStatus('当前浏览器不支持 HLS 播放，可更换浏览器访问。');
                });
            }

            playButton.classList.add('is-hidden');
            setStatus('正在加载播放源...');
        }

        playButton.addEventListener('click', loadAndPlay);
    }

    setupPlayer();
}());
