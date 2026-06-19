document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".js-menu-button");
  var mobileNav = document.querySelector(".js-mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector(".js-hero");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;

    function show(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target")) || 0);
      });
    });

    window.setInterval(function () {
      if (slides.length > 1) {
        show((current + 1) % slides.length);
      }
    }, 5200);
  }

  document.querySelectorAll(".js-filter-zone").forEach(function (zone) {
    var parent = zone.parentElement;
    var search = zone.querySelector(".js-search");
    var year = zone.querySelector(".js-year-filter");
    var cards = Array.prototype.slice.call(parent.querySelectorAll(".js-movie-card"));

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchedText = !q || text.indexOf(q) !== -1;
        var matchedYear = !y || cardYear.indexOf(y) !== -1;
        card.classList.toggle("is-filter-hidden", !(matchedText && matchedYear));
      });
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
  });
});
