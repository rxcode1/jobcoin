/* ============================================================
   JobCoin — main.js
   Ambient particles, scroll reveals, animated counters,
   3D card tilt, ticker, and mocked interactions.
   ============================================================ */

/* ------------------------------------------------------------
   1. AMBIENT BACKGROUND — subtle floating particle field
------------------------------------------------------------ */
(function particles() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, pts;

  function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((W * H) / 28000));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.12 - 0.04,
      a: Math.random() * 0.5 + 0.1,
      green: Math.random() < 0.3,
    }));
  }
  init();
  window.addEventListener("resize", init);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.green
        ? `rgba(0, 133, 77, ${p.a * 0.35})`
        : `rgba(29, 29, 31, ${p.a * 0.15})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ------------------------------------------------------------
   2. SIDEBAR — retractable left panel
------------------------------------------------------------ */
(function sidebar() {
  const burger = document.getElementById("nav-burger");
  const panel = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const closeBtn = document.getElementById("sidebar-close");
  if (!burger || !panel || !overlay) return;

  function setOpen(open) {
    panel.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    burger.classList.toggle("open", open);
  }

  burger.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  overlay.addEventListener("click", () => setOpen(false));
  if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
})();

/* ------------------------------------------------------------
   3. TICKER — market feed
------------------------------------------------------------ */
(function ticker() {
  const el = document.getElementById("ticker");
  if (!el) return;
  const items = [
    ['<span class="coin-sym">$JOBC</span> Launching on Robinhood — soon'],
    ["Treasury balance: <span class='up'>$0</span> — fees route in from day one"],
    ["Paid out to workers: $0 — the board is open"],
    ["Bounty board: <span class='up'>live</span> — claim before launch"],
    ["Bag worker payroll: opens at launch"],
    ["The work floor is open — post your work"],
    ['<span class="coin-sym">$JOBC</span> Day one starts at zero. On purpose.'],
    ["Every payout will be public. Every fee tracked."],
  ];
  el.innerHTML = [...items, ...items]
    .map((i) => `<span>${i}</span>`)
    .join("");
})();

/* ------------------------------------------------------------
   3.5 NAV — transparent over the hero, solid once you scroll
------------------------------------------------------------ */
(function navScroll() {
  const bar = document.querySelector(".topbar");
  if (!bar) return;
  const update = () => bar.classList.toggle("scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
})();

/* ------------------------------------------------------------
   3.6 SUBMISSION STORE — shared local store for the work floor.
   (Backend later — for now submissions persist in this browser.)
------------------------------------------------------------ */
const JCStore = {
  key: "jobcoin_submissions",
  all() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },
  add(sub) {
    const list = this.all();
    list.unshift(sub);
    localStorage.setItem(this.key, JSON.stringify(list));
    return sub;
  },
};

function jcRef() {
  return "JC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function jcShortWallet(w) {
  return w.length > 12 ? w.slice(0, 6) + "…" + w.slice(-4) : w;
}

function jcTimeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

/* ------------------------------------------------------------
   4. SCROLL REVEALS — keyframe-based, staggered
------------------------------------------------------------ */
(function reveals() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const parent = e.target.parentElement;
        const siblings = [...parent.querySelectorAll(":scope > .reveal")];
        const idx = Math.max(siblings.indexOf(e.target), 0);
        e.target.style.animationDelay = `${Math.min(idx * 90, 450)}ms`;
        e.target.classList.add("visible");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
})();

/* ------------------------------------------------------------
   5. COUNTERS — animate stats when visible
------------------------------------------------------------ */
(function counters() {
  const els = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const target = parseInt(e.target.dataset.count, 10);
        const prefix = e.target.dataset.prefix || "";
        const suffix = e.target.dataset.suffix || "";
        const dur = 1800;
        const start = performance.now();
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          e.target.textContent =
            prefix + Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
})();

/* ------------------------------------------------------------
   6. 3D CARD TILT — pointer-tracked perspective on .tilt
------------------------------------------------------------ */
(function tilt() {
  if (window.matchMedia("(pointer: coarse)").matches) return; // skip touch

  document.querySelectorAll(".tilt").forEach((card) => {
    let raf = null;

    card.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateY(${(x * 10).toFixed(2)}deg)` +
          ` rotateX(${(-y * 10).toFixed(2)}deg) translateY(-6px) scale(1.02)`;
        raf = null;
      });
    });

    card.addEventListener("pointerleave", () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      card.style.transform = "";
    });
  });
})();

/* ------------------------------------------------------------
   7. BOUNTY CLAIM WIZARD — multi-step claim & proof flow
------------------------------------------------------------ */
(function bountyWizard() {
  const overlay = document.getElementById("wiz-overlay");
  if (!overlay) return;

  const steps = [...overlay.querySelectorAll(".wiz-step")];
  const bars = [...overlay.querySelectorAll(".wiz-progress i")];
  const state = { title: "", pay: "", type: "", proof: "", photoName: "", videoName: "" };

  const $ = (id) => document.getElementById(id);

  function goto(n) {
    steps.forEach((s, i) => s.classList.toggle("on", i === n));
    bars.forEach((b, i) => b.classList.toggle("on", i <= n));
    overlay.querySelector(".modal").scrollTop = 0;
  }

  function open(btn) {
    state.title = btn.dataset.title;
    state.pay = btn.dataset.pay;
    state.type = btn.dataset.type;
    state.proof = btn.dataset.proof;
    state.photoName = "";
    state.videoName = "";

    $("wiz-bounty-name").textContent = state.title;
    $("wiz-reward-amount").textContent = state.pay;
    $("wiz-type").textContent = state.type;
    $("wiz-proof-note").textContent = state.proof;

    // reset uploads + fields
    resetUpload($("wiz-photo"), "Photo proof", "JPG or PNG — tap to attach");
    resetUpload($("wiz-video"), "Video proof", "MP4 or MOV — tap to attach");
    $("wiz-photo-file").value = "";
    $("wiz-video-file").value = "";
    $("wiz-x").value = "";
    $("wiz-wallet").value = "";
    $("wiz-next-2").disabled = true;
    $("wiz-next-3").disabled = true;

    goto(0);
    overlay.classList.add("show");
    document.body.classList.add("modal-open");
  }

  function close() {
    overlay.classList.remove("show");
    document.body.classList.remove("modal-open");
  }

  function resetUpload(box, title, sub) {
    box.classList.remove("done");
    box.querySelector(".upload-title").textContent = title;
    box.querySelector(".upload-sub").textContent = sub;
  }

  function checkUploads() {
    $("wiz-next-2").disabled = !(state.photoName && state.videoName);
  }

  function checkFields() {
    $("wiz-next-3").disabled = !($("wiz-x").value.trim() && $("wiz-wallet").value.trim());
  }

  // wire bounty cards
  document.querySelectorAll(".claim-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      open(btn);
    });
  });

  // close interactions
  $("wiz-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // step 1 → 2
  $("wiz-claim").addEventListener("click", () => goto(1));

  // uploads — real file pickers (files stay in the browser until the backend lands)
  $("wiz-photo-file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.photoName = f.name;
    $("wiz-photo").classList.add("done");
    $("wiz-photo").querySelector(".upload-sub").textContent = f.name + " attached ✓";
    checkUploads();
  });
  $("wiz-video-file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.videoName = f.name;
    $("wiz-video").classList.add("done");
    $("wiz-video").querySelector(".upload-sub").textContent = f.name + " attached ✓";
    checkUploads();
  });

  $("wiz-back-2").addEventListener("click", () => goto(0));
  $("wiz-next-2").addEventListener("click", () => goto(2));

  // payout details
  $("wiz-x").addEventListener("input", checkFields);
  $("wiz-wallet").addEventListener("input", checkFields);
  $("wiz-back-3").addEventListener("click", () => goto(1));
  $("wiz-next-3").addEventListener("click", () => {
    // fill review
    $("rv-bounty").textContent = state.title;
    $("rv-reward").textContent = state.pay;
    $("rv-photo").textContent = state.photoName + " ✓";
    $("rv-video").textContent = state.videoName + " ✓";
    $("rv-x").textContent = $("wiz-x").value.trim();
    $("rv-wallet").textContent = $("wiz-wallet").value.trim();
    goto(3);
  });

  $("wiz-back-4").addEventListener("click", () => goto(2));
  $("wiz-confirm").addEventListener("click", () => {
    const ref = jcRef();
    JCStore.add({
      id: ref,
      kind: "bounty",
      title: state.title,
      detail: state.pay + " on verify",
      handle: $("wiz-x").value.trim(),
      wallet: $("wiz-wallet").value.trim(),
      files: [state.photoName, state.videoName],
      ts: Date.now(),
      status: "waiting",
    });
    $("wiz-refid").textContent = "Submission ref: " + ref;
    goto(4);
  });

  $("wiz-done").addEventListener("click", close);
})();

/* ------------------------------------------------------------
   7.5 WORK FLOOR — live submission board (work.html)
------------------------------------------------------------ */
(function workFloor() {
  const feed = document.getElementById("floor-feed");
  if (!feed) return;

  const $ = (id) => document.getElementById(id);
  let kind = "post";
  let fileName = "";

  const labels = {
    post: { tag: "Post", pillClass: "" },
    bag: { tag: "Bag work", pillClass: "" },
    bounty: { tag: "Bounty", pillClass: "" },
  };
  const statuses = {
    waiting: { text: "Waiting for approval", cls: "pill-wait" },
    approved: { text: "Approved", cls: "pill-approved" },
    paid: { text: "Paid", cls: "pill-paid" },
  };

  function render() {
    const subs = JCStore.all();
    $("floor-count").textContent = subs.length;
    $("floor-waiting").textContent = subs.filter((s) => s.status === "waiting").length;
    $("floor-paid").textContent = subs.filter((s) => s.status === "paid").length;

    if (!subs.length) {
      feed.innerHTML =
        '<div class="feed-empty"><b>The floor is empty.</b>' +
        "<span>Nothing posted yet — the first submission on the board could be yours.</span></div>";
      return;
    }

    feed.innerHTML = subs
      .map((s) => {
        const st = statuses[s.status] || statuses.waiting;
        const isLink = /^https?:\/\//i.test(s.title);
        const title = isLink
          ? `<a href="${s.title}" target="_blank" rel="noopener">${s.title}</a>`
          : s.title;
        const files = s.files && s.files.length
          ? `<span>${s.files.filter(Boolean).join(" · ")}</span>`
          : "";
        return (
          `<div class="feed-item">
            <div class="feed-main">
              <div class="feed-top"><span class="tag tag-live">${labels[s.kind].tag}</span><b class="feed-title">${title}</b></div>
              <div class="feed-meta">
                <span>${s.handle}</span>
                <span>${jcShortWallet(s.wallet)}</span>
                ${files}
                <span>${jcTimeAgo(s.ts)}</span>
              </div>
            </div>
            <span class="pill ${st.cls}">${st.text}</span>
          </div>`
        );
      })
      .join("");
  }

  function checkForm() {
    const handle = $("floor-x").value.trim();
    const wallet = $("floor-wallet").value.trim();
    const work = kind === "post" ? $("floor-link").value.trim() : fileName;
    $("floor-submit").disabled = !(handle && wallet && work);
  }

  // segmented control
  document.querySelectorAll(".seg button").forEach((btn) => {
    btn.addEventListener("click", () => {
      kind = btn.dataset.kind;
      document.querySelectorAll(".seg button").forEach((b) => b.classList.toggle("on", b === btn));
      $("floor-link-field").style.display = kind === "post" ? "" : "none";
      $("floor-file-field").style.display = kind === "bag" ? "" : "none";
      checkForm();
    });
  });

  $("floor-file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    fileName = f.name;
    $("floor-upload").classList.add("done");
    $("floor-upload").querySelector(".upload-sub").textContent = f.name + " attached ✓";
    checkForm();
  });

  ["floor-link", "floor-x", "floor-wallet"].forEach((id) =>
    $(id).addEventListener("input", checkForm)
  );

  $("floor-submit").addEventListener("click", () => {
    JCStore.add({
      id: jcRef(),
      kind,
      title: kind === "post" ? $("floor-link").value.trim() : "Bag work — screenshot submitted",
      detail: "",
      handle: $("floor-x").value.trim(),
      wallet: $("floor-wallet").value.trim(),
      files: kind === "bag" ? [fileName] : [],
      ts: Date.now(),
      status: "waiting",
    });

    // reset
    $("floor-link").value = "";
    $("floor-x").value = "";
    $("floor-wallet").value = "";
    $("floor-file").value = "";
    fileName = "";
    $("floor-upload").classList.remove("done");
    $("floor-upload").querySelector(".upload-sub").textContent = "JPG or PNG — tap to attach";
    $("floor-submit").disabled = true;

    render();

    // toast confirmation
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toast-text");
    toastText.textContent = "Posted to the floor — waiting for approval";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  });

  render();
})();

/* ------------------------------------------------------------
   7.6 CA PILL — click to copy the contract address
------------------------------------------------------------ */
(function caPill() {
  document.querySelectorAll(".ca-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const ca = pill.querySelector("strong").textContent.trim();
      navigator.clipboard.writeText(ca).then(() => {
        const toast = document.getElementById("toast");
        const toastText = document.getElementById("toast-text");
        toastText.textContent = "Contract address copied";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
      });
    });
  });
})();

/* ------------------------------------------------------------
   8. MOCK ACTIONS — toast for not-yet-wired functionality
------------------------------------------------------------ */
(function mocks() {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toast-text");
  let timer;

  const messages = {
    robinhood: "Robinhood integration coming soon — UI preview only",
    app: "App launching soon — stay tuned",
    claim: "Bounty claiming opens with the app launch",
    apply: "Applications open soon",
    careers: "Full careers board coming soon",
    bounties: "Full bounty board coming soon",
    recruit: "Bag worker signups open soon",
    doc: "Docs are being written — coming soon",
    community: "Community links dropping soon",
    social: "Socials launching with the app",
  };

  document.querySelectorAll("[data-mock]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const key = el.dataset.mock;
      toastText.textContent = messages[key] || "Coming soon";
      toast.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove("show"), 2600);
    });
  });
})();
