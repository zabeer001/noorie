(function ($) {
  'use strict';

  const store = window.NOORIE_STORE || {};
  const assets = typeof ASSETS !== 'undefined' ? ASSETS : {};
  const products = Array.isArray(store.products) ? store.products : [];
  const categories = Array.isArray(store.categories) ? store.categories : [];
  const state = { category: 'all', modalProduct: null, selected: {}, busy: false };

  const $id = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  const endpoint = (name) => String(store.wc_ajax_url || '/?wc-ajax=%%endpoint%%').replace('%%endpoint%%', name);
  const categoryNames = (product) => (product.categories || []).map((item) => item.name).join(' • ') || 'Uncategorized';
  const hasCategory = (product, slug) => slug === 'all' || (product.categories || []).some((item) => item.slug === slug);
  const findProduct = (id) => products.find((product) => Number(product.id) === Number(id));

  function showToast(message) {
    const banner = $id('toastBanner');
    const label = $id('toastMessage');
    if (!banner || !label) return;
    label.textContent = message;
    banner.classList.remove('opacity-0', 'translate-y-4');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => banner.classList.add('opacity-0', 'translate-y-4'), 2600);
  }

  function productAction(product, compact) {
    if (!product.purchasable && !['grouped', 'external'].includes(product.type)) {
      return `<button type="button" disabled class="btn-glass-white flex-1 py-2.5 px-3 rounded-full font-anton text-xs opacity-60 cursor-not-allowed">OUT OF STOCK</button>`;
    }
    if (product.type === 'simple') {
      return `<button type="button" data-real-add="${product.id}" class="btn-glass-emerald flex-1 py-2.5 px-3 rounded-full font-anton text-xs tracking-wider">+ ADD TO BAG</button>`;
    }
    const label = product.type === 'variable' ? 'CHOOSE OPTIONS' : 'VIEW PRODUCT';
    const attr = product.type === 'variable' ? `data-open-product="${product.id}"` : `data-product-link="${escapeHtml(product.url)}"`;
    return `<button type="button" ${attr} class="btn-glass-emerald flex-1 py-2.5 px-3 rounded-full font-anton text-xs tracking-wider">${label}</button>`;
  }

  function productCard(product, featured) {
    const stockLabel = product.stock === 'instock' ? 'IN STOCK' : product.stock.replaceAll('-', ' ').toUpperCase();
    return `
      <article class="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group" data-product-id="${product.id}">
        <div>
          <div class="relative ${featured ? 'h-80' : 'h-64'} overflow-hidden bg-emerald-50">
            <a href="${escapeHtml(product.url)}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"/></a>
            <span class="absolute top-3 left-3 bg-emerald-900 text-white px-2.5 py-1 rounded-full font-anton text-[11px] tracking-wider">${escapeHtml(stockLabel)}</span>
            <button type="button" data-open-product="${product.id}" class="absolute bottom-3 right-3 btn-glass-white px-2.5 py-1 rounded-full font-anton text-[11px]">QUICK VIEW</button>
          </div>
          <div class="p-4 sm:p-5 space-y-2.5">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">${escapeHtml(categoryNames(product))} • ${escapeHtml(product.type)}</div>
            <div class="flex items-start justify-between gap-3"><h3 class="font-anton text-lg text-emerald-950 leading-snug"><a href="${escapeHtml(product.url)}">${escapeHtml(product.name)}</a></h3><span class="font-anton text-lg text-emerald-700 shrink-0">${product.price_html || ''}</span></div>
            <p class="text-xs text-emerald-800 font-medium leading-relaxed">${escapeHtml(product.description || 'Authentic WooCommerce sample product ready for storefront testing.')}</p>
          </div>
        </div>
        <div class="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex items-center gap-2">${productAction(product, featured)}<a href="${escapeHtml(product.url)}" class="btn-glass-white py-2.5 px-3 rounded-full font-anton text-xs tracking-wider">VIEW</a></div>
      </article>`;
  }

  function renderFeatured() {
    const grid = $id('featuredHoodieGrid');
    if (!grid) return;
    const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
    grid.innerHTML = featuredProducts.length ? featuredProducts.map((product) => productCard(product, true)).join('') : '<p class="col-span-full text-center text-emerald-800">No featured WooCommerce products found.</p>';
    const fitControls = document.querySelector('.hoodie-fit-btn')?.parentElement;
    if (fitControls) fitControls.innerHTML = `<span class="px-4 py-2 font-anton text-sm text-emerald-900">FEATURED IN WOOCOMMERCE • ${featuredProducts.length} PRODUCTS</span>`;
  }

  function categoryButton(category, active) {
    const slug = category?.slug || 'all';
    const name = category?.name || 'All Products';
    const count = slug === 'all' ? products.length : products.filter((product) => hasCategory(product, slug)).length;
    return `<button type="button" data-store-category="${escapeHtml(slug)}" class="${active ? 'btn-glass-emerald' : 'btn-glass-white'} px-3.5 py-2 rounded-full font-anton text-xs sm:text-sm tracking-wider">${escapeHtml(name.toUpperCase())} (${count})</button>`;
  }

  function renderCategoryControls() {
    const allCataloguesButton = $id('allCataloguesBtn');
    if (allCataloguesButton) allCataloguesButton.textContent = `ALL CATALOGUES (${products.length})`;
    const controls = $id('categoryPillsRow');
    if (controls) controls.innerHTML = [null, ...categories].map((category) => categoryButton(category, (category?.slug || 'all') === state.category)).join('');
    $id('subCategoryPillsRow')?.classList.add('hidden');
    $id('seasonBar')?.classList.add('hidden');

    const departmentGrid = document.querySelector('[data-pillar]')?.parentElement;
    if (departmentGrid) {
      const top = categories.slice(0, 3);
      departmentGrid.innerHTML = top.map((category, index) => {
        const count = products.filter((product) => hasCategory(product, category.slug)).length;
        return `<button type="button" data-store-category="${escapeHtml(category.slug)}" class="glass-card text-emerald-950 p-4 rounded-2xl text-left flex items-center justify-between"><div><div class="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">CATEGORY 0${index + 1}</div><div class="font-anton text-2xl">${escapeHtml(category.name)}</div></div><span class="bg-emerald-100 text-emerald-900 font-anton text-xs px-2.5 py-1 rounded-full">${count} ITEMS</span></button>`;
      }).join('');
    }

    const visualControls = document.querySelector('[data-visual-filter]')?.parentElement;
    if (visualControls) visualControls.innerHTML = `<a href="${escapeHtml(store.cart_url)}" class="btn-glass-white px-4 py-2 rounded-full font-anton text-xs">VIEW CART</a><a href="${escapeHtml(store.checkout_url)}" class="btn-glass-emerald px-4 py-2 rounded-full font-anton text-xs">CHECKOUT</a>`;
  }

  function renderCatalogue() {
    const grid = $id('catalogueGrid');
    if (!grid) return;
    const filtered = products.filter((product) => hasCategory(product, state.category));
    grid.innerHTML = filtered.length ? filtered.map((product) => productCard(product, false)).join('') : '<div class="col-span-full glass-card rounded-3xl p-10 text-center font-anton text-2xl">NO PRODUCTS IN THIS CATEGORY</div>';
    const path = $id('activeBreadcrumbPath');
    if (path) path.textContent = state.category === 'all' ? `ALL WOOCOMMERCE PRODUCTS • ${products.length}` : `${categories.find((category) => category.slug === state.category)?.name || state.category} • ${filtered.length} PRODUCTS`;
  }

  function applyFragments(fragments) {
    if (!fragments) return;
    Object.entries(fragments).forEach(([selector, html]) => {
      document.querySelectorAll(selector).forEach((element) => element.outerHTML = html);
    });
  }

  async function addToCart(product, variation) {
    if (state.busy) return;
    state.busy = true;
    showToast('ADDING TO BAG…');
    const payload = new URLSearchParams({ product_id: String(product.id), quantity: '1' });
    let requestUrl = endpoint('add_to_cart');
    if (variation) {
      requestUrl = store.ajax_url;
      payload.set('action', 'noorie_add_variable_to_cart');
      payload.set('nonce', store.cart_nonce);
      payload.set('variation_id', String(variation.id));
      Object.entries(state.selected).forEach(([key, value]) => payload.set(key, value));
    }
    try {
      const response = await fetch(requestUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body: payload.toString() });
      const data = await response.json();
      if (data.success === false) {
        showToast(data.data?.message || 'COULD NOT ADD THIS VARIATION');
        return;
      }
      if (data.error) {
        window.location.href = data.product_url || product.url;
        return;
      }
      applyFragments(data.fragments);
      $(document.body).trigger('added_to_cart', [data.fragments, data.cart_hash, null]);
      closeProductModal();
      openCart();
      showToast(`ADDED: ${product.name}`);
    } catch (error) {
      showToast('COULD NOT ADD PRODUCT');
    } finally {
      state.busy = false;
    }
  }

  function matchingVariation(product) {
    if ((product.attributes || []).some((attribute) => !state.selected[attribute.key])) return null;
    return (product.variations || []).find((variation) => variation.purchasable && Object.entries(variation.attributes || {}).every(([key, value]) => !value || state.selected[key] === value));
  }

  function openProductModal(id) {
    const product = findProduct(id);
    if (!product) return;
    state.modalProduct = product;
    state.selected = {};
    (product.attributes || []).forEach((attribute) => { if (attribute.options.length === 1) state.selected[attribute.key] = attribute.options[0]; });

    $id('modalVisualContainer').innerHTML = `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover object-center"/>`;
    $id('modalPathBadge').textContent = categoryNames(product).toUpperCase();
    $id('modalProductTitle').textContent = product.name;
    $id('modalProductPrice').innerHTML = product.price_html || '';
    $id('modalProductSummary').textContent = product.description || 'Review the product details and add it securely through WooCommerce.';
    $id('modalSpecPills').innerHTML = [`${product.type} product`, product.stock, store.currency_code].map((item) => `<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center font-anton text-xs text-emerald-950">${escapeHtml(item.toUpperCase())}</div>`).join('');

    const attributeWrap = $id('modalAttributePanel');
    const colorWrap = $id('modalColorSwatches')?.parentElement;
    const sizeWrap = $id('modalSizeButtons')?.parentElement;
    if (colorWrap) colorWrap.classList.add('hidden');
    if (sizeWrap) sizeWrap.classList.add('hidden');
    if (attributeWrap) {
      attributeWrap.innerHTML = product.type === 'variable' ? `<div class="text-xs font-extrabold uppercase text-emerald-800 mb-2">SELECT OPTIONS:</div>${(product.attributes || []).map((attribute) => `<label class="block mb-3"><span class="block text-[11px] font-bold uppercase text-emerald-700 mb-1">${escapeHtml(attribute.name)}</span><select data-product-attribute="${escapeHtml(attribute.key)}" class="w-full px-3 py-2.5 rounded-xl border border-emerald-300 bg-white text-sm"><option value="">Choose ${escapeHtml(attribute.name)}</option>${attribute.options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option.replaceAll('-', ' '))}</option>`).join('')}</select></label>`).join('')}` : '<div class="text-xs font-bold text-emerald-700">READY TO ADD</div>';
    }

    const add = $id('modalAddToCartBtn');
    if (['grouped', 'external'].includes(product.type)) {
      add.textContent = 'VIEW PRODUCT'; add.disabled = false; add.dataset.mode = 'link';
    } else if (!product.purchasable && product.type !== 'variable') {
      add.textContent = 'OUT OF STOCK'; add.disabled = true; add.dataset.mode = 'disabled';
    } else {
      add.textContent = product.type === 'variable' ? 'SELECT OPTIONS' : 'ADD TO BAG'; add.disabled = product.type === 'variable'; add.dataset.mode = 'add';
    }
    const modal = $id('productModal'); modal.classList.remove('hidden'); modal.classList.add('flex');
  }

  function updateVariationSelection() {
    const product = state.modalProduct;
    if (!product || product.type !== 'variable') return;
    const variation = matchingVariation(product);
    const add = $id('modalAddToCartBtn');
    add.disabled = !variation;
    add.textContent = variation ? 'ADD SELECTED VARIATION' : 'SELECT ALL OPTIONS';
    if (variation) {
      $id('modalProductPrice').innerHTML = variation.price_html || product.price_html;
      $id('modalVisualContainer').innerHTML = `<img src="${escapeHtml(variation.image || product.image)}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover object-center"/>`;
    }
  }

  function closeProductModal() { const modal = $id('productModal'); if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } }
  function openCart() { const drawer = $id('cartDrawerBackdrop'); if (drawer) { drawer.classList.remove('hidden'); drawer.classList.add('flex'); } }
  function closeCart() { const drawer = $id('cartDrawerBackdrop'); if (drawer) { drawer.classList.add('hidden'); drawer.classList.remove('flex'); } }

  async function updateCartQuantity(key, quantity) {
    const payload = new URLSearchParams({ action: 'noorie_update_cart', nonce: store.cart_nonce, cart_key: key, quantity: String(quantity) });
    try {
      const response = await fetch(store.ajax_url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body: payload.toString() });
      const result = await response.json();
      if (!result.success) throw new Error('Cart update failed');
      $id('noorieCartContents').outerHTML = result.data.html;
      const count = $id('cartCountBadge'); if (count) count.textContent = result.data.count;
    } catch (error) { showToast('COULD NOT UPDATE BAG'); }
  }

  function initEditorialInteractions() {
    const hero = $id('heroMainImg');
    const heroViews = {
      duo: [assets.heroDuo, 'DHAKA LOOKBOOK • BANGLADESHI MODELS', 'EMERALD OVERSIZED • PEARL WHITE NORMAL FIT'],
      oversized: [assets.hoodieEmeraldOversized, 'OVERSIZED FIT', 'DROP SHOULDER • RELAXED ARCHITECTURAL DRAPE'],
      normal: [assets.hoodieWhiteNormal, 'NORMAL FIT', 'CLASSIC SHOULDER • CLEAN EVERYDAY SILHOUETTE'],
      macro: [assets.macroFleece, '400 GSM MACRO', 'BRUSHED FLEECE • COMPACT KNIT CONSTRUCTION']
    };
    document.querySelectorAll('[data-hero-preset]').forEach((button) => button.addEventListener('click', () => { const view = heroViews[button.dataset.heroPreset]; if (hero && view?.[0]) hero.src = view[0]; if ($id('heroCaptionBadge')) $id('heroCaptionBadge').textContent = view?.[1] || ''; if ($id('heroCaptionTitle')) $id('heroCaptionTitle').textContent = view?.[2] || ''; }));

    const loupeImages = { macro: assets.macroFleece, oversized: assets.hoodieEmeraldOversized, normal: assets.hoodieWhiteNormal, mint: assets.hoodieMintNormal };
    document.querySelectorAll('[data-loupe-view]').forEach((button) => button.addEventListener('click', () => { const src = loupeImages[button.dataset.loupeView]; if (src && $id('loupeBaseImg')) $id('loupeBaseImg').src = src; document.querySelectorAll('[data-loupe-view]').forEach((item) => item.className = item === button ? 'loupe-view-btn btn-glass-emerald px-4 py-2 rounded-full font-anton text-xs sm:text-sm tracking-wider' : 'loupe-view-btn btn-glass-white px-4 py-2 rounded-full font-anton text-xs sm:text-sm tracking-wider'); }));

    const box = $id('mainLoupeBox'), image = $id('loupeBaseImg'), lens = $id('loupeLens');
    if (box && image && lens) box.addEventListener('mousemove', (event) => { const rect = box.getBoundingClientRect(); const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left)); const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top)); lens.style.left = `${x - lens.offsetWidth / 2}px`; lens.style.top = `${y - lens.offsetHeight / 2}px`; lens.style.backgroundImage = `url('${image.src}')`; lens.style.backgroundSize = `${rect.width * 2.4}px ${rect.height * 2.4}px`; lens.style.backgroundPosition = `-${x * 2.4 - lens.offsetWidth / 2}px -${y * 2.4 - lens.offsetHeight / 2}px`; if ($id('loupeZoomCoord')) $id('loupeZoomCoord').textContent = `2.5× LOUPE (${Math.round(x / rect.width * 100)}%, ${Math.round(y / rect.height * 100)}%)`; });

    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }), { threshold: 0.08 });
    document.querySelectorAll('.reveal-on-scroll').forEach((element) => observer.observe(element));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const existingCart = $id('noorieCartContents');
    if (existingCart && store.cart_html) existingCart.outerHTML = store.cart_html;
    renderFeatured(); renderCategoryControls(); renderCatalogue(); initEditorialInteractions();

    document.body.addEventListener('change', (event) => {
      const select = event.target.closest('[data-product-attribute]');
      if (!select) return;
      state.selected[select.dataset.productAttribute] = select.value;
      updateVariationSelection();
    });

    document.body.addEventListener('click', (event) => {
      const scroll = event.target.closest('[data-nav-scroll]');
      if (scroll) { document.querySelector(scroll.dataset.navScroll)?.scrollIntoView({ behavior: 'smooth' }); $id('mobileMenuDrawer')?.classList.add('hidden'); return; }
      const category = event.target.closest('[data-store-category]');
      if (category) { state.category = category.dataset.storeCategory; renderCategoryControls(); renderCatalogue(); $id('fullCatalogues')?.scrollIntoView({ behavior: 'smooth' }); return; }
      const dept = event.target.closest('[data-dept-jump]');
      if (dept) { const map = { 'fashion-winter': 'hoodies', 'fashion-summer': 'tshirts', accessories: 'accessories', 'arts-crafts': 'decor' }; state.category = map[dept.dataset.deptJump] || 'all'; renderCategoryControls(); renderCatalogue(); $id('fullCatalogues')?.scrollIntoView({ behavior: 'smooth' }); return; }
      const add = event.target.closest('[data-real-add]'); if (add) { const product = findProduct(add.dataset.realAdd); if (product) addToCart(product); return; }
      const open = event.target.closest('[data-open-product]'); if (open) { openProductModal(open.dataset.openProduct); return; }
      const link = event.target.closest('[data-product-link]'); if (link) { window.location.href = link.dataset.productLink; return; }
      const qty = event.target.closest('[data-cart-qty]'); if (qty) { updateCartQuantity(qty.dataset.cartQty, qty.dataset.qty); return; }
      if (event.target.closest('#openCartBtn')) { openCart(); return; }
      if (event.target.closest('#closeCartBtn') || (event.target === $id('cartDrawerBackdrop'))) { closeCart(); return; }
      if (event.target.closest('#closeProductModalBtn')) { closeProductModal(); return; }
      if (event.target.closest('#modalAddToCartBtn')) { const product = state.modalProduct; if (!product) return; if (['grouped', 'external'].includes(product.type)) window.location.href = product.url; else addToCart(product, product.type === 'variable' ? matchingVariation(product) : null); return; }
      if (event.target.closest('#mobileMenuBtn')) { $id('mobileMenuDrawer')?.classList.toggle('hidden'); return; }
      if (event.target.closest('#openSizeGuideBtn') || event.target.closest('#openSizeGuideFromStudio')) { const modal = $id('sizeGuideModal'); modal?.classList.remove('hidden'); modal?.classList.add('flex'); return; }
      if (event.target.closest('#closeSizeGuideBtn') || event.target.closest('#gotItSizeBtn')) { const modal = $id('sizeGuideModal'); modal?.classList.add('hidden'); modal?.classList.remove('flex'); }
    });
  });
})(jQuery);
