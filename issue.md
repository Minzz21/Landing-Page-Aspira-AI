# 🎯 Issue: Implementasi Design Motion pada Landing Page ASPIRA AI

**Branch:** `design-motion`  
**Repository:** `Minzz21/Landing-Page-Aspira-AI`  
**Assignee:** @Minzz21  
**Labels:** `enhancement`, `frontend`, `animation`, `ci/cd`

---

## 📋 Deskripsi

Implementasi fitur **design motion** (animasi dan transisi visual) pada landing page ASPIRA AI untuk meningkatkan user experience dan memberikan kesan modern serta interaktif. Fitur ini mencakup scroll-triggered animations, hover effects, micro-interactions, dan smooth transitions di seluruh halaman.

---

## 🎬 Fitur Motion yang Akan Diimplementasi

### 1. Hero Section
- [ ] Fade-in + slide-up animation pada `.hero-card` saat halaman dimuat
- [ ] Parallax effect ringan pada background image (`hero_bg.png`)
- [ ] Animasi typing effect pada heading `h1`
- [ ] Pulse animation pada tombol CTA "Unduh Aplikasi Sekarang"

### 2. Navbar
- [ ] Smooth transition saat navbar menjadi sticky on scroll
- [ ] Backdrop blur + shadow animation saat scroll melewati hero section
- [ ] Active link indicator animation saat navigasi antar section

### 3. Cara Kerja Section (Features)
- [ ] Staggered fade-in animation pada setiap `.feature-card` menggunakan Intersection Observer
- [ ] Icon bounce/rotate animation pada `.icon-circle` saat card masuk viewport
- [ ] Counter animation pada nomor langkah (1, 2, 3)
- [ ] Hover scale + glow effect pada feature cards

### 4. CTA Section
- [ ] Fade-in dari bawah saat scroll mencapai section
- [ ] Gradient shimmer animation pada background
- [ ] Button hover ripple effect

### 5. Footer
- [ ] Slide-up animation pada elemen footer
- [ ] Hover underline animation pada footer links

### 6. Global & Micro-interactions
- [ ] Smooth scroll behavior untuk navigasi anchor links
- [ ] Custom cursor effect (opsional)
- [ ] Page load transition / preloader animation

---

## ⚙️ CI/CD Pipeline

### Workflow File: `.github/workflows/deploy-motion.yml`

```yaml
name: 🚀 Deploy Design Motion

on:
  push:
    branches:
      - design-motion
  pull_request:
    branches:
      - main
    types: [opened, synchronize, reopened]

jobs:
  # ────────────────────────────────────────────
  # Job 1: Linting & Validasi Kode
  # ────────────────────────────────────────────
  lint:
    name: 🔍 Lint & Validate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Lint HTML
        run: npx htmlhint "**/*.html"

      - name: Lint CSS
        run: npx stylelint "**/*.css"

      - name: Lint JavaScript
        run: npx eslint "**/*.js" --no-error-on-unmatched-pattern

  # ────────────────────────────────────────────
  # Job 2: Validasi Performa Animasi
  # ────────────────────────────────────────────
  performance:
    name: ⚡ Performance Audit
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Lighthouse CI
        run: npm install -g @lhci/cli

      - name: Start local server
        run: npx serve . -l 3000 &
      
      - name: Wait for server
        run: sleep 3

      - name: Run Lighthouse audit
        run: |
          lhci autorun \
            --collect.url=http://localhost:3000 \
            --collect.numberOfRuns=3 \
            --assert.preset=lighthouse:recommended \
            --assert.assertions.categories:performance=warn:90 \
            --assert.assertions.categories:accessibility=error:90 \
            --assert.assertions.categories:best-practices=warn:85
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload Lighthouse report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-report
          path: .lighthouseci/

  # ────────────────────────────────────────────
  # Job 3: Visual Regression Testing
  # ────────────────────────────────────────────
  visual-test:
    name: 🖼️ Visual Regression Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Playwright
        run: |
          npm init -y
          npm install @playwright/test
          npx playwright install --with-deps chromium

      - name: Start local server
        run: npx serve . -l 3000 &

      - name: Wait for server
        run: sleep 3

      - name: Run visual tests
        run: npx playwright test --config=playwright.config.js

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: visual-regression-screenshots
          path: test-results/

  # ────────────────────────────────────────────
  # Job 4: Cross-Browser Testing
  # ────────────────────────────────────────────
  browser-test:
    name: 🌐 Cross-Browser Test
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Playwright
        run: |
          npm init -y
          npm install @playwright/test
          npx playwright install --with-deps ${{ matrix.browser }}

      - name: Start local server
        run: npx serve . -l 3000 &

      - name: Wait for server
        run: sleep 3

      - name: Run animation tests on ${{ matrix.browser }}
        run: npx playwright test --project=${{ matrix.browser }}

  # ────────────────────────────────────────────
  # Job 5: Deploy ke GitHub Pages (Preview)
  # ────────────────────────────────────────────
  deploy-preview:
    name: 🌍 Deploy Preview
    runs-on: ubuntu-latest
    needs: [performance, visual-test]
    if: github.event_name == 'push' && github.ref == 'refs/heads/design-motion'
    permissions:
      pages: write
      id-token: write
    environment:
      name: preview
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Minify CSS
        run: |
          npm install -g cssnano-cli
          npx cssnano styles.css styles.min.css

      - name: Minify HTML
        run: |
          npm install -g html-minifier-terser
          npx html-minifier-terser \
            --collapse-whitespace \
            --remove-comments \
            --minify-css true \
            --minify-js true \
            index.html -o index.html

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

  # ────────────────────────────────────────────
  # Job 6: Deploy Produksi (hanya saat merge ke main)
  # ────────────────────────────────────────────
  deploy-production:
    name: 🏁 Deploy Production
    runs-on: ubuntu-latest
    needs: [performance, visual-test, browser-test]
    if: github.event_name == 'pull_request' && github.base_ref == 'main' && github.event.action == 'closed' && github.event.pull_request.merged == true
    permissions:
      pages: write
      id-token: write
    environment:
      name: production
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: main

      - name: Optimize assets
        run: |
          npm install -g imagemin-cli
          npx imagemin hero_bg.png --out-dir=./
          npx imagemin logo.png --out-dir=./

      - name: Minify CSS
        run: |
          npm install -g cssnano-cli
          npx cssnano styles.css styles.min.css

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 📊 Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Push ke branch design-motion                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   🔍 Lint &     │
                  │    Validate     │
                  └────────┬────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │ ⚡ Perf    │ │ 🖼️ Visual │ │ 🌐 Browser │
     │   Audit    │ │   Test     │ │   Test     │
     └──────┬─────┘ └──────┬─────┘ └──────┬─────┘
            │              │              │
            └──────────┬───┘              │
                       ▼                  │
              ┌─────────────────┐         │
              │ 🌍 Deploy       │         │
              │   Preview       │         │
              └─────────────────┘         │
                                          │
         ┌────────────────────────────────┘
         ▼
┌─────────────────────────────────────────┐
│  PR merged ke main → 🏁 Deploy Prod    │
└─────────────────────────────────────────┘
```

---

## 📁 Struktur File yang Ditambahkan / Dimodifikasi

```
aspira-ai-landing-page/
├── .github/
│   └── workflows/
│       └── deploy-motion.yml       # [NEW] CI/CD pipeline
├── .htmlhintrc                     # [NEW] HTML linting config
├── .stylelintrc.json               # [NEW] CSS linting config
├── playwright.config.js            # [NEW] Playwright test config
├── tests/
│   ├── animations.spec.js          # [NEW] Animation test cases
│   └── visual-regression.spec.js   # [NEW] Visual regression tests
├── index.html                      # [MODIFIED] Tambah class & data attr untuk animasi
├── styles.css                      # [MODIFIED] Tambah @keyframes & animasi CSS
├── animations.js                   # [NEW] Script Intersection Observer & motion logic
├── issue.md                        # [NEW] Dokumentasi issue ini
└── package.json                    # [NEW] Dependencies untuk linting & testing
```

---

## ✅ Acceptance Criteria

- [ ] Semua animasi berjalan smooth (60fps) tanpa jank
- [ ] Lighthouse Performance score ≥ 90
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] Animasi mendukung `prefers-reduced-motion` media query
- [ ] Berfungsi di Chrome, Firefox, dan Safari (terbaru)
- [ ] Responsive di mobile, tablet, dan desktop
- [ ] CI/CD pipeline berjalan tanpa error
- [ ] Visual regression test passed
- [ ] File CSS menggunakan GPU-accelerated properties (`transform`, `opacity`)

---

## 🛠️ Tech Stack untuk Motion

| Teknologi | Kegunaan |
|-----------|----------|
| CSS `@keyframes` | Animasi dasar (fade, slide, pulse) |
| CSS `transition` | Hover effects & state changes |
| Intersection Observer API | Scroll-triggered animations |
| `requestAnimationFrame` | Parallax & smooth animations |
| `prefers-reduced-motion` | Accessibility - matikan animasi bagi pengguna sensitif |
| Playwright | Visual regression & cross-browser testing |
| Lighthouse CI | Performance auditing dalam CI |

---

## 🔗 Referensi

- [MDN - CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations)
- [MDN - Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web.dev - Animations Guide](https://web.dev/animations-guide/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright Docs](https://playwright.dev/)

---

> **Catatan:** Issue ini akan dikerjakan di branch `design-motion` dan akan di-merge ke `main` melalui Pull Request setelah semua acceptance criteria terpenuhi dan CI/CD pipeline berstatus ✅ hijau.
