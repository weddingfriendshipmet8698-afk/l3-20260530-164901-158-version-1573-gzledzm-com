(function () {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    function setHeaderState() {
        if (!header) {
            return;
        }
        if (window.scrollY > 6) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var nextButton = hero.querySelector("[data-hero-next]");
        var prevButton = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function prevSlide() {
            showSlide(current - 1);
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(nextSlide, 5200);
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                nextSlide();
                startTimer();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                prevSlide();
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var siteSearchForms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    siteSearchForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var target = form.getAttribute("action") || "./search.html";
            window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
        });
    });

    var filterInput = document.querySelector("[data-filter-input]");
    var filterSelect = document.querySelector("[data-filter-select]");
    var emptyState = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function getQueryParameter(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    if (filterInput && getQueryParameter("q")) {
        filterInput.value = getQueryParameter("q");
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var selectedYear = filterSelect ? filterSelect.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = card.getAttribute("data-search") || "";
            var year = card.getAttribute("data-year") || "";
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedYear = !selectedYear || year === selectedYear;
            var visible = matchedKeyword && matchedYear;
            card.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visibleCount === 0);
        }
    }

    if (filterInput) {
        filterInput.addEventListener("input", applyFilters);
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", applyFilters);
    }

    applyFilters();
})();
