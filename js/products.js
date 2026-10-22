/* Shop details and product list.
   To change a price, name or photo, edit it here and every page updates.
   Prices are in Nepali rupees. */

window.SHOP = {
  name: "Orange Handmade Slippers",
  phoneDisplay: "980-2051265",
  phone: "9779802051265", // country code + number, used for WhatsApp / Viber / call links
  instagram: "https://www.instagram.com/handmadeslippers99/",
  facebook: "https://www.facebook.com/handmadeslippers99",
  tiktok: "https://www.tiktok.com/@handmadeslippers99",
  messenger: "https://m.me/handmadeslippers99",
  location: "Aanbu Khaireni, Tanahun",
  press: {
    ronb: "https://www.facebook.com/officialroutineofnepalbanda/posts/pfbid02hdQiw367gSAAnCWVzNKPzzqH5MwLs83J82cDP3PYuRL4Wj6TjQE573SmCUxWDxRUl",
    setopati: "https://www.setopati.com/nepali-brand/314733",
  },
};

const ADULT_WOMEN = ["35", "36", "37", "38", "39", "40", "41"];
const ADULT_MEN = ["39", "40", "41", "42", "43", "44", "45"];
const KIDS = ["1–2 yrs", "2–3 yrs", "3–4 yrs", "4–5 yrs", "5–6 yrs"];

window.PRODUCTS = [
  {
    id: "groom-velvet-mules",
    name: "Groom Special Velvet Mules",
    nepali: "दुलहाको मखमली चप्पल",
    category: "festive",
    for: "Men",
    price: 1200,
    tag: { text: "Wedding season", kind: "festive" },
    colors: [
      { name: "Wedding red", hex: "#a3141c" },
      { name: "Maroon", hex: "#5e0f18" },
      { name: "Black", hex: "#1c1c1c" },
    ],
    sizes: ADULT_MEN,
    images: ["images/groom-mules.jpg", "images/groom-full.jpg", "images/workshop-flatlay.jpg"],
    short: "Deep red velvet with a fine gold edge, made for the daura suruwal on the big day.",
    description:
      "Our Groom Special: a closed-toe mule in soft wedding-red velvet, finished with a thin gold piping around the opening. Light enough to wear through a long ceremony, smart enough for every photo. We make them in matching sets for the groom's side too. Just tell us how many pairs.",
    details: [
      "Velvet upper with gold piping",
      "Padded insole, firm rubber-backed sole",
      "Cut, glued and stitched by hand",
      "Matching sets for wedding parties on request",
    ],
  },
  {
    id: "zari-phool-mules",
    name: "Zari Phool Velvet Mules",
    nepali: "जरी फूल चप्पल",
    category: "festive",
    for: "Women",
    price: 1150,
    tag: { text: "Festive", kind: "festive" },
    colors: [
      { name: "Wedding red", hex: "#a3141c" },
      { name: "Maroon", hex: "#5e0f18" },
    ],
    sizes: ADULT_WOMEN,
    images: ["images/zari-mules.jpg", "images/workshop-flatlay.jpg"],
    short: "Red velvet mules with hand-placed gold zari flowers across the toe.",
    description:
      "A bridal favourite. Each toe carries a spray of gold zari flowers and beads, placed by hand, on a soft red velvet mule. Pairs beautifully with a red sari or lehenga for weddings, Teej and Dashain.",
    details: [
      "Velvet upper, hand-placed zari embroidery",
      "Gold piping around the opening",
      "Cushioned insole",
      "Every pair's flowers are placed by hand, so no two are exactly alike",
    ],
  },
  {
    id: "zari-velvet-slides",
    name: "Zari Band Velvet Slides",
    nepali: "जरी स्लाइड",
    category: "festive",
    for: "Women",
    price: 1050,
    tag: null,
    colors: [
      { name: "Wedding red", hex: "#a3141c" },
      { name: "Black", hex: "#1c1c1c" },
    ],
    sizes: ADULT_WOMEN,
    images: ["images/zari-slides.jpg", "images/workshop-flatlay.jpg"],
    short: "Open-toe velvet slides with a wide band of gold zari work.",
    description:
      "The easy-on version of our festive range: an open-toe slide with a wide velvet band covered in gold zari motifs. Slip them on for puja, family gatherings and wedding receptions.",
    details: ["Velvet band with gold zari embroidery", "Open toe, easy slip-on", "Cushioned footbed", "Handmade in Nepal"],
  },
  {
    id: "dashain-paisley-slides",
    name: "Dashain Paisley Twist Slides",
    nepali: "दशैं विशेष चप्पल",
    category: "everyday",
    for: "Women",
    price: 750,
    tag: { text: "Dashain special", kind: "new" },
    colors: [
      { name: "Maroon paisley", hex: "#7c1a22" },
      { name: "Mustard paisley", hex: "#c48a1c" },
    ],
    sizes: ADULT_WOMEN,
    images: ["images/paisley-slides.jpg", "images/paisley-full.jpg"],
    short: "Bright paisley fabric twisted into a soft knot over the toes.",
    description:
      "Made for the festival season: a soft fabric slide in a bright paisley print, twisted into a knot over the toes. The whole footbed is wrapped in the same print, so they look as good off your feet as on. Light, colourful and easy to wear all day.",
    details: ["Printed fabric upper with twist knot", "Fabric-wrapped footbed", "Flexible sole", "Patterns vary slightly from pair to pair"],
  },
  {
    id: "dhaka-toe-ring",
    name: "Dhaka Stripe Toe-Ring Slippers",
    nepali: "ढाका धर्से चप्पल",
    category: "everyday",
    for: "Unisex",
    price: 850,
    tag: null,
    colors: [
      { name: "Black / red", hex: "#1c1c1c" },
      { name: "Navy / red", hex: "#1d2b4f" },
    ],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    images: ["images/dhaka-toe-ring.jpg", "images/dhaka-full.jpg"],
    short: "Black velvet with a toe ring and red-green-gold striped straps.",
    description:
      "A classic Nepali look: black velvet footbed, a toe ring and a wide strap, both trimmed in red, green and gold stripes that echo dhaka weaving. A comfortable everyday pair for home, temple and town.",
    details: ["Velvet footbed", "Toe ring and wide striped strap", "Lightweight sole", "Unisex sizing"],
  },
  {
    id: "blush-crisscross",
    name: "Blush Criss-Cross Sandals",
    nepali: "क्रस स्ट्र्याप स्यान्डल",
    category: "everyday",
    for: "Women",
    price: 950,
    tag: { text: "New", kind: "new" },
    colors: [
      { name: "Blush pink", hex: "#e7b5aa" },
      { name: "Black", hex: "#1c1c1c" },
      { name: "Tan", hex: "#a8703f" },
    ],
    sizes: ADULT_WOMEN,
    images: ["images/blush-crisscross.jpg", "images/sushma.jpg"],
    short: "Woven-look criss-cross straps on a square-toe sole, shaped on the last.",
    description:
      "Shaped by hand on a foot last, these square-toe sandals have two textured straps that cross over the foot and a small toe loop to keep them steady. Soft blush pink goes with everything from kurta to jeans.",
    details: ["Textured synthetic leather straps", "Square-toe sole with toe loop", "Shaped on a foot last for a good fit", "Made to your foot measurement on request"],
  },
  {
    id: "baby-zari-maryjanes",
    name: "Baby Zari Mary Janes",
    nepali: "बच्चाको जरी चप्पल",
    category: "kids",
    for: "Kids",
    price: 650,
    tag: { text: "Kids", kind: "" },
    colors: [
      { name: "Red / gold", hex: "#a3141c" },
      { name: "Maroon / gold", hex: "#5e0f18" },
    ],
    sizes: KIDS,
    images: ["images/baby-zari.jpg", "images/baby-wearing.jpg", "images/baby-full.jpg"],
    short: "Tiny velvet slippers with gold zari and a green stone, held on by an elastic strap.",
    description:
      "Little festival slippers for little feet. Red velvet with gold zari scrollwork and a green stone at the centre, plus an elastic strap so they stay on through every dance at the wedding. Perfect for pasni, Dashain and Tihar photos.",
    details: ["Velvet upper with gold zari and stone", "Elastic heel strap", "Soft, flexible sole", "Sized by age (tell us the foot length to be sure)"],
  },
];

window.CATEGORIES = {
  festive: { name: "Wedding & festive", blurb: "Velvet, zari and gold for weddings, Dashain and Tihar." },
  everyday: { name: "Everyday", blurb: "Light, comfortable pairs for home, temple and town." },
  kids: { name: "Kids", blurb: "Small, soft and sparkly, for little feet." },
};
