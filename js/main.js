/* =========================================================
   Anjola — Landing page interactions
   ========================================================= */
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Sticky header state ---------- */
  const header = $(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setNav(false));

  /* ---------- Highlight current nav link ---------- */
  const navLinks = $$('.nav a:not(.btn)');
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("is-current", a.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    // Stagger siblings that enter together
    revealEls.forEach((el) => {
      const siblings = $$(":scope > .reveal", el.parentElement);
      const i = siblings.indexOf(el);
      if (i > 0) el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      revealObserver.observe(el);
    });
  }

  /* ---------- Animated lead flow (hero card + pipeline) ---------- */
  const cycle = (items, interval) => {
    if (reduceMotion || !items.length) return;
    let i = 0;
    setInterval(() => {
      items.forEach((el, idx) => el.classList.toggle("is-lit", idx === i));
      i = (i + 1) % items.length;
    }, interval);
  };
  cycle($$(".flow__item"), 1100);
  cycle($$(".pipeline__row--4 .pill"), 1100);

  /* ---------- Testimonials: active card follows hover / focus ---------- */
  const testimonials = $$(".testimonial");
  const activate = (card) => testimonials.forEach((t) => t.classList.toggle("is-active", t === card));
  testimonials.forEach((card) => {
    card.addEventListener("mouseenter", () => activate(card));
    card.addEventListener("focus", () => activate(card));
    card.addEventListener("click", () => activate(card));
  });

  /* ---------- Selected work carousel ----------
     Replace these entries with real case studies. */
  const projects = [
    {
      title: "Summit Exteriors",
      client: "Roofing & Exteriors",
      image: "assets/images/project-summit.jpg",
      alt: "Summit Exteriors website shown on a laptop",
      challenge: "A short sentence explaining what wasn't working.",
      changed: "SEO, website redesign, conversion improvements, or automation.",
      result: "A measurable outcome, improvement, or client testimonial.",
      link: "#",
    },
    {
      title: "Project Title",
      client: "Client Name",
      image: "assets/images/project-summit.jpg",
      alt: "Project preview",
      challenge: "A short sentence explaining what wasn't working.",
      changed: "SEO, website redesign, conversion improvements, or automation.",
      result: "A measurable outcome, improvement, or client testimonial.",
      link: "#",
    },
    {
      title: "Project Title",
      client: "Client Name",
      image: "assets/images/project-summit.jpg",
      alt: "Project preview",
      challenge: "A short sentence explaining what wasn't working.",
      changed: "SEO, website redesign, conversion improvements, or automation.",
      result: "A measurable outcome, improvement, or client testimonial.",
      link: "#",
    },
    {
      title: "Project Title",
      client: "Client Name",
      image: "assets/images/project-summit.jpg",
      alt: "Project preview",
      challenge: "A short sentence explaining what wasn't working.",
      changed: "SEO, website redesign, conversion improvements, or automation.",
      result: "A measurable outcome, improvement, or client testimonial.",
      link: "#",
    },
  ];

  const project = $("#project");
  const field = (name) => $(`[data-field="${name}"]`, project);
  const thumbsWrap = $(".project__thumbs", project);
  const mainImg = field("image");
  let current = 0;

  // Thumbnails show the next projects in line
  const thumbs = projects.map((p, idx) => {
    const btn = document.createElement("button");
    btn.className = "thumb";
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-label", `Show ${p.title}`);
    btn.innerHTML = `<img src="${p.image}" alt="" loading="lazy" />`;
    btn.addEventListener("click", () => show(idx));
    thumbsWrap.appendChild(btn);
    return btn;
  });

  const render = () => {
    const p = projects[current];
    field("title").textContent = p.title;
    field("client").textContent = p.client;
    field("challenge").textContent = p.challenge;
    field("changed").textContent = p.changed;
    field("result").textContent = p.result;
    field("link").setAttribute("href", p.link);
    mainImg.alt = p.alt;
    if (mainImg.getAttribute("src") !== p.image) mainImg.src = p.image;

    // Show up to 3 thumbs for the other projects, in carousel order
    const order = projects.map((_, i) => (current + 1 + i) % projects.length).slice(0, 3);
    thumbs.forEach((t, i) => {
      t.hidden = !order.includes(i);
      t.style.order = order.indexOf(i);
      t.setAttribute("aria-selected", "false");
    });
  };

  const show = (idx) => {
    current = (idx + projects.length) % projects.length;
    if (reduceMotion) return render();
    mainImg.classList.add("is-swapping");
    setTimeout(() => {
      render();
      mainImg.classList.remove("is-swapping");
    }, 250);
  };

  $$(".project__controls .round-btn", project).forEach((btn) =>
    btn.addEventListener("click", () => show(current + Number(btn.dataset.dir)))
  );
  project.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "ArrowLeft") show(current - 1);
  });
  render();

  /* ---------- Audit accordion ---------- */
  const accItems = $$(".acc");
  accItems.forEach((item) => {
    $(".acc__head", item).addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      accItems.forEach((other) => {
        other.classList.remove("is-open");
        $(".acc__head", other).setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("is-open");
        $(".acc__head", item).setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Audit request form ----------
     No backend yet: on submit this opens the visitor's email client
     with the details filled in. Swap for a real endpoint (Formspree,
     Netlify Forms, etc.) when available. */
  const form = $("#audit-form");
  const msg = $(".audit-form__msg", form);
  const defaultMsg = msg.textContent;
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const invalid = [];
    if (!data.name.trim()) invalid.push("name");
    if (!emailOk(data.email.trim())) invalid.push("email");
    if (!data.website.trim()) invalid.push("website");

    $$("input", form).forEach((input) => input.classList.toggle("is-invalid", invalid.includes(input.name)));
    msg.classList.remove("is-success", "is-error");

    if (invalid.length) {
      msg.textContent = "Please fill in your name, a valid email, and your website.";
      msg.classList.add("is-error");
      $(`[name="${invalid[0]}"]`, form).focus();
      return;
    }

    const subject = encodeURIComponent(`Free Audit Request — ${data.website.trim()}`);
    const body = encodeURIComponent(
      `Name: ${data.name.trim()}\nEmail: ${data.email.trim()}\nWebsite: ${data.website.trim()}\n\nI'd like a free website + lead-generation audit.`
    );
    window.location.href = `mailto:hello@anjola.co?subject=${subject}&body=${body}`;

    msg.textContent = "Thanks! Your email app should open to send the request.";
    msg.classList.add("is-success");
    form.reset();
    setTimeout(() => {
      msg.textContent = defaultMsg;
      msg.classList.remove("is-success");
    }, 8000);
  });

  $$("input", form).forEach((input) =>
    input.addEventListener("input", () => input.classList.remove("is-invalid"))
  );
})();
