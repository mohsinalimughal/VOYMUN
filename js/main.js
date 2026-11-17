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

  /* ---------- Committee details ----------
     To update a committee, edit its entry below. */
  var COMMITTEES = {
    pna: {
      abbr: "PNA",
      name: "Pakistan National Assembly",
      agendaTitle: "The System Has Collapsed",
      agendaText: "Discussing the Structural Changes and Constitutional Amendment",
      about: "The Pakistan National Assembly is the country's parliament, where national laws are proposed, debated and passed. At VOYMUN, the committee works the way the real Assembly works.",
      inside: [
        "You sit as a Member of Parliament.",
        "You debate national bills and argue for or against amendments.",
        "You pass laws by vote, just like the real Assembly."
      ],
      why: [
        "Learn how Parliament really works.",
        "Practise formal debate in a national setting.",
        "Build persuasive speaking on issues that affect Pakistan directly."
      ]
    },
    fcc: {
      abbr: "FCC",
      name: "Federal Constitutional Court of Pakistan",
      agendaTitle: "",
      agendaText: "A petition has been filed in the Federal Constitutional Court to challenge the Governor's Rule and Emergency in Khyber Pakhtunkhwa.",
      about: "The Federal Constitutional Court is Pakistan's new apex constitutional court. It decides constitutional questions and landmark legal cases.",
      inside: [
        "You act as Petitioner, Respondent or Counsel.",
        "You build a case and argue it before the court.",
        "You work through constitutional questions with judicial reasoning."
      ],
      why: [
        "Develop legal reasoning and case-building skills.",
        "Practise courtroom-style speaking.",
        "A strong fit if you are interested in law or the Constitution."
      ]
    },
    unsc: {
      abbr: "UNSC",
      name: "United Nations Security Council",
      agendaTitle: "Beyond Borders",
      agendaText: "Preventing the Regionalisation of the Sudanese Civil War and Addressing External Involvement in the Conflict",
      about: "The Security Council is the UN body responsible for international peace and security.",
      inside: [
        "You represent a country on the Council.",
        "You respond to live crises, with updates during the session.",
        "You negotiate with other members to reach a resolution."
      ],
      why: [
        "Build crisis handling and quick judgement.",
        "Sharpen your negotiation skills under pressure.",
        "Experience high-stakes global diplomacy."
      ]
    },
    unhrc: {
      abbr: "UNHRC",
      name: "United Nations Human Rights Council",
      agendaTitle: "Breaking Point",
      agendaText: "Enforcing Accountability for War Crimes and Attacks on Civilian and Aid Infrastructure",
      about: "The Human Rights Council is the UN body that addresses human rights violations and works to protect fundamental freedoms around the world.",
      inside: [
        "You represent a country on the Council.",
        "You examine real human rights violations.",
        "You debate how the world should respond and hold those responsible to account."
      ],
      why: [
        "Develop critical thinking on real-world issues.",
        "Learn to disagree with respect.",
        "Speak up on accountability and the protection of civilians."
      ]
    },
    unwomen: {
      abbr: "UN Women",
      name: "Gender Equality & Empowerment of Women",
      agendaTitle: "Shadow Markets",
      agendaText: "Combating Human Trafficking, Forced Marriages, and Modern Slavery Among Displaced Women",
      about: "UN Women is the UN entity for gender equality and the empowerment of women.",
      inside: [
        "You represent a country in the committee.",
        "You debate policy on protection, work and education.",
        "You draft resolutions with other delegates."
      ],
      why: [
        "Build policy research and writing skills.",
        "Work on issues of gender equality and protection.",
        "Learn to turn ideas into a written resolution."
      ]
    },
    specpol: {
      abbr: "SPECPOL",
      name: "Special Political and Decolonization Committee",
      agendaTitle: "",
      agendaText: "Addressing the border dispute and their effects as a critical escalation point in the Israel–Palestine crisis (both the West Bank and Gaza).",
      about: "SPECPOL is the UN General Assembly's Fourth Committee. It takes up decolonisation, self-determination and other sensitive political questions.",
      inside: [
        "You represent a country in the General Assembly committee.",
        "You take up contested political and territorial questions.",
        "You negotiate with other delegates towards a resolution."
      ],
      why: [
        "Build historical research skills.",
        "Learn to handle contested issues with care.",
        "Practise negotiation on some of the world's hardest questions."
      ]
    }
  };

  var modal = document.getElementById("committeeModal");
  var lastTrigger = null;

  function fillList(id, items) {
    var ul = document.getElementById(id);
    ul.innerHTML = "";
    items.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
  }

  function openCommittee(key, trigger) {
    var c = COMMITTEES[key];
    if (!c || !modal) return;
    lastTrigger = trigger || null;
    document.getElementById("cmSeal").src = "images/seal-" + key + ".jpg";
    document.getElementById("cmSeal").alt = c.abbr + " committee seal";
    document.getElementById("cmAbbr").textContent = c.abbr;
    document.getElementById("cmTitle").textContent = c.name;
    document.getElementById("cmAgendaTitle").textContent = c.agendaTitle;
    document.getElementById("cmAgendaText").textContent = c.agendaText;
    document.getElementById("cmAbout").textContent = c.about;
    fillList("cmInside", c.inside);
    fillList("cmWhy", c.why);
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    document.body.classList.add("modal-open");
    modal.querySelector(".cmodal__inner").scrollTop = 0;
    document.getElementById("cmClose").focus();
  }

  function closeCommittee() {
    if (!modal) return;
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }

  if (modal) {
    modal.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
      if (lastTrigger) lastTrigger.focus();
    });
    document.getElementById("cmClose").addEventListener("click", closeCommittee);
    /* Click on the dark backdrop closes the dialog */
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeCommittee();
    });
  }

  document.querySelectorAll(".committee[data-committee]").forEach(function (card) {
    var key = card.getAttribute("data-committee");
    var btn = card.querySelector(".committee__more");
    card.addEventListener("click", function () { openCommittee(key, btn || card); });
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
