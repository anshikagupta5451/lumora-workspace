// ============================================================
//  EDIT THESE before going live
// ============================================================
const LUMORA = {
  // Your Google Play listing. The id must match `android.package` in lumora-app/app.json.
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.anonymous.lumoraapp",
  // Leave empty until the iOS app is live — the badge shows "Coming soon" meanwhile.
  appStoreUrl: "",
  email: "hello@getlumora.site",
  // Beta APK for testers (an EAS "preview" build, NOT "development").
  // Leave empty to hide the beta section.
  betaApkUrl: "https://expo.dev/artifacts/eas/MNlD3xhGfq7mUXnzgKzZytzlfnBC5gWPHVXr9VFTKhU.apk",
  betaVersion: "1.2.0",
};
// ============================================================

// Store badges
document.querySelectorAll("[data-play]").forEach((a) => {
  a.href = LUMORA.playStoreUrl;
  a.target = "_blank";
  a.rel = "noopener";
});
document.querySelectorAll("[data-appstore]").forEach((a) => {
  if (LUMORA.appStoreUrl) {
    a.href = LUMORA.appStoreUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.classList.remove("soon");
    a.querySelector("small").textContent = "Download on the";
  }
});

// Beta APK download — hidden until betaApkUrl is set
document.querySelectorAll("[data-beta]").forEach((el) => {
  if (!LUMORA.betaApkUrl) return el.remove();
  el.hidden = false;
  el.querySelectorAll("[data-beta-link]").forEach((a) => (a.href = LUMORA.betaApkUrl));
  el.querySelectorAll("[data-beta-version]").forEach((v) => (v.textContent = LUMORA.betaVersion));
});

// Email links / text
document.querySelectorAll("[data-email]").forEach((el) => {
  el.textContent = LUMORA.email;
  if (el.tagName === "A") el.href = "mailto:" + LUMORA.email;
});
document.querySelectorAll("[data-contact]").forEach((a) => (a.href = "mailto:" + LUMORA.email));

// "Notify me" form — opens the visitor's mail app (no backend needed)
document.querySelectorAll("form[data-notify]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const from = form.querySelector("input").value.trim();
    const subject = encodeURIComponent("Notify me when Lumora launches on iOS");
    const body = encodeURIComponent(`Please let me know when Lumora is on the App Store.\n\nMy email: ${from}`);
    window.location.href = `mailto:${LUMORA.email}?subject=${subject}&body=${body}`;
  });
});

// QR code pointing at the Play Store (download page only)
const qr = document.getElementById("qr");
if (qr && window.QRCode) {
  new QRCode(qr, {
    text: LUMORA.playStoreUrl,
    width: 256,
    height: 256,
    colorDark: "#2A1620",
    colorLight: "#FFFFFF",
    correctLevel: QRCode.CorrectLevel.M,
  });
}

// Mobile menu
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

// Header border on scroll
const header = document.querySelector(".header");
const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Fade-in on scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add("in"), io.unobserve(en.target))),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
