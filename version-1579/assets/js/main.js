document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var menu = document.getElementById("siteMenu");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previousButton = hero.querySelector("[data-hero-prev]");
        var nextButton = hero.querySelector("[data-hero-next]");
        var activeIndex = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        };

        var startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (previousButton) {
            previousButton.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var searchInput = document.querySelector("[data-filter-search]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var cardList = document.querySelector("[data-card-list]");
    var emptyState = document.querySelector("[data-filter-empty]");

    if (searchInput && cardList) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get("q");

        if (queryFromUrl) {
            searchInput.value = queryFromUrl;
        }

        var normalize = function (value) {
            return String(value || "").trim().toLowerCase();
        };

        var filterCards = function () {
            var query = normalize(searchInput.value);
            var type = typeSelect ? normalize(typeSelect.value) : "";
            var year = yearSelect ? normalize(yearSelect.value) : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-keywords")
                ].join(" "));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
                var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
                var visible = matchesQuery && matchesType && matchesYear;

                card.hidden = !visible;

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        };

        searchInput.addEventListener("input", filterCards);

        if (typeSelect) {
            typeSelect.addEventListener("change", filterCards);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", filterCards);
        }

        filterCards();
    }
});
