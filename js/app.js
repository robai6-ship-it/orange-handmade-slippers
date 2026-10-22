/* Orange Handmade Slippers: shared site behaviour.
   No payment gateway: orders are collected here and sent to the shop on WhatsApp.

   Languages: English and Nepali. Text written by this script uses t("English", "नेपाली").
   Text in the HTML pages carries its Nepali version in a data-ne="..." attribute
   (data-ne-ph for placeholders, data-ne-wa for WhatsApp messages). */
(function () {
  const S = window.SHOP;
  const P = window.PRODUCTS;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const page = document.body.dataset.page || "";
  let io; // scroll-reveal observer, created on first use
  if ("IntersectionObserver" in window) document.documentElement.classList.add("js-reveal");

  /* ---------- Language ---------- */
  const LANG = (() => {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "ne" || q === "en") { try { localStorage.setItem("ohs-lang", q); } catch { /* fine */ } return q; }
    try { return localStorage.getItem("ohs-lang") === "ne" ? "ne" : "en"; } catch { return "en"; }
  })();
  const NE = LANG === "ne";
  document.documentElement.lang = NE ? "ne" : "en";
  const t = (en, ne) => (NE ? ne : en);
  const DEVA = "०१२३४५६७८९";
  const num = (v) => (NE ? String(v).replace(/[0-9]/g, (d) => DEVA[d]) : String(v));

  function setLang(next) {
    try { localStorage.setItem("ohs-lang", next); } catch { /* fine */ }
    const url = new URL(location.href);
    if (url.searchParams.has("lang")) url.searchParams.set("lang", next);
    location.replace(url.toString());
  }

  // Product and colour text in the current language
  const pName = (p) => (NE ? p.ne.name : p.name);
  const pFor = (p) => (NE ? p.ne.for : p.for);
  const pDesc = (p) => (NE ? p.ne.description : p.description);
  const pDetails = (p) => (NE ? p.ne.details : p.details);
  const pTag = (p) => (p.tag ? (NE ? p.ne.tag || p.tag.text : p.tag.text) : "");
  const colorLabel = (p, name) => { const c = p.colors.find((x) => x.name === name); return NE && c ? c.ne : name; };
  const sizeLabel = (s) => (NE ? num(s.replace(" yrs", " वर्ष")) : s);
  const catOf = (key) => { const c = window.CATEGORIES[key]; return c ? (NE ? c.ne : c) : null; };

  const rs = (n) => (NE ? "रु " + num(Number(n).toLocaleString("en-IN")) : "Rs " + Number(n).toLocaleString("en-IN"));
  const byId = (id) => P.find((p) => p.id === id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const waLink = (text) => `https://wa.me/${S.phone}?text=${encodeURIComponent(text)}`;
  const HELLO = t("Namaste! I have a question about your slippers.", "नमस्ते! मलाई तपाईंको चप्पलबारे केही सोध्नु छ।");

  const icon = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3 15.5a1.5 1.5 0 0 1 2.4-1.8L8 16"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16L16 3l5 5L8 21z"/><path d="M7 12l2 2M10 9l2 2M13 6l2 2"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM4 9a3 3 0 0 0 5.3 1.9A3 3 0 0 0 12 12a3 3 0 0 0 2.7-1.1A3 3 0 0 0 20 9"/><path d="M10 20v-5h4v5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7 7 0 0 1-3.9-1.2v6.2a5.8 5.8 0 1 1-5-5.7v3.1a2.7 2.7 0 1 0 1.9 2.6V3h3.1z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  };

  /* ---------- Header, menu, footer ---------- */
  const NAV = [
    ["shop.html", t("Shop all", "सबै चप्पल")],
    ["shop.html?c=festive", t("Wedding & festive", "बिहे र चाडपर्व")],
    ["shop.html?c=kids", t("Kids", "बालबालिका")],
    ["story.html", t("Our story", "हाम्रो कथा")],
    ["training.html", t("Training", "तालिम")],
    ["wholesale.html", t("Wholesale", "होलसेल")],
  ];
  const here = location.pathname.split("/").pop() + location.search.replace(/[?&]lang=\w+/, "");
  const brandHTML = t('Orange<small>Handmade slippers</small>', 'अरेन्ज<small>हातैले बनाइएको चप्पल</small>');
  const langBtn = (extra = "") => `<button class="lang-btn ${extra}" type="button" data-lang-toggle lang="${NE ? "en" : "ne"}" aria-label="${t("नेपालीमा हेर्नुहोस् (View in Nepali)", "View in English (अंग्रेजीमा हेर्नुहोस्)")}">${icon.globe}<span>${NE ? "English" : "नेपाली"}</span></button>`;

  function header() {
    const notes = [
      t("Delivery all over Nepal", "नेपालभर डेलिभरी"),
      t("Wholesale and retail", "होलसेल र खुद्रा"),
      t("Featured on Routine of Nepal Banda and Setopati", "रुटिन अफ नेपाल बन्द र सेतोपाटीमा प्रकाशित"),
      t(`Order on WhatsApp ${S.phoneDisplay}`, `ह्वाट्सएपमा अर्डर गर्नुहोस् ${S.phoneDisplay}`),
      t("Every pair cut, glued and stitched by hand", "हरेक जोर हातैले काटिएको, टाँसिएको र सिलाइएको"),
      t("Slipper-making training for women", "महिलाका लागि चप्पल बनाउने तालिम"),
    ];
    const track = [...notes, ...notes].map((n) => `<span>${n}</span>`).join("");
    const links = NAV.map(([h, label]) => `<a href="${h}"${here === h ? ' aria-current="page"' : ""}>${label}</a>`).join("");
    return `
      <a class="skip" href="#main">${t("Skip to content", "मुख्य भागमा जानुहोस्")}</a>
      <div class="announce" aria-label="${t("Shop notes", "पसलका सूचना")}"><div class="announce-track">${track}</div></div>
      <header class="header">
        <div class="wrap header-inner">
          <a class="brand" href="index.html" aria-label="${t(S.name + " home", "गृहपृष्ठ")}">
            <img src="images/logo.jpg" alt="" width="46" height="46">
            <span class="brand-name">${brandHTML}</span>
          </a>
          <nav class="nav" aria-label="${t("Main", "मुख्य")}">${links}</nav>
          <div class="header-actions">
            ${langBtn()}
            <a class="icon-btn hide-sm" href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
            <button class="icon-btn" type="button" data-open-bag aria-label="${t("Open bag", "झोला खोल्नुहोस्")}">${icon.bag}<span class="bag-count" hidden>0</span></button>
            <button class="icon-btn menu-btn" type="button" data-open-menu aria-label="${t("Open menu", "मेनु खोल्नुहोस्")}">${icon.menu}</button>
          </div>
        </div>
      </header>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
        <div class="mobile-menu-top">
          <a class="brand" href="index.html"><img src="images/logo.jpg" alt="" width="46" height="46"><span class="brand-name">${brandHTML}</span></a>
          <button class="icon-btn" type="button" data-close-menu aria-label="${t("Close menu", "मेनु बन्द गर्नुहोस्")}">${icon.close}</button>
        </div>
        <nav aria-label="${t("Mobile", "मोबाइल")}">${NAV.map(([h, label]) => `<a href="${h}">${label}</a>`).join("")}<a href="faq.html">${t("Help & FAQ", "सहायता र प्रश्नोत्तर")}</a></nav>
        <div class="contact-mini">
          ${langBtn("lang-btn-lg")}
          <p>${t("Call or WhatsApp", "फोन वा ह्वाट्सएप")} <a href="tel:+${S.phone}"><b>${S.phoneDisplay}</b></a><br>${t("Delivery all over Nepal", "नेपालभर डेलिभरी")}</p>
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
              <a class="brand" href="index.html"><img src="images/logo.jpg" alt="" width="46" height="46"><span class="brand-name">${brandHTML}</span></a>
              <p class="footer-blurb">${t("Velvet, zari and everyday slippers, handmade in Nepal by Sushma Shrestha and her team. Delivered all over Nepal.", "सुस्मा श्रेष्ठ र उहाँको टोलीले नेपालमै हातैले बनाएका मखमली, जरी र दैनिक चप्पल। नेपालभर डेलिभरी।")}</p>
              <div class="socials">
                <a href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
                <a href="${S.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon.fb}</a>
                <a href="${S.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${icon.tt}</a>
                <a href="${waLink(HELLO)}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon.wa}</a>
              </div>
            </div>
            <div>
              <h4>${t("Shop", "किनमेल")}</h4>
              <ul>
                <li><a href="shop.html">${t("All slippers", "सबै चप्पल")}</a></li>
                <li><a href="shop.html?c=festive">${t("Wedding & festive", "बिहे र चाडपर्व")}</a></li>
                <li><a href="shop.html?c=everyday">${t("Everyday", "दैनिक")}</a></li>
                <li><a href="shop.html?c=kids">${t("Kids", "बालबालिका")}</a></li>
                <li><a href="wholesale.html">${t("Wholesale", "होलसेल")}</a></li>
              </ul>
            </div>
            <div>
              <h4>${t("About", "हाम्रोबारे")}</h4>
              <ul>
                <li><a href="story.html">${t("Our story", "हाम्रो कथा")}</a></li>
                <li><a href="story.html#press">${t("In the news", "समाचारमा")}</a></li>
                <li><a href="training.html">${t("Training", "तालिम")}</a></li>
                <li><a href="size-guide.html">${t("Size guide", "साइज गाइड")}</a></li>
                <li><a href="faq.html">${t("Help & FAQ", "सहायता र प्रश्नोत्तर")}</a></li>
              </ul>
            </div>
            <div>
              <h4>${t("Talk to us", "हामीसँग कुरा गर्नुहोस्")}</h4>
              <ul>
                <li><a href="tel:+${S.phone}">${t("Call", "फोन")} ${S.phoneDisplay}</a></li>
                <li><a href="${waLink(HELLO)}" target="_blank" rel="noopener">${t("WhatsApp us", "ह्वाट्सएपमा लेख्नुहोस्")}</a></li>
                <li><a href="${S.messenger}" target="_blank" rel="noopener">Facebook Messenger</a></li>
                <li>${t(S.location + ", Nepal", S.location_ne + ", नेपाल")}</li>
                <li>${langBtn("lang-btn-footer")}</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${num(new Date().getFullYear())} ${t(S.name + " · Orange Handicraft Industry (अरेन्ज हस्तकला उद्योग)", "अरेन्ज ह्यान्डमेड स्लिपर्स · अरेन्ज हस्तकला उद्योग")}</span>
            <span>${t("Made by hand, with love · हातैले बनाइएको, माया सहित", "हातैले बनाइएको, माया सहित")}</span>
          </div>
        </div>
      </footer>
      <a class="float-wa" href="${waLink(t("Namaste! I'd like to know more about your slippers.", "नमस्ते! तपाईंको चप्पलबारे थप जान्न चाहन्छु।"))}" target="_blank" rel="noopener" aria-label="${t("Chat on WhatsApp", "ह्वाट्सएपमा कुरा गर्नुहोस्")}">${icon.wa}</a>
      <div class="overlay" data-overlay></div>
      <aside class="drawer" id="bag" aria-label="${t("Your bag", "तपाईंको झोला")}" aria-hidden="true">
        <div class="drawer-head"><h2>${t("Your bag", "तपाईंको झोला")}</h2><button class="icon-btn" type="button" data-close-bag aria-label="${t("Close bag", "झोला बन्द गर्नुहोस्")}">${icon.close}</button></div>
        <div class="drawer-body" data-bag-body></div>
        <div class="drawer-foot" data-bag-foot></div>
      </aside>
      <div class="toast" role="status" aria-live="polite" data-toast></div>`;
  }

  const headerSlot = $("#site-header");
  const footerSlot = $("#site-footer");
  if (headerSlot) headerSlot.outerHTML = header();
  if (footerSlot) footerSlot.outerHTML = footer();

  /* ---------- Translate the page's own text ---------- */
  if (NE) {
    $$("[data-ne]").forEach((el) => { el.innerHTML = el.dataset.ne; });
    $$("[data-ne-ph]").forEach((el) => { el.placeholder = el.dataset.nePh; });
    $$("[data-ne-alt]").forEach((el) => { el.alt = el.dataset.neAlt; });
    $$("[data-ne-wa]").forEach((el) => { el.dataset.wa = el.dataset.neWa; });
    $$("[data-ne-wa-form]").forEach((el) => { el.dataset.waForm = el.dataset.neWaForm; });
  }
  document.documentElement.classList.add("i18n-ready");
  document.addEventListener("click", (e) => { if (e.target.closest("[data-lang-toggle]")) setLang(NE ? "en" : "ne"); });

  const menu = $("#mobile-menu");
  const overlay = $("[data-overlay]");
  const bag = $("#bag");

  function lockScroll(on) { document.body.style.overflow = on ? "hidden" : ""; }
  function openMenu() { menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); lockScroll(true); }
  function closeMenu() { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); lockScroll(false); }
  function openBag() { renderBag(); bag.classList.add("open"); overlay.classList.add("show"); bag.setAttribute("aria-hidden", "false"); lockScroll(true); }
  function closeBag() { bag.classList.remove("open"); overlay.classList.remove("show"); bag.setAttribute("aria-hidden", "true"); lockScroll(false); }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-open-menu],[data-close-menu],[data-open-bag],[data-close-bag],[data-overlay]");
    if (!el) return;
    if (el.matches("[data-open-menu]")) openMenu();
    else if (el.matches("[data-close-menu]")) closeMenu();
    else if (el.matches("[data-open-bag]")) { closeMenu(); openBag(); }
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
  const pairs = (n) => t(`${n} ${n === 1 ? "pair" : "pairs"}`, `${num(n)} जोर`);

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
    $$(".bag-count").forEach((el) => { el.textContent = num(n); el.hidden = n === 0; });
  }
  updateCount();

  function lineHTML(l, i, editable = true) {
    const p = byId(l.id);
    return `
      <div class="line-item">
        <img src="${p.images[0]}" alt="">
        <div>
          <h4><a href="product.html?id=${p.id}" style="text-decoration:none">${esc(pName(p))}</a></h4>
          <div class="meta">${esc(colorLabel(p, l.color))} · ${t("Size", "साइज")} ${esc(sizeLabel(l.size))}${editable ? "" : ` · ${t("Qty", "संख्या")} ${num(l.qty)}`}</div>
          ${editable ? `<div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="${t("One less", "एक घटाउनुहोस्")}">−</button><input type="number" value="${l.qty}" min="1" max="50" data-qi="${i}" aria-label="${t("Quantity", "संख्या")}"><button type="button" data-q="${i}" data-d="1" aria-label="${t("One more", "एक थप्नुहोस्")}">+</button></div>
          <button class="remove" type="button" data-rm="${i}">${t("Remove", "हटाउनुहोस्")}</button>` : ""}
        </div>
        <div class="price">${rs(p.price * l.qty)}</div>
      </div>`;
  }

  function renderBag() {
    const lines = getBag();
    const body = $("[data-bag-body]");
    const foot = $("[data-bag-foot]");
    if (!lines.length) {
      body.innerHTML = `<div class="drawer-empty">${icon.bag}<p>${t("Your bag is empty.", "तपाईंको झोला खाली छ।")}</p><a class="btn btn-dark" href="shop.html">${t("Browse slippers", "चप्पल हेर्नुहोस्")}</a></div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = lines.map((l, i) => lineHTML(l, i)).join("");
    foot.innerHTML = `
      <div class="total-row"><span>${t("Subtotal", "जम्मा")}</span><span>${rs(bagTotal(lines))}</span></div>
      <p class="small-note">${t("Delivery charge depends on your location; we confirm it with you before sending.", "डेलिभरी शुल्क तपाईंको ठाउँअनुसार फरक पर्छ; पठाउनुअघि हामी तपाईंसँग पक्का गर्छौं।")}</p>
      <a class="btn btn-primary btn-block" href="checkout.html">${t("Place order", "अर्डर गर्नुहोस्")}</a>`;
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
    const el = $("[data-toast]");
    el.innerHTML = html;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3600);
  }
  document.addEventListener("click", (e) => { if (e.target.matches("[data-toast-bag]")) { $("[data-toast]").classList.remove("show"); openBag(); } });

  /* ---------- Product cards ---------- */
  function card(p) {
    const tagText = pTag(p);
    const tag = tagText ? `<span class="tag ${p.tag.kind}">${esc(tagText)}</span>` : "";
    const alt = p.images[1] ? `<img class="alt" src="${p.images[1]}" alt="" loading="lazy">` : "";
    const sub = NE ? `${esc(pFor(p))} · ${esc(p.name)}` : `${esc(p.for)} · <span class="deva">${esc(p.nepali)}</span>`;
    return `
      <article class="card reveal">
        <div style="position:relative">
          <a class="card-media" href="product.html?id=${p.id}">
            <img src="${p.images[0]}" alt="${esc(pName(p))}" loading="lazy">${alt}${tag}
          </a>
          <button class="quick-add" type="button" data-quick="${p.id}" aria-label="${t("Choose size for", "साइज छान्नुहोस्:")} ${esc(pName(p))}">${icon.plus}</button>
        </div>
        <div class="card-body">
          <div><h3><a href="product.html?id=${p.id}">${esc(pName(p))}</a></h3><div class="sub">${sub}</div></div>
          <div class="price">${rs(p.price)}</div>
        </div>
        <div class="swatches">${p.colors.map((c) => `<span class="swatch-dot" style="background:${c.hex}" title="${esc(NE ? c.ne : c.name)}"></span>`).join("")}</div>
      </article>`;
  }
  const renderCards = (el, list) => { el.innerHTML = list.map(card).join(""); observe(); };
  // Quick add needs a size, so it opens the product page at the size picker.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-quick]");
    if (b) location.href = `product.html?id=${b.dataset.quick}#choose`;
  });

  $$("[data-products]").forEach((el) => {
    const ids = el.dataset.products.split(",").map((s) => s.trim()).filter(Boolean);
    renderCards(el, ids.length ? ids.map(byId).filter(Boolean) : P);
  });

  /* ---------- Shop page ---------- */
  if (page === "shop") {
    const params = new URLSearchParams(location.search);
    let cat = params.get("c") || "all";
    let sort = "featured";
    let q = "";
    const grid = $("#shop-grid");
    const chips = $$("[data-cat]");

    function draw() {
      let list = P.filter((p) => cat === "all" || p.category === cat);
      if (q) list = list.filter((p) => [p.name, p.nepali, p.ne.name, p.short, p.ne.short, p.for, p.ne.for].join(" ").toLowerCase().includes(q));
      if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
      if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === cat)));
      const meta = catOf(cat);
      $("#shop-title").textContent = meta ? meta.name : t("All slippers", "सबै चप्पल");
      $("#shop-blurb").textContent = meta ? meta.blurb : t("Every pair is cut, glued and stitched by hand in our small workshop in Nepal.", "हरेक जोर नेपालको हाम्रो सानो कार्यशालामा हातैले काटिन्छ, टाँसिन्छ र सिलाइन्छ।");
      $("#shop-count").textContent = t(`${list.length} ${list.length === 1 ? "style" : "styles"}`, `${num(list.length)} डिजाइन`);
      if (list.length) renderCards(grid, list);
      else grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><p>${t("No slippers match that search.", "यो खोजसँग मिल्ने चप्पल भेटिएन।")}</p><p>${t("Looking for something special?", "केही विशेष खोज्दै हुनुहुन्छ?")} <a href="${waLink(t("Namaste! I'm looking for a slipper design: ", "नमस्ते! म यस्तो डिजाइनको चप्पल खोज्दै छु: "))}" target="_blank" rel="noopener">${t("Ask us on WhatsApp", "ह्वाट्सएपमा सोध्नुहोस्")}</a>. ${t("We make custom designs too.", "हामी अर्डरअनुसार डिजाइन पनि बनाउँछौं।")}</p></div>`;
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
      root.innerHTML = `<div class="empty" style="grid-column:1/-1"><h2>${t("We couldn't find that pair.", "त्यो चप्पल भेटिएन।")}</h2><p><a class="btn btn-dark" href="shop.html">${t("Back to the shop", "पसलमा फर्कनुहोस्")}</a></p></div>`;
    } else {
      document.title = `${pName(p)} · ${t(S.name, "अरेन्ज ह्यान्डमेड स्लिपर्स")}`;
      $("#crumb-name").textContent = pName(p);
      const cat = catOf(p.category);
      $("#crumb-cat").innerHTML = `<a href="shop.html?c=${p.category}">${cat.name}</a>`;
      let img = 0;
      let color = p.colors[0].name;
      let size = null;
      root.innerHTML = `
        <div class="gallery">
          <div class="thumbs">${p.images.map((src, i) => `<button type="button" data-img="${i}" aria-current="${i === 0}" aria-label="${t("Photo", "फोटो")} ${num(i + 1)}"><img src="${src}" alt=""></button>`).join("")}</div>
          <div class="main-img"><img id="main-img" src="${p.images[0]}" alt="${esc(pName(p))}"><span class="img-count" id="img-count">${num(1)} / ${num(p.images.length)}</span></div>
        </div>
        <div class="pdp-info">
          <span class="eyebrow">${p.for === "Kids" ? "" : esc(pFor(p)) + " · "}${esc(cat.name)}</span>
          <h1>${esc(pName(p))}</h1>
          <div class="${NE ? "" : "deva"}" style="color:var(--blue);font-size:18px;margin:-4px 0 12px">${esc(NE ? p.name : p.nepali)}</div>
          <div class="pdp-price">${rs(p.price)} <small>${t("per pair · delivery extra", "प्रति जोर · डेलिभरी शुल्क छुट्टै")}</small></div>
          <p class="pdp-desc">${esc(pDesc(p))}</p>
          <div class="opt">
            <div class="opt-label">${t("Colour", "रंग")} <span class="val" id="color-val">${esc(colorLabel(p, color))}</span></div>
            <div class="colors">${p.colors.map((c, i) => `<button type="button" class="color-btn" style="background:${c.hex}" data-color="${esc(c.name)}" aria-pressed="${i === 0}" aria-label="${esc(NE ? c.ne : c.name)}" title="${esc(NE ? c.ne : c.name)}"></button>`).join("")}</div>
          </div>
          <div class="opt" id="choose">
            <div class="opt-label">${t("Size", "साइज")} ${p.category === "kids" ? t("(by age)", "(उमेरअनुसार)") : "(EU)"} <a href="size-guide.html">${t("Size guide", "साइज गाइड")}</a></div>
            <div class="sizes">${p.sizes.map((s) => `<button type="button" class="size-btn" data-size="${esc(s)}" aria-pressed="false">${esc(sizeLabel(s))}</button>`).join("")}</div>
          </div>
          <div class="form-msg" id="pdp-msg" role="alert"></div>
          <div class="buy-row">
            <div class="qty"><button type="button" data-step="-1" aria-label="${t("One less", "एक घटाउनुहोस्")}">−</button><input id="pdp-qty" type="number" value="1" min="1" max="50" aria-label="${t("Quantity", "संख्या")}"><button type="button" data-step="1" aria-label="${t("One more", "एक थप्नुहोस्")}">+</button></div>
            <button class="btn btn-primary" type="button" id="add-btn">${icon.bag} ${t("Add to bag", "झोलामा राख्नुहोस्")}</button>
          </div>
          <a class="btn btn-wa btn-block" id="wa-btn" href="#" target="_blank" rel="noopener">${icon.wa} ${t("Ask about this pair on WhatsApp", "यो चप्पलबारे ह्वाट्सएपमा सोध्नुहोस्")}</a>
          <div class="note-box">${icon.ruler}<div>${t("<b>Between sizes or wide feet?</b> We can make your pair to your foot measurement. Send us your foot length in the order notes or on WhatsApp.", "<b>दुई साइजको बीचमा हुनुहुन्छ वा खुट्टा चौडा छ?</b> हामी तपाईंको खुट्टाको नापमै चप्पल बनाइदिन सक्छौं। अर्डरको टिप्पणीमा वा ह्वाट्सएपमा खुट्टाको लम्बाइ पठाउनुहोस्।")}</div></div>
          <ul class="perks">
            <li>${icon.hand} ${t("Cut, glued and stitched by hand in Nepal", "नेपालमै हातैले काटिएको, टाँसिएको र सिलाइएको")}</li>
            <li>${icon.truck} ${t("Delivery all over Nepal; we confirm the charge before sending", "नेपालभर डेलिभरी; पठाउनुअघि शुल्क पक्का गरिन्छ")}</li>
            <li>${icon.store} ${t("Buying for a shop or a wedding party?", "पसल वा जन्तीका लागि किन्दै हुनुहुन्छ?")} <a href="wholesale.html">${t("Ask for wholesale prices", "होलसेल मूल्य सोध्नुहोस्")}</a></li>
          </ul>
          <div class="accordion">
            <details open><summary>${t("Details", "विवरण")}</summary><div class="acc-body"><ul>${pDetails(p).map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div></details>
            <details><summary>${t("Care", "हेरचाह")}</summary><div class="acc-body">${t("Brush velvet gently with a soft dry cloth or clothes brush. Keep zari and stonework away from water and perfume. Wipe straps with a slightly damp cloth and let them dry in the shade. Store in the cloth bag they come in.", "मखमललाई नरम सुख्खा कपडा वा लुगा सफा गर्ने ब्रसले बिस्तारै सफा गर्नुहोस्। जरी र पत्थरको कामलाई पानी र अत्तरबाट टाढा राख्नुहोस्। पट्टीहरू अलिकति भिजेको कपडाले पुछेर छहारीमा सुकाउनुहोस्। चप्पल आएकै कपडाको झोलामा राख्नुहोस्।")}</div></details>
            <details><summary>${t("Delivery", "डेलिभरी")}</summary><div class="acc-body">${t("We deliver all over Nepal through our courier partner. After you place an order we message you to confirm your size, the delivery charge for your area and when it will reach you. Ordering from abroad? Message us and we'll see what we can do. Our slippers have already travelled to Japan, Korea, Dubai, Australia and Croatia.", "हामी कुरियर साझेदारमार्फत नेपालभर डेलिभरी गर्छौं। अर्डरपछि हामी तपाईंलाई म्यासेज गरेर साइज, तपाईंको ठाउँको डेलिभरी शुल्क र कहिले आइपुग्छ भन्ने पक्का गर्छौं। विदेशबाट अर्डर गर्दै हुनुहुन्छ? म्यासेज गर्नुहोस्, हामी उपाय खोज्छौं। हाम्रा चप्पल जापान, कोरिया, दुबई, अस्ट्रेलिया र क्रोएसियासम्म पुगिसकेका छन्।")}</div></details>
            <details><summary>${t("Exchanges and returns", "साटफेर र फिर्ता")}</summary><div class="acc-body">${t('Because every pair is made by hand, often to order, we don\'t accept returns or exchanges. Please check the <a href="size-guide.html">size guide</a> and message us if you\'re unsure. We\'re happy to help you choose before you buy.', 'हरेक जोर हातैले, प्रायः अर्डरअनुसार बनाइने भएकाले हामी फिर्ता वा साटफेर स्वीकार गर्दैनौं। कृपया <a href="size-guide.html">साइज गाइड</a> हेर्नुहोस् र पक्का नभए हामीलाई म्यासेज गर्नुहोस्। किन्नुअघि छान्न सघाउन पाउँदा हामीलाई खुसी लाग्छ।')}</div></details>
          </div>
        </div>`;

      const updateWa = () => {
        $("#wa-btn").href = waLink(t(
          `Namaste! I'm interested in the ${p.name} (${rs(p.price)}), colour: ${color}${size ? `, size: ${size}` : ""}. Is it available?`,
          `नमस्ते! मलाई ${p.ne.name} (${p.name}, ${rs(p.price)}) मन पर्‍यो। रंग: ${colorLabel(p, color)}${size ? `, साइज: ${sizeLabel(size)}` : ""}। उपलब्ध छ?`,
        ));
      };
      updateWa();
      root.addEventListener("click", (e) => {
        const el = e.target.closest("[data-img],[data-color],[data-size],[data-step]");
        if (!el) return;
        if (el.dataset.img !== undefined) {
          img = +el.dataset.img;
          $("#main-img").src = p.images[img];
          $("#img-count").textContent = `${num(img + 1)} / ${num(p.images.length)}`;
          $$("[data-img]", root).forEach((b) => b.setAttribute("aria-current", String(b === el)));
        } else if (el.dataset.color !== undefined) {
          color = el.dataset.color;
          $("#color-val").textContent = colorLabel(p, color);
          $$("[data-color]", root).forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
        } else if (el.dataset.size !== undefined) {
          size = el.dataset.size;
          $("#pdp-msg").textContent = "";
          $$("[data-size]", root).forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
        } else if (el.dataset.step !== undefined) {
          const inp = $("#pdp-qty");
          inp.value = Math.max(1, Math.min(50, (parseInt(inp.value, 10) || 1) + +el.dataset.step));
        }
        updateWa();
      });
      $("#add-btn").addEventListener("click", () => {
        if (!size) {
          $("#pdp-msg").textContent = t("Please choose a size first.", "कृपया पहिले साइज छान्नुहोस्।");
          $("#choose").scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        const qty = Math.max(1, Math.min(50, parseInt($("#pdp-qty").value, 10) || 1));
        addToBag(p.id, size, color, qty);
        toast(t(
          `Added ${qty > 1 ? qty + " pairs" : "to your bag"}: ${esc(p.name)}, size ${esc(size)}`,
          `झोलामा राखियो: ${esc(pName(p))}, साइज ${esc(sizeLabel(size))}${qty > 1 ? `, ${pairs(qty)}` : ""}`,
        ) + ` <button type="button" data-toast-bag>${t("View bag", "झोला हेर्नुहोस्")}</button>`);
      });

      const related = P.filter((x) => x.id !== p.id).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3);
      renderCards($("#related"), related);
    }
  }

  /* ---------- Checkout ---------- */
  if (page === "checkout") {
    const lines = getBag();
    const formWrap = $("#checkout-form-wrap");
    if (!lines.length) {
      $("#checkout").innerHTML = `<div class="empty" style="grid-column:1/-1">${icon.bag.replace("<svg", '<svg style="width:56px;height:56px;margin:0 auto 12px;color:var(--orange)"')}<h2>${t("Your bag is empty", "तपाईंको झोला खाली छ")}</h2><p>${t("Pick a pair you love, then come back here to place your order.", "मन पर्ने चप्पल छान्नुहोस्, अनि अर्डर गर्न यहाँ फर्कनुहोस्।")}</p><a class="btn btn-dark" href="shop.html">${t("Browse slippers", "चप्पल हेर्नुहोस्")}</a></div>`;
    } else {
      $("#summary-lines").innerHTML = lines.map((l, i) => lineHTML(l, i, false)).join("");
      $("#sum-subtotal").textContent = rs(bagTotal(lines));
      $("#sum-total").textContent = rs(bagTotal(lines));
      $("#sum-count").textContent = pairs(bagCount(lines));

      const CONTACT_NE = { WhatsApp: "ह्वाट्सएप", Viber: "भाइबर", "Phone call": "फोन कल" };
      const form = $("#checkout-form");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validate(form)) return;
        const d = Object.fromEntries(new FormData(form));
        const ref = "OHS-" + Date.now().toString(36).toUpperCase().slice(-6);
        const itemsText = lines.map((l) => {
          const p = byId(l.id);
          return t(
            `• ${p.name}, ${l.color}, size ${l.size} × ${l.qty} = ${rs(p.price * l.qty)}`,
            `• ${p.ne.name} (${p.name}), ${colorLabel(p, l.color)}, साइज ${sizeLabel(l.size)} × ${num(l.qty)} = ${rs(p.price * l.qty)}`,
          );
        }).join("\n");
        const msg = [
          t(`Namaste! New order ${ref}`, `नमस्ते! नयाँ अर्डर ${ref}`),
          "",
          itemsText,
          "",
          t(`Subtotal: ${rs(bagTotal(lines))} (+ delivery)`, `जम्मा: ${rs(bagTotal(lines))} (+ डेलिभरी शुल्क)`),
          "",
          `${t("Name", "नाम")}: ${d.name}`,
          `${t("Phone", "फोन")}: ${d.phone}`,
          `${t("Address", "ठेगाना")}: ${d.address}, ${d.city}, ${d.district}`,
          d.landmark ? `${t("Landmark", "नजिकको चिनारी")}: ${d.landmark}` : null,
          `${t("Contact me on", "सम्पर्क माध्यम")}: ${NE ? CONTACT_NE[d.contact] || d.contact : d.contact}`,
          d.notes ? `${t("Notes", "टिप्पणी")}: ${d.notes}` : null,
        ].filter((x) => x !== null).join("\n");
        try { localStorage.setItem("ohs-last-order", JSON.stringify({ ref, msg })); } catch { /* fine */ }
        writeBag([]);
        formWrap.innerHTML = `
          <div class="success">
            <div class="tick">${icon.check}</div>
            <h2>${t("One last step: send it to us", "अन्तिम चरण: हामीलाई पठाउनुहोस्")}</h2>
            <p class="lead" style="margin:14px auto">${t(`Your order <span class="order-ref">${ref}</span> is ready. Tap the button below to send it to us on WhatsApp. We'll reply to confirm your size, the delivery charge and payment.`, `तपाईंको अर्डर <span class="order-ref">${ref}</span> तयार छ। तलको बटन थिचेर ह्वाट्सएपमा पठाउनुहोस्। हामी जवाफ दिएर साइज, डेलिभरी शुल्क र भुक्तानी पक्का गर्छौं।`)}</p>
            <div class="actions">
              <a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener">${icon.wa} ${t("Send order on WhatsApp", "ह्वाट्सएपमा अर्डर पठाउनुहोस्")}</a>
              <button class="btn btn-ghost" type="button" id="copy-order">${t("Copy order text", "अर्डरको विवरण कपी गर्नुहोस्")}</button>
              <a class="btn btn-ghost" href="${S.messenger}" target="_blank" rel="noopener">${t("Open Facebook Messenger", "फेसबुक म्यासेन्जर खोल्नुहोस्")}</a>
              <a class="btn btn-ghost" href="tel:+${S.phone}">${icon.phone} ${t("Call", "फोन गर्नुहोस्")} ${S.phoneDisplay}</a>
            </div>
            <p class="small-note" style="margin-top:18px">${t("No WhatsApp? Copy the order text and paste it into Messenger or Viber, or just call us.", "ह्वाट्सएप छैन? अर्डरको विवरण कपी गरेर म्यासेन्जर वा भाइबरमा पठाउनुहोस्, वा सिधै फोन गर्नुहोस्।")}</p>
          </div>`;
        $("#checkout-aside").style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
        $("#copy-order").addEventListener("click", async (ev) => {
          try { await navigator.clipboard.writeText(msg); ev.target.textContent = t("Copied", "कपी भयो"); } catch { ev.target.textContent = t("Couldn't copy, please send on WhatsApp", "कपी हुन सकेन, कृपया ह्वाट्सएपमा पठाउनुहोस्"); }
        });
      });
    }
  }

  /* ---------- Simple enquiry forms (training, wholesale) ---------- */
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
      const lines = [form.dataset.waForm, ""];
      $$("input, select, textarea", form).forEach((el) => {
        if (!el.name || !String(el.value).trim()) return;
        const label = (NE && el.dataset.neName) || el.name;
        lines.push(`${label}: ${el.value}`);
      });
      window.open(waLink(lines.join("\n")), "_blank", "noopener");
      const done = form.querySelector("[data-done]");
      if (done) done.hidden = false;
    });
  });
  document.addEventListener("input", (e) => { const f = e.target.closest(".field.invalid"); if (f && e.target.value.trim()) f.classList.remove("invalid"); });

  /* ---------- District picker ---------- */
  const DISTRICTS = "Achham,Arghakhanchi,Baglung,Baitadi,Bajhang,Bajura,Banke,Bara,Bardiya,Bhaktapur,Bhojpur,Chitwan,Dadeldhura,Dailekh,Dang,Darchula,Dhading,Dhankuta,Dhanusha,Dolakha,Dolpa,Doti,Gorkha,Gulmi,Humla,Ilam,Jajarkot,Jhapa,Jumla,Kailali,Kalikot,Kanchanpur,Kapilvastu,Kaski,Kathmandu,Kavrepalanchok,Khotang,Lalitpur,Lamjung,Mahottari,Makwanpur,Manang,Morang,Mugu,Mustang,Myagdi,Nawalparasi East,Nawalparasi West,Nuwakot,Okhaldhunga,Palpa,Panchthar,Parbat,Parsa,Pyuthan,Ramechhap,Rasuwa,Rautahat,Rolpa,Rukum East,Rukum West,Rupandehi,Salyan,Sankhuwasabha,Saptari,Sarlahi,Sindhuli,Sindhupalchok,Siraha,Solukhumbu,Sunsari,Surkhet,Syangja,Tanahun,Taplejung,Terhathum,Udayapur".split(",");
  $$("[data-districts]").forEach((sel) => {
    sel.insertAdjacentHTML("beforeend", DISTRICTS.map((d) => `<option>${d}</option>`).join("") + `<option value="Outside Nepal">${t("Outside Nepal", "नेपाल बाहिर")}</option>`);
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
