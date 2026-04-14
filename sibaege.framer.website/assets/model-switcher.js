(function () {
  const BRAND_ORDER = ["Dongfeng", "Ridarra", "Geely", "Forthing Friday"];
  const READY_RETRIES = 50;
  const RETRY_DELAY_MS = 150;
  const MAGNET_LIMIT = 10;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dataUrl = new URL("model-switcher-data.json", document.currentScript.src).toString();
  let manifestPromise = null;

  function isVisible(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  }

  function isTurkishHomepage() {
    return /\/tr\/(?:index\.html)?$/i.test(window.location.pathname);
  }

  function repoPrefix() {
    return isTurkishHomepage() ? "../../" : "../";
  }

  function sitePrefix() {
    return isTurkishHomepage() ? "../" : "";
  }

  function resolveRepoAsset(path) {
    if (!path || /^(https?:|data:|\/)/i.test(path)) {
      return path;
    }
    return repoPrefix() + path;
  }

  function resolveSiteHref(path) {
    if (!path || /^(https?:|mailto:|tel:|#|\/)/i.test(path)) {
      return path;
    }
    return sitePrefix() + path;
  }

  function findPricingSection() {
    return document.getElementById("pricing");
  }

  function looksLikeOriginalBlock(element) {
    if (!(element instanceof HTMLElement) || !isVisible(element)) {
      return false;
    }

    const text = element.innerText || "";
    const brandHits = BRAND_ORDER.filter((brand) => text.indexOf(brand) >= 0).length;
    const detailLinkCount = Array.from(element.querySelectorAll("a[href]")).filter((anchor) =>
      /dongfeng|ridarra|geely|forthing|epi/i.test(anchor.getAttribute("href") || "")
    ).length;

    return brandHits >= 3 && detailLinkCount >= 1;
  }

  function findOriginalBlock(section) {
    const candidates = Array.from(section.querySelectorAll("*"))
      .filter((element) => looksLikeOriginalBlock(element))
      .sort((left, right) => left.querySelectorAll("*").length - right.querySelectorAll("*").length);

    return candidates[0] || null;
  }

  async function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch(dataUrl, { cache: "no-store" }).then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load model switcher manifest");
        }
        return response.json();
      });
    }

    return manifestPromise;
  }

  function buildSwitcher(state) {
    const root = document.createElement("div");
    root.setAttribute("data-siba-switcher", "mounted");

    const shell = document.createElement("div");
    shell.setAttribute("data-siba-shell", "");

    const railWrap = document.createElement("div");
    railWrap.setAttribute("data-siba-rail-wrap", "");

    const railMeta = document.createElement("div");
    railMeta.setAttribute("data-siba-rail-meta", "");

    const eyebrow = document.createElement("p");
    eyebrow.setAttribute("data-siba-eyebrow", "");
    eyebrow.textContent = "Vehicle Selection";

    const count = document.createElement("p");
    count.setAttribute("data-siba-count", "");

    railMeta.append(eyebrow, count);

    const rail = document.createElement("div");
    rail.setAttribute("data-siba-rail", "");
    rail.setAttribute("role", "tablist");
    rail.setAttribute("aria-label", "Vehicle brands");

    const indicator = document.createElement("div");
    indicator.setAttribute("data-siba-indicator", "");
    rail.appendChild(indicator);

    state.brands.forEach((brand) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-siba-tab", "");
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", "false");
      button.setAttribute("tabindex", "-1");
      button.setAttribute("aria-controls", "siba-stage");
      button.dataset.sibaBrand = brand.name;
      button.textContent = brand.name;
      rail.appendChild(button);
      state.buttons.set(brand.name, button);
    });

    const stage = document.createElement("div");
    stage.setAttribute("data-siba-stage", "");

    const viewport = document.createElement("div");
    viewport.id = "siba-stage";
    viewport.setAttribute("data-siba-stage-viewport", "");
    viewport.setAttribute("aria-live", "polite");

    stage.appendChild(viewport);
    railWrap.append(railMeta, rail);
    shell.append(railWrap, stage);
    root.appendChild(shell);

    state.root = root;
    state.rail = rail;
    state.indicator = indicator;
    state.viewport = viewport;
    state.count = count;

    return root;
  }

  function createFeatureItem(text) {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  }

  function attachCardParallax(card) {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      const rect = card.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
      card.style.setProperty("--siba-card-x", offsetX.toFixed(2) + "px");
      card.style.setProperty("--siba-card-y", offsetY.toFixed(2) + "px");
    });

    ["pointerleave", "blur"].forEach((eventName) => {
      card.addEventListener(eventName, () => {
        card.style.setProperty("--siba-card-x", "0px");
        card.style.setProperty("--siba-card-y", "0px");
      });
    });
  }

  function createCard(model, brandName) {
    const article = document.createElement("article");
    article.setAttribute("data-siba-card", "");

    if (model.image) {
      const media = document.createElement("div");
      media.setAttribute("data-siba-card-media", "");

      const image = document.createElement("img");
      image.src = resolveRepoAsset(model.image);
      image.alt = model.title;
      image.loading = "lazy";
      image.decoding = "async";
      media.appendChild(image);
      article.appendChild(media);
    }

    const body = document.createElement("div");
    body.setAttribute("data-siba-card-body", "");

    const head = document.createElement("div");
    head.setAttribute("data-siba-card-head", "");

    const titleWrap = document.createElement("div");
    const brand = document.createElement("p");
    brand.setAttribute("data-siba-card-brand", "");
    brand.textContent = brandName;

    const title = document.createElement("h4");
    title.setAttribute("data-siba-card-title", "");
    title.textContent = model.title;

    titleWrap.append(brand, title);
    head.appendChild(titleWrap);

    if (model.badge) {
      const badge = document.createElement("span");
      badge.setAttribute("data-siba-badge", "");
      badge.textContent = model.badge;
      head.appendChild(badge);
    }

    body.appendChild(head);

    if (Array.isArray(model.features) && model.features.length) {
      const featureList = document.createElement("ul");
      featureList.setAttribute("data-siba-features", "");
      model.features.forEach((feature) => {
        featureList.appendChild(createFeatureItem(feature));
      });
      body.appendChild(featureList);
    }

    const cta = document.createElement("a");
    cta.setAttribute("data-siba-cta", "");
    cta.href = resolveSiteHref(model.href);
    cta.textContent = "View Details";
    body.appendChild(cta);

    article.appendChild(body);
    attachCardParallax(article);

    return article;
  }

  function createPanel(brand) {
    const panel = document.createElement("div");
    panel.setAttribute("data-siba-panel", "");
    panel.dataset.phase = "enter";

    const head = document.createElement("div");
    head.setAttribute("data-siba-panel-head", "");

    const titleWrap = document.createElement("div");
    titleWrap.setAttribute("data-siba-panel-title-wrap", "");

    const kicker = document.createElement("p");
    kicker.setAttribute("data-siba-panel-kicker", "");
    kicker.textContent = "Curated Selection";

    const title = document.createElement("h3");
    title.setAttribute("data-siba-panel-title", "");
    title.textContent = brand.name;

    titleWrap.append(kicker, title);

    const note = document.createElement("p");
    note.setAttribute("data-siba-panel-note", "");
    note.textContent =
      brand.models.length === 1
        ? "1 highlighted model"
        : brand.models.length + " highlighted models";

    head.append(titleWrap, note);

    const grid = document.createElement("div");
    grid.setAttribute("data-siba-card-grid", "");
    grid.dataset.count = String(brand.models.length);
    brand.models.forEach((model) => {
      grid.appendChild(createCard(model, brand.name));
    });

    panel.append(head, grid);
    return panel;
  }

  function updateIndicator(state) {
    const activeButton = state.rail.querySelector('[data-siba-tab][aria-selected="true"]');
    if (!(activeButton instanceof HTMLElement)) {
      return;
    }

    state.indicator.style.width = activeButton.offsetWidth + "px";
    state.indicator.style.height = activeButton.offsetHeight + "px";
    state.indicator.style.transform =
      "translate3d(" + activeButton.offsetLeft + "px, " + activeButton.offsetTop + "px, 0)";

    activeButton.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center"
    });
  }

  function setActiveButton(state, brandName) {
    state.buttons.forEach((button, name) => {
      const selected = name === brandName;
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.setAttribute("tabindex", selected ? "0" : "-1");
      if (selected) {
        button.style.setProperty("--siba-mx", "0px");
        button.style.setProperty("--siba-my", "0px");
      }
    });

    window.requestAnimationFrame(() => updateIndicator(state));
  }

  function renderBrand(state, brandName, immediate) {
    const brand = state.brands.find((entry) => entry.name === brandName);
    if (!brand) {
      return;
    }

    state.activeBrand = brandName;
    state.count.textContent = brand.models.length === 1 ? "1 model" : brand.models.length + " models";
    setActiveButton(state, brandName);

    const nextPanel = createPanel(brand);
    nextPanel.dataset.animated = immediate || prefersReducedMotion.matches ? "false" : "true";

    const currentPanel = state.viewport.querySelector("[data-siba-panel]");

    if (!currentPanel || immediate || prefersReducedMotion.matches) {
      state.viewport.replaceChildren(nextPanel);
      nextPanel.dataset.phase = "active";
      return;
    }

    currentPanel.dataset.animated = "true";
    state.viewport.appendChild(nextPanel);

    window.requestAnimationFrame(() => {
      currentPanel.dataset.phase = "exit";
      nextPanel.dataset.phase = "active";
    });

    window.setTimeout(() => {
      if (currentPanel.isConnected) {
        currentPanel.remove();
      }
    }, 430);
  }

  function attachRailInteractions(state) {
    const onResize = () => updateIndicator(state);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    state.rail.addEventListener("scroll", onResize, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onResize).catch(() => {});
    }

    state.rail.addEventListener("pointermove", (event) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      const rect = state.rail.getBoundingClientRect();
      state.rail.style.setProperty("--siba-spot-x", event.clientX - rect.left + "px");
      state.rail.style.setProperty("--siba-spot-y", event.clientY - rect.top + "px");
    });

    state.rail.addEventListener("pointerleave", () => {
      state.rail.style.setProperty("--siba-spot-x", "50%");
      state.rail.style.setProperty("--siba-spot-y", "50%");
    });

    state.buttons.forEach((button, brandName) => {
      button.addEventListener("click", () => {
        if (brandName !== state.activeBrand) {
          renderBrand(state, brandName, false);
        }
      });

      button.addEventListener("keydown", (event) => {
        const enabledBrands = state.brands.map((brand) => brand.name);
        const currentIndex = enabledBrands.indexOf(brandName);
        let targetIndex = currentIndex;

        if (event.key === "ArrowRight") {
          targetIndex = (currentIndex + 1) % enabledBrands.length;
        } else if (event.key === "ArrowLeft") {
          targetIndex = (currentIndex - 1 + enabledBrands.length) % enabledBrands.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = enabledBrands.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        const nextBrand = enabledBrands[targetIndex];
        const nextButton = state.buttons.get(nextBrand);
        if (nextButton) {
          nextButton.focus();
          renderBrand(state, nextBrand, false);
        }
      });

      button.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch" || button.getAttribute("aria-selected") === "true") {
          return;
        }

        const rect = button.getBoundingClientRect();
        const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * MAGNET_LIMIT * 2;
        const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * MAGNET_LIMIT * 1.2;
        button.style.setProperty("--siba-mx", offsetX.toFixed(2) + "px");
        button.style.setProperty("--siba-my", offsetY.toFixed(2) + "px");
      });

      ["pointerleave", "blur"].forEach((eventName) => {
        button.addEventListener(eventName, () => {
          button.style.setProperty("--siba-mx", "0px");
          button.style.setProperty("--siba-my", "0px");
        });
      });
    });
  }

  async function mountSwitcher(attempt) {
    const section = findPricingSection();
    if (
      !section ||
      section.dataset.sibaEnhanced === "true" ||
      section.dataset.sibaEnhancing === "true"
    ) {
      return;
    }

    const originalBlock = findOriginalBlock(section);
    if (!originalBlock) {
      if (attempt < READY_RETRIES) {
        window.setTimeout(() => mountSwitcher(attempt + 1), RETRY_DELAY_MS);
      }
      return;
    }

    section.dataset.sibaEnhancing = "true";

    try {
      const manifest = await loadManifest();
      const brands = BRAND_ORDER.map((brandName) =>
        (manifest.brands || []).find((entry) => entry.name === brandName)
      ).filter((entry) => entry && Array.isArray(entry.models) && entry.models.length);

      if (!brands.length) {
        throw new Error("Model switcher manifest is empty");
      }

      const state = {
        brands: brands,
        buttons: new Map(),
        activeBrand: brands[0].name
      };

      const switcher = buildSwitcher(state);
      originalBlock.setAttribute("data-siba-original", "true");
      originalBlock.parentNode.insertBefore(switcher, originalBlock);
      attachRailInteractions(state);
      renderBrand(state, brands[0].name, true);

      originalBlock.setAttribute("data-siba-hidden", "true");
      section.dataset.sibaEnhanced = "true";
      delete section.dataset.sibaEnhancing;
    } catch (error) {
      delete section.dataset.sibaEnhancing;
      if (attempt < READY_RETRIES) {
        window.setTimeout(() => mountSwitcher(attempt + 1), RETRY_DELAY_MS);
      }
    }
  }

  function start() {
    mountSwitcher(0);
  }

  if (document.readyState === "complete") {
    start();
  }

  window.addEventListener("load", start, { once: true });
})();
