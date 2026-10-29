# Lumora website

Static landing, download and privacy pages, live at **https://getlumora.site**. Plain HTML/CSS/JS: no build step, no framework.

| File | What |
| --- | --- |
| `index.html` | Landing page: features, how it works, store badges, beta download |
| `download.html` | Download page with a QR code to the Play Store listing (QR library from cdnjs) |
| `privacy.html` | Privacy policy (last updated 27 Sep 2026) |
| `styles.css` | All styles; Plus Jakarta Sans from Google Fonts |
| `site.js` | Config block at the top, plus small UI behaviour (menu, fade-ins, QR, mailto forms) |
| `logo.svg` | Logo and favicon |
| `_redirects` | Netlify redirect: `/lumora-beta.apk` → the current beta APK |

## Configure

Everything you'd change is in the `LUMORA` object at the top of `site.js`:

| Key | Now |
| --- | --- |
| `playStoreUrl` | Placeholder package `com.anonymous.lumoraapp`. Must match `android.package` in `lumora-app/app.json` |
| `appStoreUrl` | Empty, so the App Store badge shows "Coming soon" |
| `email` | `hello@getlumora.site` |
| `betaApkUrl` | An EAS artifact URL on expo.dev (v1.2.0 preview build, 29 Oct 2026). Empty hides the beta section |
| `betaVersion` | `1.2.0`, shown on the download button |

https://getlumora.site/lumora-beta.apk is a redirect in `_redirects`, not a file. For a new preview build, put its artifact URL in both `betaApkUrl` and `_redirects`, and update `betaVersion`.

## Publish

The site is on Netlify. Drag this whole folder into the site's **Deploys** page; each deploy replaces every file. To preview locally, open `index.html` in a browser (or run `npx serve .`).

> These files were recovered from the live site on 27 Oct 2026, because the original source folder was lost. The site has no build step, so what's served is the source.
