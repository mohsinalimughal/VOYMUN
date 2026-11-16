/* VOYMUN 2027 — interactions */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav ---------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function onScrollNav() {
    if (window.scrollY > 40) nav.classList.add("nav--scrolled");
    else nav.classList.remove("nav--scrolled");
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  function closeMenu() {
    nav.classList.remove("nav--open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }
  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("nav--open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("nav--open")) closeMenu();
  });

  /* ---------- Active nav link while scrolling ---------- */
  var sections = ["home", "about", "committees", "why", "registration", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var linkMap = {};
  navLinks.querySelectorAll(".nav__link").forEach(function (a) {
    var id = (a.getAttribute("href") || "").replace("#", "");
    if (id) linkMap[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove("nav__link--active"); });
          var link = linkMap[entry.target.id];
          if (link) link.classList.add("nav__link--active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { secObs.observe(s); });
  }

  /* ---------- Countdown (Asia/Karachi, UTC+05:00) ----------
     2 January 2027, 00:00 Pakistan time = 1 Jan 2027 19:00 UTC */
  var EVENT_START = Date.UTC(2027, 0, 1, 19, 0, 0);
  var EVENT_END = Date.UTC(2027, 0, 3, 19, 0, 0); // end of 3 Jan, PKT
  var cdDays = document.getElementById("cdDays");
  var cdHours = document.getElementById("cdHours");
  var cdMins = document.getElementById("cdMins");
  var cdSecs = document.getElementById("cdSecs");
  var cdLabel = document.getElementById("countdownLabel");
  var cdGrid = document.getElementById("countdownGrid");
  var cdTimer = null;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function tick() {
    var now = Date.now();
    var diff = EVENT_START - now;
    if (diff <= 0) {
      if (cdTimer) clearInterval(cdTimer);
      cdGrid.hidden = true;
      cdLabel.textContent = now < EVENT_END
        ? "VOYMUN 2027 is happening now at NUML, Karachi Campus!"
        : "VOYMUN 2027 has concluded. Thank you for making every voice matter.";
      return;
    }
    var s = Math.floor(diff / 1000);
    cdDays.textContent = pad(Math.floor(s / 86400));
    cdHours.textContent = pad(Math.floor((s % 86400) / 3600));
    cdMins.textContent = pad(Math.floor((s % 3600) / 60));
    cdSecs.textContent = pad(s % 60);
  }
  tick();
  cdTimer = setInterval(tick, 1000);

  /* ---------- Scroll reveal ---------- */
  var animated = document.querySelectorAll(".animate");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    animated.forEach(function (el) { revealObs.observe(el); });
    /* Safety net: anything still hidden after 2.5s becomes visible */
    setTimeout(function () {
      animated.forEach(function (el) { el.classList.add("in"); });
    }, 2500);
  } else {
    animated.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Subtle parallax ---------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !prefersReduced) {
    var ticking = false;
    function parallax() {
      parallaxEls.forEach(function (el) {
        var rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.transform = "translateY(" + (progress * -36).toFixed(1) + "px)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ---------- FAQ accordion ---------- */
  var accItems = document.querySelectorAll(".acc-item");
  accItems.forEach(function (item) {
    var btn = item.querySelector(".acc-btn");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      accItems.forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".acc-btn").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Copy email ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(function () { toast.classList.add("show"); });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.hidden = true; }, 350);
    }, 2200);
  }
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      function fallback() {
        var r = document.createRange();
        var target = btn.previousElementSibling || btn.parentElement;
        r.selectNodeContents(target);
        var sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(r);
        showToast("Press Ctrl+C to copy");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast("Email copied: " + text);
        }).catch(fallback);
      } else { fallback(); }
    });
  });

  /* ---------- Smooth anchor offset for sticky nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var navH = nav.offsetHeight;
      var y = target.getBoundingClientRect().top + window.scrollY - (id === "home" ? navH : navH - 10);
      window.scrollTo({ top: Math.max(0, y), behavior: prefersReduced ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  });
})();
