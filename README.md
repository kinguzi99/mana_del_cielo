Maná del Cielo - Static Responsive Site

What I added
- `index.html` - main responsive page using your images (`logo.jpg`, `home.png`, `event1.png`, `event2.png`).
- `styles.css` - golden & white theme, responsive breakpoints for desktop/tablet/mobile.
- `script.js` - interactivity: mobile menu, donation modal, Payment Request API demo.

How to test locally
1. Open the folder in a simple HTTP server (recommended) because Payment Request API and Apple Pay require secure context for full functionality.

For a quick local server (macOS with Python 3):

```bash
# from the project folder
python3 -m http.server 8000
# open http://localhost:8000 in your browser
```

Notes on payments
- The donate button uses the Payment Request API demo with Apple Pay and basic-card as supported methods. Apple Pay requires HTTPS, a verified domain, and a configured merchant ID. For production use, integrate a payments provider such as Stripe which supports Apple Pay and cards and will provide server-side token handling.

Next steps (optional)
- Connect to Stripe or your payment processor backend for secure payment handling.
- Add translations, accessibility improvements, and real contact details.

Quick smoke-check (manual)
- Start a local server: `python3 -m http.server 8000` and open http://localhost:8000
- Verify header/logo loads and the hero image appears.
- Click "Donar" — a modal should open. Try Payment Request if your browser supports it, otherwise use the card fallback to simulate a payment.
- Check console for any JS errors.
