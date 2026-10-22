/* Orange Handmade Slippers: shared site behaviour.
   No payment gateway: orders are collected here and sent to the shop on WhatsApp. */
(function () {
  const S = window.SHOP;
  const P = window.PRODUCTS;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const page = document.body.dataset.page || "";
  let io; // scroll-reveal observer, created on first use
  if ("IntersectionObserver" in window) document.documentElement.classList.add("js-reveal");

  const rs = (n) => "Rs " + Number(n).toLocaleString("en-IN");
  const byId = (id) => P.find((p) => p.id === id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const waLink = (text) => `https://wa.me/${S.phone}?text=${encodeURIComponent(text)}`;

  const icon = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3 15.5a1.5 1.5 0 0 1 2.4-1.8L8 16"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16L16 3l5 5L8 21z"/><path d="M7 12l2 2M10 9l2 2M13 6l2 2"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM4 9a3 3 0 0 0 5.3 1.9A3 3 0 0 0 12 12a3 3 0 0 0 2.7-1.1A3 3 0 0 0 20 9"/><path d="M10 20v-5h4v5"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7 7 0 0 1-3.9-1.2v6.2a5.8 5.8 0 1 1-5-5.7v3.1a2.7 2.7 0 1 0 1.9 2.6V3h3.1z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  };
  window.ICON = icon;

  /* ---------- Header, menu, footer ---------- */
  const NAV = [
    ["shop.html", "Shop all"],
    ["shop.html?c=festive", "Wedding & festive"],
    ["shop.html?c=kids", "Kids"],
    ["story.html", "Our story"],
    ["training.html", "Training"],
    ["wholesale.html", "Wholesale"],
  ];
  const here = location.pathname.split("/").pop() + location.search;

  function header() {
    const notes = [
      "Delivery all over Nepal",
      "Wholesale and retail",
      "Featured on Routine of Nepal Banda and Setopati",
      `Order on WhatsApp ${S.phoneDisplay}`,
      "Every pair cut, glued and stitched by hand",
      "Slipper-making training for women",
    ];
    const track = [...notes, ...notes].map((n) => `<span>${n}</span>`).join("");
    const links = NAV.map(([h, t]) => `<a href="${h}"${here === h || (h === "shop.html" && here === "shop.html?c=all") ? ' aria-current="page"' : ""}>${t}</a>`).join("");
    return `
      <a class="skip" href="#main">Skip to content</a>
      <div class="announce" aria-label="Shop notes"><div class="announce-track">${track}</div></div>
      <header class="header">
        <div class="wrap header-inner">
          <a class="brand" href="index.html" aria-label="${S.name} home">
            <img src="images/logo.jpg" alt="" width="46" height="46">
            <span class="brand-name">Orange<small>Handmade slippers</small></span>
          </a>
          <nav class="nav" aria-label="Main">${links}</nav>
          <div class="header-actions">
            <a class="icon-btn" href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
            <button class="icon-btn" type="button" data-open-bag aria-label="Open bag">${icon.bag}<span class="bag-count" hidden>0</span></button>
            <button class="icon-btn menu-btn" type="button" data-open-menu aria-label="Open menu">${icon.menu}</button>
          </div>
        </div>
      </header>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
        <div class="mobile-menu-top">
          <a class="brand" href="index.html"><img src="images/logo.jpg" alt="" width="46" height="46"><span class="brand-name">Orange<small>Handmade slippers</small></span></a>
          <button class="icon-btn" type="button" data-close-menu aria-label="Close menu">${icon.close}</button>
        </div>
        <nav aria-label="Mobile">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}<a href="faq.html">Help & FAQ</a></nav>
        <div class="contact-mini">
          <p>Call or WhatsApp <a href="tel:+${S.phone}"><b>${S.phoneDisplay}</b></a><br>Delivery all over Nepal</p>
          <div class="socials" style="margin-top:12px">
            <a href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
            <a href="${S.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon.fb}</a>
            <a href="${S.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${icon.tt}</a>
          </div>
        </div>
      </div>`;
  }

  function footer() {
    return `
      <footer class="footer">
        <div class="wrap">
          <div class="footer-top">
            <div>
              <a class="brand" href="index.html"><img src="images/logo.jpg" alt="" width="46" height="46"><span class="brand-name">Orange<small>Handmade slippers</small></span></a>
              <p class="footer-blurb">Velvet, zari and everyday slippers, handmade in Nepal by Sushma Shrestha and her team. Delivered all over Nepal.</p>
              <div class="socials">
                <a href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
                <a href="${S.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon.fb}</a>
                <a href="${S.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${icon.tt}</a>
                <a href="${waLink("Namaste! I have a question about your slippers.")}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon.wa}</a>
              </div>
            </div>
            <div>
              <h4>Shop</h4>
              <ul>
                <li><a href="shop.html">All slippers</a></li>
                <li><a href="shop.html?c=festive">Wedding & festive</a></li>
                <li><a href="shop.html?c=everyday">Everyday</a></li>
                <li><a href="shop.html?c=kids">Kids</a></li>
                <li><a href="wholesale.html">Wholesale</a></li>
              </ul>
            </div>
            <div>
              <h4>About</h4>
              <ul>
                <li><a href="story.html">Our story</a></li>
                <li><a href="story.html#press">In the news</a></li>
                <li><a href="training.html">Training</a></li>
                <li><a href="size-guide.html">Size guide</a></li>
                <li><a href="faq.html">Help & FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>Talk to us</h4>
              <ul>
                <li><a href="tel:+${S.phone}">Call ${S.phoneDisplay}</a></li>
                <li><a href="${waLink("Namaste! I have a question about your slippers.")}" target="_blank" rel="noopener">WhatsApp us</a></li>
                <li><a href="${S.messenger}" target="_blank" rel="noopener">Facebook Messenger</a></li>
                <li>${S.location}, Nepal</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} ${S.name} · Orange Handicraft Industry (अरेन्ज हस्तकला उद्योग)</span>
            <span>हातैले बनाइएको, माया सहित · Made by hand, with love</span>
          </div>
        </div>
      </footer>
      <a class="float-wa" href="${waLink("Namaste! I'd like to know more about your slippers.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon.wa}</a>
      <div class="overlay" data-overlay></div>
      <aside class="drawer" id="bag" aria-label="Your bag" aria-hidden="true">
        <div class="drawer-head"><h2>Your bag</h2><button class="icon-btn" type="button" data-close-bag aria-label="Close bag">${icon.close}</button></div>
        <div class="drawer-body" data-bag-body></div>
        <div class="drawer-foot" data-bag-foot></div>
      </aside>
      <div class="toast" role="status" aria-live="polite" data-toast></div>`;
  }

  const headerSlot = $("#site-header");
  const footerSlot = $("#site-footer");
  if (headerSlot) headerSlot.outerHTML = header();
  if (footerSlot) footerSlot.outerHTML = footer();

  const menu = $("#mobile-menu");
  const overlay = $("[data-overlay]");
  const bag = $("#bag");

  function lockScroll(on) { document.body.style.overflow = on ? "hidden" : ""; }
  function openMenu() { menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); lockScroll(true); }
  function closeMenu() { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); lockScroll(false); }
  function openBag() { renderBag(); bag.classList.add("open"); overlay.classList.add("show"); bag.setAttribute("aria-hidden", "false"); lockScroll(true); }
  function closeBag() { bag.classList.remove("open"); overlay.classList.remove("show"); bag.setAttribute("aria-hidden", "true"); lockScroll(false); }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open-menu],[data-close-menu],[data-open-bag],[data-close-bag],[data-overlay]");
    if (!t) return;
    if (t.matches("[data-open-menu]")) openMenu();
    else if (t.matches("[data-close-menu]")) closeMenu();
    else if (t.matches("[data-open-bag]")) { closeMenu(); openBag(); }
    else closeBag();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeBag(); closeMenu(); } });

  /* ---------- Bag (saved in this browser) ---------- */
  const KEY = "ohs-bag";
  function readBag() {
    try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter((l) => byId(l.id)); } catch { return []; }
  }
  function writeBag(lines) {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode: bag lasts for this page only */ }
    memoryBag = lines;
    updateCount();
  }
  let memoryBag = readBag();
  const getBag = () => memoryBag;
  const bagTotal = (lines) => lines.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
  const bagCount = (lines) => lines.reduce((s, l) => s + l.qty, 0);

  function addToBag(id, size, color, qty = 1) {
    const lines = [...getBag()];
    const found = lines.find((l) => l.id === id && l.size === size && l.color === color);
    if (found) found.qty = Math.min(found.qty + qty, 50);
    else lines.push({ id, size, color, qty });
    writeBag(lines);
  }
  function setQty(i, qty) {
    const lines = [...getBag()];
    if (qty <= 0) lines.splice(i, 1);
    else lines[i] = { ...lines[i], qty: Math.min(qty, 50) };
    writeBag(lines);
  }
  function updateCount() {
    const n = bagCount(getBag());
    $$(".bag-count").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  }
  updateCount();

  function lineHTML(l, i, editable = true) {
    const p = byId(l.id);
    return `
      <div class="line-item">
        <img src="${p.images[0]}" alt="">
        <div>
          <h4><a href="product.html?id=${p.id}" style="text-decoration:none">${esc(p.name)}</a></h4>
          <div class="meta">${esc(l.color)} · Size ${esc(l.size)}${editable ? "" : ` · Qty ${l.qty}`}</div>
          ${editable ? `<div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="One less">−</button><input type="number" value="${l.qty}" min="1" max="50" data-qi="${i}" aria-label="Quantity"><button type="button" data-q="${i}" data-d="1" aria-label="One more">+</button></div>
          <button class="remove" type="button" data-rm="${i}">Remove</button>` : ""}
        </div>
        <div class="price">${rs(p.price * l.qty)}</div>
      </div>`;
  }

  function renderBag() {
    const lines = getBag();
    const body = $("[data-bag-body]");
    const foot = $("[data-bag-foot]");
    if (!lines.length) {
      body.innerHTML = `<div class="drawer-empty">${icon.bag}<p>Your bag is empty.</p><a class="btn btn-dark" href="shop.html">Browse slippers</a></div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = lines.map((l, i) => lineHTML(l, i)).join("");
    foot.innerHTML = `
      <div class="total-row"><span>Subtotal</span><span>${rs(bagTotal(lines))}</span></div>
      <p class="small-note">Delivery charge depends on your location; we confirm it with you before sending.</p>
      <a class="btn btn-primary btn-block" href="checkout.html">Place order</a>`;
  }

  bag.addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]");
    const rm = e.target.closest("[data-rm]");
    if (q) { const i = +q.dataset.q; setQty(i, getBag()[i].qty + +q.dataset.d); renderBag(); }
    if (rm) { setQty(+rm.dataset.rm, 0); renderBag(); }
  });
  bag.addEventListener("change", (e) => {
    if (e.target.matches("[data-qi]")) { setQty(+e.target.dataset.qi, parseInt(e.target.value, 10) || 0); renderBag(); }
  });

  let toastTimer;
  function toast(html) {
    const t = $("[data-toast]");
    t.innerHTML = html;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3600);
  }
  document.addEventListener("click", (e) => { if (e.target.matches("[data-toast-bag]")) { $("[data-toast]").classList.remove("show"); openBag(); } });

  /* ---------- Product cards ---------- */
  function card(p) {
    const tag = p.tag ? `<span class="tag ${p.tag.kind}">${esc(p.tag.text)}</span>` : "";
    const alt = p.images[1] ? `<img class="alt" src="${p.images[1]}" alt="" loading="lazy">` : "";
    return `
      <article class="card reveal">
        <div style="position:relative">
          <a class="card-media" href="product.html?id=${p.id}">
            <img src="${p.images[0]}" alt="${esc(p.name)}" loading="lazy">${alt}${tag}
          </a>
          <button class="quick-add" type="button" data-quick="${p.id}" aria-label="Choose size for ${esc(p.name)}">${icon.plus}</button>
        </div>
        <div class="card-body">
          <div><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3><div class="sub">${esc(p.for)} · <span class="deva">${esc(p.nepali)}</span></div></div>
          <div class="price">${rs(p.price)}</div>
        </div>
        <div class="swatches">${p.colors.map((c) => `<span class="swatch-dot" style="background:${c.hex}" title="${esc(c.name)}"></span>`).join("")}</div>
      </article>`;
  }
  window.renderCards = (el, list) => { el.innerHTML = list.map(card).join(""); observe(); };
  // Quick add needs a size, so it opens the product page at the size picker.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-quick]");
    if (b) location.href = `product.html?id=${b.dataset.quick}#choose`;
  });

  $$("[data-products]").forEach((el) => {
    const ids = el.dataset.products.split(",").map((s) => s.trim()).filter(Boolean);
    window.renderCards(el, ids.length ? ids.map(byId).filter(Boolean) : P);
  });

  /* ---------- Shop page ---------- */
  if (page === "shop") {
    const params = new URLSearchParams(location.search);
    let cat = params.get("c") || "all";
    let sort = "featured";
    let q = "";
    const grid = $("#shop-grid");
    const title = $("#shop-title");
    const blurb = $("#shop-blurb");
    const count = $("#shop-count");
    const chips = $$("[data-cat]");

    function draw() {
      let list = P.filter((p) => cat === "all" || p.category === cat);
      if (q) list = list.filter((p) => (p.name + " " + p.nepali + " " + p.short + " " + p.for).toLowerCase().includes(q));
      if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
      if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === cat)));
      const meta = window.CATEGORIES[cat];
      title.textContent = meta ? meta.name : "All slippers";
      blurb.textContent = meta ? meta.blurb : "Every pair is cut, glued and stitched by hand in our small workshop in Nepal.";
      count.textContent = `${list.length} ${list.length === 1 ? "style" : "styles"}`;
      if (list.length) window.renderCards(grid, list);
      else grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><p>No slippers match that search.</p><p>Looking for something special? <a href="${waLink("Namaste! I'm looking for a slipper design: ")}" target="_blank" rel="noopener">Ask us on WhatsApp</a>. We make custom designs too.</p></div>`;
    }
    chips.forEach((c) => c.addEventListener("click", () => {
      cat = c.dataset.cat;
      history.replaceState(null, "", cat === "all" ? "shop.html" : `shop.html?c=${cat}`);
      draw();
    }));
    $("#shop-sort").addEventListener("change", (e) => { sort = e.target.value; draw(); });
    $("#shop-search").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
    draw();
  }

  /* ---------- Product page ---------- */
  if (page === "product") {
    const id = new URLSearchParams(location.search).get("id");
    const p = byId(id);
    const root = $("#pdp");
    if (!p) {
      root.innerHTML = `<div class="empty" style="grid-column:1/-1"><h2>We couldn't find that pair.</h2><p><a class="btn btn-dark" href="shop.html">Back to the shop</a></p></div>`;
    } else {
      document.title = `${p.name} · ${S.name}`;
      $("#crumb-name").textContent = p.name;
      const cat = window.CATEGORIES[p.category];
      $("#crumb-cat").innerHTML = `<a href="shop.html?c=${p.category}">${cat.name}</a>`;
      let img = 0;
      let color = p.colors[0].name;
      let size = null;
      root.innerHTML = `
        <div class="gallery">
          <div class="thumbs">${p.images.map((src, i) => `<button type="button" data-img="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="${src}" alt=""></button>`).join("")}</div>
          <div class="main-img"><img id="main-img" src="${p.images[0]}" alt="${esc(p.name)}"><span class="img-count" id="img-count">1 / ${p.images.length}</span></div>
        </div>
        <div class="pdp-info">
          <span class="eyebrow">${p.for === "Kids" ? "" : esc(p.for) + " · "}${esc(cat.name)}</span>
          <h1>${esc(p.name)}</h1>
          <div class="deva" style="color:var(--blue);font-size:18px;margin:-4px 0 12px">${esc(p.nepali)}</div>
          <div class="pdp-price">${rs(p.price)} <small>per pair · delivery extra</small></div>
          <p class="pdp-desc">${esc(p.description)}</p>
          <div class="opt">
            <div class="opt-label">Colour <span class="val" id="color-val">${esc(color)}</span></div>
            <div class="colors">${p.colors.map((c, i) => `<button type="button" class="color-btn" style="background:${c.hex}" data-color="${esc(c.name)}" aria-pressed="${i === 0}" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join("")}</div>
          </div>
          <div class="opt" id="choose">
            <div class="opt-label">Size ${p.category === "kids" ? "(by age)" : "(EU)"} <a href="size-guide.html">Size guide</a></div>
            <div class="sizes">${p.sizes.map((s) => `<button type="button" class="size-btn" data-size="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join("")}</div>
          </div>
          <div class="form-msg" id="pdp-msg" role="alert"></div>
          <div class="buy-row">
            <div class="qty"><button type="button" data-step="-1" aria-label="One less">−</button><input id="pdp-qty" type="number" value="1" min="1" max="50" aria-label="Quantity"><button type="button" data-step="1" aria-label="One more">+</button></div>
            <button class="btn btn-primary" type="button" id="add-btn">${icon.bag} Add to bag</button>
          </div>
          <a class="btn btn-wa btn-block" id="wa-btn" href="#" target="_blank" rel="noopener">${icon.wa} Ask about this pair on WhatsApp</a>
          <div class="note-box">${icon.ruler}<div><b>Between sizes or wide feet?</b> We can make your pair to your foot measurement. Send us your foot length in the order notes or on WhatsApp.</div></div>
          <ul class="perks">
            <li>${icon.hand} Cut, glued and stitched by hand in Nepal</li>
            <li>${icon.truck} Delivery all over Nepal; we confirm the charge before sending</li>
            <li>${icon.store} Buying for a shop or a wedding party? <a href="wholesale.html">Ask for wholesale prices</a></li>
          </ul>
          <div class="accordion">
            <details open><summary>Details</summary><div class="acc-body"><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div></details>
            <details><summary>Care</summary><div class="acc-body">Brush velvet gently with a soft dry cloth or clothes brush. Keep zari and stonework away from water and perfume. Wipe straps with a slightly damp cloth and let them dry in the shade. Store in the cloth bag they come in.</div></details>
            <details><summary>Delivery</summary><div class="acc-body">We deliver all over Nepal through our courier partner. After you place an order we message you to confirm your size, the delivery charge for your area and when it will reach you. Ordering from abroad? Message us and we'll see what we can do. Our slippers have already travelled to Japan, Korea, Dubai, Australia and Croatia.</div></details>
            <details><summary>Exchanges and returns</summary><div class="acc-body">Because every pair is made by hand, often to order, we don't accept returns or exchanges. Please check the <a href="size-guide.html">size guide</a> and message us if you're unsure. We're happy to help you choose before you buy.</div></details>
          </div>
        </div>`;

      const updateWa = () => {
        $("#wa-btn").href = waLink(`Namaste! I'm interested in the ${p.name} (${rs(p.price)}), colour: ${color}${size ? `, size: ${size}` : ""}. Is it available?`);
      };
      updateWa();
      root.addEventListener("click", (e) => {
        const t = e.target.closest("[data-img],[data-color],[data-size],[data-step]");
        if (!t) return;
        if (t.dataset.img !== undefined) {
          img = +t.dataset.img;
          $("#main-img").src = p.images[img];
          $("#img-count").textContent = `${img + 1} / ${p.images.length}`;
          $$("[data-img]", root).forEach((b) => b.setAttribute("aria-current", String(b === t)));
        } else if (t.dataset.color !== undefined) {
          color = t.dataset.color;
          $("#color-val").textContent = color;
          $$("[data-color]", root).forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
        } else if (t.dataset.size !== undefined) {
          size = t.dataset.size;
          $("#pdp-msg").textContent = "";
          $$("[data-size]", root).forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
        } else if (t.dataset.step !== undefined) {
          const inp = $("#pdp-qty");
          inp.value = Math.max(1, Math.min(50, (parseInt(inp.value, 10) || 1) + +t.dataset.step));
        }
        updateWa();
      });
      $("#add-btn").addEventListener("click", () => {
        if (!size) {
          $("#pdp-msg").textContent = "Please choose a size first.";
          $("#choose").scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        const qty = Math.max(1, Math.min(50, parseInt($("#pdp-qty").value, 10) || 1));
        addToBag(p.id, size, color, qty);
        toast(`Added ${qty > 1 ? qty + " pairs" : "to your bag"}: ${esc(p.name)}, size ${esc(size)} <button type="button" data-toast-bag>View bag</button>`);
      });

      const related = P.filter((x) => x.id !== p.id).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3);
      window.renderCards($("#related"), related);
    }
  }

  /* ---------- Checkout ---------- */
  if (page === "checkout") {
    const lines = getBag();
    const list = $("#summary-lines");
    const formWrap = $("#checkout-form-wrap");
    if (!lines.length) {
      $("#checkout").innerHTML = `<div class="empty" style="grid-column:1/-1">${icon.bag.replace("<svg", '<svg style="width:56px;height:56px;margin:0 auto 12px;color:var(--orange)"')}<h2>Your bag is empty</h2><p>Pick a pair you love, then come back here to place your order.</p><a class="btn btn-dark" href="shop.html">Browse slippers</a></div>`;
    } else {
      list.innerHTML = lines.map((l, i) => lineHTML(l, i, false)).join("");
      $("#sum-subtotal").textContent = rs(bagTotal(lines));
      $("#sum-total").textContent = rs(bagTotal(lines));
      $("#sum-count").textContent = `${bagCount(lines)} ${bagCount(lines) === 1 ? "pair" : "pairs"}`;

      const form = $("#checkout-form");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validate(form)) return;
        const d = Object.fromEntries(new FormData(form));
        const ref = "OHS-" + Date.now().toString(36).toUpperCase().slice(-6);
        const itemsText = lines.map((l) => { const p = byId(l.id); return `• ${p.name}, ${l.color}, size ${l.size} × ${l.qty} = ${rs(p.price * l.qty)}`; }).join("\n");
        const msg = [
          `Namaste! New order ${ref}`,
          "",
          itemsText,
          "",
          `Subtotal: ${rs(bagTotal(lines))} (+ delivery)`,
          "",
          `Name: ${d.name}`,
          `Phone: ${d.phone}`,
          `Address: ${d.address}, ${d.city}, ${d.district}`,
          d.landmark ? `Landmark: ${d.landmark}` : null,
          `Contact me on: ${d.contact}`,
          d.notes ? `Notes: ${d.notes}` : null,
        ].filter((x) => x !== null).join("\n");
        try { localStorage.setItem("ohs-last-order", JSON.stringify({ ref, msg })); } catch { /* fine */ }
        writeBag([]);
        formWrap.innerHTML = `
          <div class="success">
            <div class="tick">${icon.check}</div>
            <h2>One last step: send it to us</h2>
            <p class="lead" style="margin:14px auto">Your order <span class="order-ref">${ref}</span> is ready. Tap the button below to send it to us on WhatsApp. We'll reply to confirm your size, the delivery charge and payment.</p>
            <div class="actions">
              <a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener">${icon.wa} Send order on WhatsApp</a>
              <button class="btn btn-ghost" type="button" id="copy-order">Copy order text</button>
              <a class="btn btn-ghost" href="${S.messenger}" target="_blank" rel="noopener">Open Facebook Messenger</a>
              <a class="btn btn-ghost" href="tel:+${S.phone}">${icon.phone} Call ${S.phoneDisplay}</a>
            </div>
            <p class="small-note" style="margin-top:18px">No WhatsApp? Copy the order text and paste it into Messenger or Viber, or just call us.</p>
          </div>`;
        $("#checkout-aside").style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
        $("#copy-order").addEventListener("click", async (ev) => {
          try { await navigator.clipboard.writeText(msg); ev.target.textContent = "Copied"; } catch { ev.target.textContent = "Couldn't copy, please send on WhatsApp"; }
        });
      });
    }
  }

  /* ---------- Simple enquiry forms (training, wholesale, contact) ---------- */
  function validate(form) {
    let ok = true;
    $$("[required]", form).forEach((inp) => {
      const field = inp.closest(".field");
      let bad = !inp.value.trim();
      if (!bad && inp.type === "tel") bad = inp.value.replace(/\D/g, "").length < 9;
      if (field) field.classList.toggle("invalid", bad);
      if (bad && ok) inp.focus();
      if (bad) ok = false;
    });
    return ok;
  }
  $$("form[data-wa-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(form)) return;
      const d = new FormData(form);
      const lines = [form.dataset.waForm, ""];
      for (const [k, v] of d.entries()) if (String(v).trim()) lines.push(`${k}: ${v}`);
      window.open(waLink(lines.join("\n")), "_blank", "noopener");
      const done = form.querySelector("[data-done]");
      if (done) done.hidden = false;
    });
  });
  document.addEventListener("input", (e) => { const f = e.target.closest(".field.invalid"); if (f && e.target.value.trim()) f.classList.remove("invalid"); });

  /* ---------- District picker ---------- */
  const DISTRICTS = "Achham,Arghakhanchi,Baglung,Baitadi,Bajhang,Bajura,Banke,Bara,Bardiya,Bhaktapur,Bhojpur,Chitwan,Dadeldhura,Dailekh,Dang,Darchula,Dhading,Dhankuta,Dhanusha,Dolakha,Dolpa,Doti,Gorkha,Gulmi,Humla,Ilam,Jajarkot,Jhapa,Jumla,Kailali,Kalikot,Kanchanpur,Kapilvastu,Kaski,Kathmandu,Kavrepalanchok,Khotang,Lalitpur,Lamjung,Mahottari,Makwanpur,Manang,Morang,Mugu,Mustang,Myagdi,Nawalparasi East,Nawalparasi West,Nuwakot,Okhaldhunga,Palpa,Panchthar,Parbat,Parsa,Pyuthan,Ramechhap,Rasuwa,Rautahat,Rolpa,Rukum East,Rukum West,Rupandehi,Salyan,Sankhuwasabha,Saptari,Sarlahi,Sindhuli,Sindhupalchok,Siraha,Solukhumbu,Sunsari,Surkhet,Syangja,Tanahun,Taplejung,Terhathum,Udayapur".split(",");
  $$("[data-districts]").forEach((sel) => {
    sel.insertAdjacentHTML("beforeend", DISTRICTS.map((d) => `<option>${d}</option>`).join("") + "<option>Outside Nepal</option>");
  });

  /* ---------- WhatsApp links with prefilled text ---------- */
  $$("[data-wa]").forEach((a) => { a.href = waLink(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-tel]").forEach((a) => { a.href = `tel:+${S.phone}`; });

  /* ---------- Reveal on scroll ---------- */
  function observe() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("in")); return; }
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal:not(.in)").forEach((el) => io.observe(el));
  }
  observe();
})();
