# Orange Handmade Slippers website

A plain HTML/CSS/JavaScript website. There is nothing to install or build: open the files in any web host and it works.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Shop (filters, search, sort) | `shop.html` |
| Product page (photos, colour, size, quantity) | `product.html?id=...` |
| Place order (sends the order to WhatsApp) | `checkout.html` |
| Our story + press (Routine of Nepal Banda, Setopati) | `story.html` |
| Training | `training.html` |
| Wholesale & contact | `wholesale.html` |
| Size guide | `size-guide.html` |
| Help & FAQ | `faq.html` |

## How ordering works (no payment gateway)

1. The customer adds slippers to the bag (saved in their browser).
2. On **Place order** they enter name, phone and address.
3. The site writes the full order (items, sizes, colours, total, address) and opens **WhatsApp to 980-2051265** with the message ready. The customer presses send.
4. The shop confirms delivery charge and payment in the chat.

Training and wholesale forms work the same way.

## Common changes

- **Prices, product names, descriptions, sizes, colours, photos:** `js/products.js`. Every page updates from this one file.
- **Phone number, social links, location:** the `SHOP` block at the top of `js/products.js`.
- **Add a product:** copy one product block in `js/products.js`, give it a new `id`, and put its photos in `images/`.
- **Colours and fonts:** the top of `css/style.css`.

## Photos

Product photos were cropped from the shop's public Instagram/Facebook posts (`images/raw/` holds the originals). They are small (360–640 px), so replace them with sharper photos when possible: bright daylight, plain background, square crop, about 1200 × 1200 px.

## Preview on this computer

From Claude Code: start the `orange-site` preview (port 4174). Or in Terminal:

```bash
cd ~/Downloads/Orange-Handmade-Slippers && python3 -m http.server 4174
```

Then open http://localhost:4174

## Putting it online (free options)

Any static host works: Cloudflare Pages, Netlify or Vercel. Drag the folder in, or connect a GitHub repo.

## English / नेपाली

The site has an English / नेपाली switch in the header (and in the phone menu and footer). The choice is remembered on each visitor's device. To share a link that opens in Nepali, add `?lang=ne`, e.g. `https://orange-handmade-slippers.vercel.app/?lang=ne`.

- **Page text:** each English element carries its Nepali version right beside it in a `data-ne="..."` attribute in the `.html` files. Edit the Nepali there.
- **Products:** each product in `js/products.js` has an `ne` block (name, description, details, tag), and each colour has an `ne` name.
- **Header, footer, bag, checkout, WhatsApp messages:** written in `js/app.js` as `t("English", "नेपाली")`.
- **Fonts:** Nepali uses Mukta for reading text and Tiro Devanagari Hindi for headings (Google Fonts).
- Orders placed in Nepali reach WhatsApp in Nepali, with the English product name in brackets.
