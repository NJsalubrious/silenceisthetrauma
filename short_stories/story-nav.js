/**
 * PIXELSTORTION — Shared Story Navigation
 * ─────────────────────────────────────────
 * Drop-in header for all short stories.
 * Include via: <script src="story-nav.js"></script> before </body>
 *
 * Provides:
 *   • PIXELSTORTION branding dropdown (top-right)
 *   • "← Stories" back link (top-left)
 *   • Next / Prev story flipper (right edge)
 *   • Auto-hides on scroll, reappears on pause / scroll-to-top
 */

(function () {
  'use strict';

  /* ── Story Registry ──────────────────────────────────────────── */
  const STORIES = [
    { slug: 'pixelstortion_The_Equation', title: 'The Equation' },
    { slug: 'pixelstortion_ISLA_4-7-2',   title: 'She Knew His Pins' },
    { slug: 'Islas_Blast_Radius',          title: 'The Ferenczi Dissociation' },
    { slug: 'Same_Breath',                 title: 'Same Breath' },
    { slug: 'the_evaluation',              title: 'The Evaluator' },
  ];

  /* ── Detect current story ────────────────────────────────────── */
  const path = window.location.pathname;
  let currentIndex = -1;
  STORIES.forEach((s, i) => {
    if (path.includes(s.slug)) currentIndex = i;
  });

  const prevStory = currentIndex > 0 ? STORIES[currentIndex - 1] : null;
  const nextStory = currentIndex < STORIES.length - 1 ? STORIES[currentIndex + 1] : null;

  /* ── Inject CSS ──────────────────────────────────────────────── */
  const css = document.createElement('style');
  css.textContent = `
    /* ── Story Nav — Scoped under .ps-story-nav ── */
    .ps-story-nav *,
    .ps-story-nav *::before,
    .ps-story-nav *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Back link — top left */
    .ps-nav-back {
      position: fixed;
      top: 18px;
      left: 22px;
      z-index: 9999;
      font-family: 'Courier Prime', 'Space Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(180, 175, 168, 0.5);
      text-decoration: none;
      transition: color 0.3s ease, opacity 0.5s ease;
      opacity: 1;
    }
    .ps-nav-back:hover {
      color: rgba(220, 215, 208, 0.9);
    }
    .ps-nav-back.ps-hidden {
      opacity: 0;
      pointer-events: none;
    }

    /* Branding dropdown — top right */
    .ps-nav-brand {
      position: fixed;
      top: 14px;
      right: 22px;
      z-index: 9999;
      transition: opacity 0.5s ease;
      opacity: 1;
    }
    .ps-nav-brand.ps-hidden {
      opacity: 0;
      pointer-events: none;
    }

    .ps-nav-brand-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 0;
      font-family: 'Courier Prime', 'Space Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(180, 175, 168, 0.45);
      transition: color 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ps-nav-brand-btn:hover {
      color: rgba(220, 215, 208, 0.85);
    }
    .ps-nav-brand-btn .ps-arrow {
      font-size: 0.45rem;
      transition: transform 0.3s ease;
    }
    .ps-nav-brand-btn.ps-open .ps-arrow {
      transform: rotate(180deg);
    }

    .ps-nav-menu {
      display: none;
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 190px;
      background: rgba(10, 10, 10, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 4px;
      padding: 6px 0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    }
    .ps-nav-menu.ps-show {
      display: block;
    }

    .ps-nav-menu-item {
      display: block;
      padding: 8px 16px;
      font-family: 'Courier Prime', 'Space Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.08em;
      color: rgba(200, 195, 188, 0.7);
      text-decoration: none;
      transition: background 0.2s ease, color 0.2s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .ps-nav-menu-item:last-child {
      border-bottom: none;
    }
    .ps-nav-menu-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(230, 225, 218, 0.95);
    }
    .ps-nav-menu-item.ps-disabled {
      opacity: 0.35;
      cursor: default;
      pointer-events: none;
    }

    /* Story flipper — right edge */
    .ps-nav-flipper {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 9998;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: opacity 0.5s ease;
      opacity: 1;
    }
    .ps-nav-flipper.ps-hidden {
      opacity: 0;
      pointer-events: none;
    }

    .ps-flip-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: 10px 12px 10px 6px;
      background: rgba(10, 10, 10, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-right: none;
      border-radius: 4px 0 0 4px;
      transition: background 0.3s ease, padding 0.3s ease;
      overflow: hidden;
      max-width: 38px;
      transition: max-width 0.4s ease, background 0.3s ease;
    }
    .ps-flip-link:hover {
      max-width: 280px;
      background: rgba(10, 10, 10, 0.88);
    }

    .ps-flip-chevron {
      font-family: 'Courier Prime', 'Space Mono', monospace;
      font-size: 1rem;
      color: rgba(180, 175, 168, 0.5);
      flex-shrink: 0;
      width: 18px;
      text-align: center;
      line-height: 1;
    }

    .ps-flip-title {
      font-family: 'Courier Prime', 'Space Mono', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.06em;
      color: rgba(180, 175, 168, 0.6);
      white-space: nowrap;
      margin-left: 8px;
      opacity: 0;
      transition: opacity 0.3s ease 0.1s;
    }
    .ps-flip-link:hover .ps-flip-title {
      opacity: 1;
    }

    /* Mobile adjustments */
    @media (max-width: 600px) {
      .ps-nav-back {
        top: 12px;
        left: 14px;
        font-size: 0.6rem;
      }
      .ps-nav-brand {
        top: 10px;
        right: 14px;
      }
      .ps-nav-brand-btn {
        font-size: 0.55rem;
      }
      .ps-nav-flipper {
        display: none;
      }
    }
  `;
  document.head.appendChild(css);

  /* ── Build DOM ───────────────────────────────────────────────── */

  // Back link
  const backLink = document.createElement('a');
  backLink.className = 'ps-nav-back';
  backLink.href = '../stories.html';
  backLink.textContent = '← Stories';
  document.body.appendChild(backLink);

  // Branding dropdown
  const brandWrap = document.createElement('div');
  brandWrap.className = 'ps-nav-brand';

  const brandBtn = document.createElement('button');
  brandBtn.className = 'ps-nav-brand-btn';
  brandBtn.id = 'psStoryBrandBtn';
  brandBtn.innerHTML = 'PIXELSTORTION <span class="ps-arrow">▼</span>';

  const menu = document.createElement('div');
  menu.className = 'ps-nav-menu';
  menu.id = 'psStoryMenu';

  const menuItems = [
    { label: 'Stories',               href: '../stories.html' },
    { label: 'Silence is the trauma', href: 'https://silenceisthetrauma.com/' },
    { label: 'veX: Social Network',   href: 'https://silenceisthetrauma.com/veX_social_network/' },
    { label: 'Isla',                  href: 'https://islaband.com/' },
    { label: 'Ethel Ryker',           href: 'https://ethelryker.com/' },
    { label: 'Dominic Ryker',         href: 'https://dominicryker.com/' },
    { label: 'Nalani',                href: 'https://pixelstortion.com/' },
    { label: 'BIO',                   href: 'https://pixelstortion.com/bio/' },
  ];

  menuItems.forEach(item => {
    const a = document.createElement('a');
    a.className = 'ps-nav-menu-item';
    a.href = item.href;
    a.textContent = item.label;
    if (item.href.startsWith('http')) a.target = '_blank';
    menu.appendChild(a);
  });

  brandWrap.appendChild(brandBtn);
  brandWrap.appendChild(menu);
  document.body.appendChild(brandWrap);

  // Branding toggle
  brandBtn.addEventListener('click', () => {
    menu.classList.toggle('ps-show');
    brandBtn.classList.toggle('ps-open');
  });

  document.addEventListener('click', (e) => {
    if (!brandWrap.contains(e.target)) {
      menu.classList.remove('ps-show');
      brandBtn.classList.remove('ps-open');
    }
  });

  // Story flipper
  if (prevStory || nextStory) {
    const flipper = document.createElement('div');
    flipper.className = 'ps-nav-flipper';
    flipper.id = 'psStoryFlipper';

    if (prevStory) {
      const prev = document.createElement('a');
      prev.className = 'ps-flip-link';
      prev.href = prevStory.slug + '.html';
      prev.innerHTML = `<span class="ps-flip-chevron">‹</span><span class="ps-flip-title">${prevStory.title}</span>`;
      flipper.appendChild(prev);
    }

    if (nextStory) {
      const next = document.createElement('a');
      next.className = 'ps-flip-link';
      next.href = nextStory.slug + '.html';
      next.innerHTML = `<span class="ps-flip-chevron">›</span><span class="ps-flip-title">${nextStory.title}</span>`;
      flipper.appendChild(next);
    }

    document.body.appendChild(flipper);
  }

  /* ── Scroll-hide behaviour ───────────────────────────────────── */
  const hideTargets = [backLink, brandWrap];
  const flipperEl = document.getElementById('psStoryFlipper');
  if (flipperEl) hideTargets.push(flipperEl);

  let scrollTimer = null;
  let lastScroll = 0;

  function showNav() {
    hideTargets.forEach(el => el.classList.remove('ps-hidden'));
  }
  function hideNav() {
    hideTargets.forEach(el => el.classList.add('ps-hidden'));
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY || document.documentElement.scrollTop;

    if (y < 150) {
      showNav();
    } else if (y > lastScroll + 5) {
      hideNav();
    }

    lastScroll = y;

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      showNav();
    }, 2000);
  }, { passive: true });

})();
