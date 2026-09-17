/**
 * ZENVY WEAR — MAIN SHARED CLIENT CONTROLLER
 * Tagline: Wear Your Confidence.
 */

const API_BASE = '/api';

// State & Storage Helpers
const Storage = {
  getToken: () => localStorage.getItem('zenvy_token'),
  setToken: (token) => localStorage.setItem('zenvy_token', token),
  removeToken: () => localStorage.removeItem('zenvy_token'),
  
  getUser: () => {
    try {
      const u = localStorage.getItem('zenvy_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('zenvy_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('zenvy_user'),

  getSessionId: () => {
    let sid = localStorage.getItem('zenvy_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('zenvy_session_id', sid);
    }
    return sid;
  }
};

// API Fetcher Helper
async function apiRequest(endpoint, options = {}) {
  const token = Storage.getToken();
  const sessionId = Storage.getSessionId();

  const headers = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error('API Error:', error);
    return { ok: false, status: 500, data: { success: false, message: 'Network error or server unavailable.' } };
  }
}

// Currency Formatter for Bangladesh Taka (৳)
function formatBDT(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '৳0';
  return '৳ ' + Math.round(amount).toLocaleString('en-IN');
}

// Global Toast Notifications
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  if (type === 'info') icon = 'fa-info-circle';

  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Update Cart and Wishlist Counters in Navigation
async function updateNavBadges() {
  const cartBadge = document.getElementById('nav-cart-badge');
  const wishlistBadge = document.getElementById('nav-wishlist-badge');

  // Fetch Cart Count
  try {
    const cartRes = await apiRequest('/cart');
    if (cartRes.ok && cartRes.data.summary) {
      const count = cartRes.data.summary.itemCount || 0;
      if (cartBadge) {
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'block' : 'none';
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Fetch Wishlist Count
  try {
    const wishRes = await apiRequest('/wishlist');
    if (wishRes.ok && wishRes.data) {
      const count = wishRes.data.count || 0;
      if (wishlistBadge) {
        wishlistBadge.textContent = count;
        wishlistBadge.style.display = count > 0 ? 'block' : 'none';
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// Setup User Account Navigation links
function setupUserNav() {
  const user = Storage.getUser();
  const accountLinks = document.querySelectorAll('.nav-account-link');
  const userGreeting = document.getElementById('user-nav-greeting');

  accountLinks.forEach(link => {
    if (user) {
      link.href = user.role === 'admin' ? '/admin/dashboard.html' : '/profile.html';
      link.title = `Signed in as ${user.name}`;
    } else {
      link.href = '/login.html';
      link.title = 'Sign In / Register';
    }
  });

  if (userGreeting && user) {
    userGreeting.textContent = user.name.split(' ')[0];
  }
}

// Mobile Menu Drawer Handler
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const closeBtn = document.getElementById('mobile-nav-close');

  if (!drawer) return;

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeMenu = () => {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeMenu();
  });
}

// Quick View Modal
let currentQuickViewProduct = null;

async function openQuickView(productId) {
  let modal = document.getElementById('quickview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickview-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog" style="padding: 24px;">
        <button class="modal-close-btn" onclick="closeQuickView()"><i class="fas fa-times"></i></button>
        <div id="quickview-content">
          <div style="text-align:center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeQuickView();
    });
  }

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  const res = await apiRequest(`/products/${productId}`);
  if (!res.ok) {
    showToast('Could not load product details', 'error');
    closeQuickView();
    return;
  }

  const p = res.data.product;
  currentQuickViewProduct = p;

  const content = document.getElementById('quickview-content');
  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 32px; align-items: start;">
      <div>
        <img id="qv-main-img" src="${p.images[0]}" alt="${p.name}" style="width:100%; border-radius: 6px; object-fit: cover; aspect-ratio: 4/5;">
        <div style="display: flex; gap: 10px; margin-top: 12px; overflow-x: auto;">
          ${p.images.map((img, i) => `
            <img src="${img}" onclick="document.getElementById('qv-main-img').src='${img}'" style="width: 60px; height: 75px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 1px solid #ddd;">
          `).join('')}
        </div>
      </div>
      <div>
        <span class="section-tag">${p.category}</span>
        <h3 style="font-family: var(--font-display); font-size: 1.8rem; margin: 4px 0 12px;">${p.name}</h3>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <div style="color: #f59e0b; font-size: 0.85rem;"><i class="fas fa-star"></i> ${p.rating}</div>
          <span style="color: #71717a; font-size: 0.8rem;">(${p.numReviews} customer reviews)</span>
          <span style="font-size: 0.8rem; font-weight: 600; color: ${p.stock > 0 ? '#16a34a' : '#dc2626'}; margin-left: 12px;">
            ${p.stock > 0 ? `In Stock (${p.stock} left)` : 'Out of Stock'}
          </span>
        </div>

        <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px;">
          <span style="font-size: 1.6rem; font-weight: 700;">${formatBDT(p.discountPrice || p.price)}</span>
          ${p.discountPrice ? `<span style="font-size: 1.1rem; color: #71717a; text-decoration: line-through;">${formatBDT(p.price)}</span>` : ''}
          ${p.discountPercentage ? `<span class="badge badge-discount">-${p.discountPercentage}% OFF</span>` : ''}
        </div>

        <p style="color: #52525b; font-size: 0.92rem; line-height: 1.6; margin-bottom: 24px;">${p.description}</p>

        <!-- Color Selection -->
        <div style="margin-bottom: 18px;">
          <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 8px;">Select Color: <span id="qv-selected-color" style="font-weight: 400; color:#71717a;">${p.colors[0]}</span></label>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;" id="qv-color-container">
            ${p.colors.map((c, i) => `
              <button type="button" class="qv-color-btn ${i === 0 ? 'active' : ''}" data-color="${c}" onclick="selectQuickViewColor(this, '${c}')" style="padding: 6px 14px; border: 1px solid ${i === 0 ? '#111' : '#ddd'}; border-radius: 4px; font-size: 0.82rem; font-weight: 500; background: ${i === 0 ? '#111' : '#fff'}; color: ${i === 0 ? '#fff' : '#111'};">
                ${c}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Size Selection -->
        <div style="margin-bottom: 24px;">
          <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 8px;">Select Size: <span id="qv-selected-size" style="font-weight: 400; color:#71717a;">${p.sizes[0]}</span></label>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;" id="qv-size-container">
            ${p.sizes.map((s, i) => `
              <button type="button" class="qv-size-btn ${i === 0 ? 'active' : ''}" data-size="${s}" onclick="selectQuickViewSize(this, '${s}')" style="min-width: 44px; height: 40px; border: 1px solid ${i === 0 ? '#111' : '#ddd'}; border-radius: 4px; font-size: 0.85rem; font-weight: 600; background: ${i === 0 ? '#111' : '#fff'}; color: ${i === 0 ? '#fff' : '#111'};">
                ${s}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; height: 48px;">
            <button onclick="adjustQuickViewQty(-1)" style="padding: 0 14px; height: 100%;"><i class="fas fa-minus"></i></button>
            <input id="qv-qty-input" type="number" value="1" min="1" max="${p.stock}" style="width: 45px; text-align: center; font-weight: 600;">
            <button onclick="adjustQuickViewQty(1)" style="padding: 0 14px; height: 100%;"><i class="fas fa-plus"></i></button>
          </div>

          <button class="btn btn-primary" style="flex: 1; height: 48px;" onclick="addQuickViewToCart()">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>

          <button class="btn-icon" style="width: 48px; height: 48px; border: 1px solid #ddd;" onclick="toggleWishlistQuickView('${p._id}', this)">
            <i class="far fa-heart"></i>
          </button>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 16px; font-size: 0.82rem; color: #71717a;">
          <p><i class="fas fa-truck" style="margin-right: 8px;"></i> Express delivery across Bangladesh (24h in Dhaka)</p>
          <p style="margin-top: 6px;"><i class="fas fa-shield-alt" style="margin-right: 8px;"></i> 100% Original Brand Warranty with 7-day hassle-free exchange</p>
        </div>
      </div>
    </div>
  `;
}

function closeQuickView() {
  const modal = document.getElementById('quickview-modal');
  if (modal) modal.classList.remove('show');
  document.body.style.overflow = '';
}

function selectQuickViewColor(btn, color) {
  document.querySelectorAll('.qv-color-btn').forEach(b => {
    b.style.background = '#fff';
    b.style.color = '#111';
    b.style.borderColor = '#ddd';
  });
  btn.style.background = '#111';
  btn.style.color = '#fff';
  btn.style.borderColor = '#111';
  document.getElementById('qv-selected-color').textContent = color;
}

function selectQuickViewSize(btn, size) {
  document.querySelectorAll('.qv-size-btn').forEach(b => {
    b.style.background = '#fff';
    b.style.color = '#111';
    b.style.borderColor = '#ddd';
  });
  btn.style.background = '#111';
  btn.style.color = '#fff';
  btn.style.borderColor = '#111';
  document.getElementById('qv-selected-size').textContent = size;
}

function adjustQuickViewQty(delta) {
  const input = document.getElementById('qv-qty-input');
  if (!input || !currentQuickViewProduct) return;
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(currentQuickViewProduct.stock || 10, val + delta));
  input.value = val;
}

async function addQuickViewToCart() {
  if (!currentQuickViewProduct) return;
  const color = document.getElementById('qv-selected-color').textContent;
  const size = document.getElementById('qv-selected-size').textContent;
  const quantity = parseInt(document.getElementById('qv-qty-input').value) || 1;

  const res = await apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({
      productId: currentQuickViewProduct._id,
      color,
      size,
      quantity
    })
  });

  if (res.ok) {
    showToast(`${currentQuickViewProduct.name} added to cart!`, 'success');
    updateNavBadges();
    closeQuickView();
  } else {
    showToast(res.data.message || 'Failed to add item', 'error');
  }
}

async function toggleWishlistQuickView(productId, btn) {
  const res = await apiRequest('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId })
  });

  if (res.ok) {
    const inWishlist = res.data.inWishlist;
    const icon = btn.querySelector('i');
    if (inWishlist) {
      icon.className = 'fas fa-heart';
      btn.style.color = '#dc2626';
      showToast('Saved to your wishlist', 'success');
    } else {
      icon.className = 'far fa-heart';
      btn.style.color = '#111';
      showToast('Removed from wishlist', 'info');
    }
    updateNavBadges();
  }
}

// Global Wishlist Toggle for product cards
async function toggleWishlist(productId, btnEvent) {
  if (btnEvent && btnEvent.stopPropagation) {
    btnEvent.stopPropagation();
  }

  const res = await apiRequest('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId })
  });

  if (res.ok) {
    const inWishlist = res.data.inWishlist;
    showToast(inWishlist ? 'Saved to your wishlist' : 'Removed from wishlist', inWishlist ? 'success' : 'info');
    updateNavBadges();
    
    // update button if provided
    if (btnEvent && btnEvent.currentTarget) {
      const btn = btnEvent.currentTarget;
      const icon = btn.querySelector('i');
      if (inWishlist) {
        btn.classList.add('active');
        if (icon) icon.className = 'fas fa-heart';
      } else {
        btn.classList.remove('active');
        if (icon) icon.className = 'far fa-heart';
      }
    }
  } else {
    showToast('Please sign in to save wishlist items', 'info');
  }
}

// Quick Add to Cart (single click from card)
async function quickAddToCart(productId, event) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }

  const res = await apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity: 1 })
  });

  if (res.ok) {
    showToast('Added to your shopping cart!', 'success');
    updateNavBadges();
  } else {
    showToast(res.data.message || 'Could not add to cart', 'error');
  }
}

// Compare Manager
const CompareManager = {
  getIds: () => {
    try {
      const stored = localStorage.getItem('zenvy_compare_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  saveIds: (ids) => localStorage.setItem('zenvy_compare_ids', JSON.stringify(ids)),
  toggle: async (productId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    let ids = CompareManager.getIds();
    const exists = ids.includes(productId);
    if (exists) {
      ids = ids.filter(id => id !== productId);
      CompareManager.saveIds(ids);
      showToast('Removed from product comparison', 'info');
    } else {
      if (ids.length >= 4) {
        showToast('You can compare a maximum of 4 items simultaneously.', 'info');
        return;
      }
      ids.push(productId);
      CompareManager.saveIds(ids);
      showToast('Added to product comparison', 'success');
    }
    CompareManager.renderDrawer();
    updateCompareButtons();
  },
  remove: (productId) => {
    let ids = CompareManager.getIds().filter(id => id !== productId);
    CompareManager.saveIds(ids);
    CompareManager.renderDrawer();
    updateCompareButtons();
  },
  clear: () => {
    CompareManager.saveIds([]);
    CompareManager.renderDrawer();
    updateCompareButtons();
  },
  renderDrawer: async () => {
    let drawer = document.getElementById('compare-drawer');
    const ids = CompareManager.getIds();

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'compare-drawer';
      drawer.className = 'compare-drawer';
      document.body.appendChild(drawer);
    }

    if (ids.length === 0) {
      drawer.classList.remove('active');
      return;
    }

    // Fetch brief products info for thumbnails
    const res = await apiRequest(`/products/compare?ids=${ids.join(',')}`);
    const products = (res.ok && res.data && res.data.products) ? res.data.products : [];

    drawer.classList.add('active');
    drawer.innerHTML = `
      <div class="compare-drawer-inner">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-weight: 700; font-size: 0.95rem;">
            <i class="fas fa-columns" style="margin-right: 6px;"></i> Compare Products (${products.length}/4)
          </div>
          <div class="compare-items-thumbs">
            ${[0, 1, 2, 3].map(index => {
              const p = products[index];
              if (p) {
                return `
                  <div class="compare-thumb-slot" title="${p.name}">
                    <img src="${p.images[0]}" alt="${p.name}">
                    <div class="compare-thumb-remove" onclick="CompareManager.remove('${p._id}')">&times;</div>
                  </div>
                `;
              }
              return `<div class="compare-thumb-slot"><span style="color:#d4d4d8; font-size:0.75rem;">Slot ${index+1}</span></div>`;
            }).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 12px; align-items: center;">
          <button class="btn btn-sm btn-secondary" onclick="CompareManager.clear()">Clear</button>
          <a href="/compare.html" class="btn btn-sm btn-primary">
            Compare Now <i class="fas fa-arrow-right" style="font-size:0.75rem; margin-left:4px;"></i>
          </a>
        </div>
      </div>
    `;
  }
};

function updateCompareButtons() {
  const ids = CompareManager.getIds();
  document.querySelectorAll('.btn-quick-compare').forEach(btn => {
    const pid = btn.getAttribute('data-product-id');
    if (ids.includes(pid)) {
      btn.classList.add('active');
      btn.style.color = '#ef4444';
      btn.title = 'Remove from Compare';
    } else {
      btn.classList.remove('active');
      btn.style.color = '';
      btn.title = 'Compare with other products';
    }
  });

  const compareBadge = document.getElementById('nav-compare-badge');
  if (compareBadge) {
    compareBadge.textContent = ids.length;
    compareBadge.style.display = ids.length > 0 ? 'block' : 'none';
  }
}

// Product Card HTML Generator
function generateProductCardHTML(p, inWishlist = false) {
  const currentPrice = p.discountPrice || p.price;
  const secondImage = p.images[1] || p.images[0];
  const compareIds = CompareManager.getIds();
  const inCompare = compareIds.includes(p._id);

  return `
    <div class="product-card" id="card-${p._id}">
      <div class="product-image-container" onclick="window.location.href='/product.html?id=${p._id}'" style="cursor: pointer;">
        <img class="product-img img-primary" src="${p.images[0]}" alt="${p.name}" loading="lazy">
        <img class="product-img img-secondary" src="${secondImage}" alt="${p.name}" loading="lazy">
        
        <div class="product-badges">
          ${p.isFlashSale ? `<span class="badge" style="background:#ef4444; color:#fff;"><i class="fas fa-bolt"></i> Flash Deal</span>` : ''}
          ${p.discountPercentage ? `<span class="badge badge-discount">-${p.discountPercentage}%</span>` : ''}
          ${p.isNewArrival ? `<span class="badge badge-new">New</span>` : ''}
          ${p.stock <= 0 ? `<span class="badge badge-out-stock">Sold Out</span>` : ''}
        </div>

        <div style="position: absolute; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 8px; z-index: 5;">
          <button class="product-wishlist-btn ${inWishlist ? 'active' : ''}" onclick="toggleWishlist('${p._id}', event)" title="Add to Wishlist" style="position: static;">
            <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="btn-quick-compare" data-product-id="${p._id}" onclick="CompareManager.toggle('${p._id}', event)" title="Compare" style="width: 36px; height: 36px; border-radius: 50%; background: #ffffff; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: ${inCompare ? '#ef4444' : '#111'}; transition: var(--transition-fast);">
            <i class="fas fa-columns"></i>
          </button>
        </div>

        <div class="product-hover-actions">
          <button class="btn-quick-view" onclick="event.stopPropagation(); openQuickView('${p._id}')">
            Quick View
          </button>
          <button class="btn-quick-cart" onclick="quickAddToCart('${p._id}', event)" title="Add to Cart">
            <i class="fas fa-shopping-bag"></i>
          </button>
        </div>
      </div>

      <div class="product-info">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
          <span class="product-category">${p.category}</span>
          ${p.sellerName ? `
            <a href="/seller-store.html?id=${p.sellerId || ''}" class="seller-tag-badge" style="text-decoration: none;" onclick="event.stopPropagation();">
              <i class="fas fa-store" style="font-size: 0.65rem;"></i> ${p.sellerName.length > 18 ? p.sellerName.substring(0, 18) + '...' : p.sellerName}
            </a>
          ` : ''}
        </div>

        <a href="/product.html?id=${p._id}" class="product-title" title="${p.name}">${p.name}</a>
        
        <div class="product-rating">
          <div>
            ${[1, 2, 3, 4, 5].map(star => `
              <i class="${star <= Math.round(p.rating) ? 'fas' : 'far'} fa-star"></i>
            `).join('')}
          </div>
          <span class="rating-count">(${p.numReviews || 0})</span>
        </div>

        <div class="product-price-wrapper">
          <span class="price-current">${formatBDT(currentPrice)}</span>
          ${p.discountPrice ? `<span class="price-original">${formatBDT(p.price)}</span>` : ''}
          ${p.discountPercentage ? `<span class="price-discount-tag">${p.discountPercentage}% OFF</span>` : ''}
        </div>

        ${p.isFlashSale ? `
          <div class="flash-claimed-bar-wrapper">
            <div class="flash-claimed-bar">
              <div class="flash-claimed-fill" style="width: ${Math.min(95, Math.max(20, (p.soldCount || 15) * 2))}%;"></div>
            </div>
            <div class="flash-claimed-label">
              <span>Sold: ${p.soldCount || 18}</span>
              <span style="color:#ef4444;">Only ${p.stock || 5} left</span>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Categories Mega-Menu Loader
let globalCategoriesData = [];

async function setupCategoriesMegaMenu() {
  const container = document.getElementById('categories-megamenu-container');
  const trigger = document.getElementById('marketplace-categories-trigger');
  const menu = document.getElementById('categories-megamenu');

  if (!container || !trigger || !menu) return;

  // Toggle open
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('active');
    if (isOpen) {
      menu.classList.remove('active');
      trigger.classList.remove('open');
    } else {
      menu.classList.add('active');
      trigger.classList.add('open');
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      menu.classList.remove('active');
      trigger.classList.remove('open');
    }
  });

  // Fetch categories
  const res = await apiRequest('/categories');
  if (res.ok && res.data && res.data.data) {
    globalCategoriesData = res.data.data;
    renderMegaMenu(globalCategoriesData);
  }
}

function renderMegaMenu(categories) {
  const menu = document.getElementById('categories-megamenu');
  if (!menu) return;

  menu.innerHTML = `
    <div class="megamenu-category-list" id="megamenu-cat-list">
      ${categories.map((c, i) => `
        <div class="megamenu-cat-item ${i === 0 ? 'active' : ''}" data-cat-id="${c._id}" onmouseenter="showCategoryDetails('${c._id}')" onclick="window.location.href='/shop.html?category=${encodeURIComponent(c.name)}'">
          <div style="display: flex; align-items: center;">
            <span class="cat-icon"><i class="${c.icon || 'fas fa-th-large'}"></i></span>
            <span>${c.name}</span>
          </div>
          <span class="cat-count">${c.productCount || 0}</span>
        </div>
      `).join('')}
    </div>

    <div class="megamenu-details-pane" id="megamenu-details-pane">
      <!-- Populated dynamically -->
    </div>
  `;

  if (categories.length > 0) {
    showCategoryDetails(categories[0]._id);
  }
}

function showCategoryDetails(catId) {
  const cat = globalCategoriesData.find(c => c._id === catId);
  const pane = document.getElementById('megamenu-details-pane');
  if (!cat || !pane) return;

  // Update active item styling in list
  document.querySelectorAll('.megamenu-cat-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-cat-id') === catId);
  });

  pane.innerHTML = `
    <div class="megamenu-details-header">
      <div style="width: 44px; height: 44px; border-radius: 8px; background: #f4f4f5; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #111;">
        <i class="${cat.icon || 'fas fa-tag'}"></i>
      </div>
      <div>
        <h4 style="margin: 0;">${cat.name}</h4>
        <p style="font-size: 0.8rem; color: #71717a; margin: 2px 0 0;">${cat.description || 'Explore verified marketplace selections'}</p>
      </div>
    </div>

    <div style="margin-bottom: 12px; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">
      Popular Subcategories
    </div>

    <div class="megamenu-subcats-grid">
      ${(cat.subcategories || []).map(sub => `
        <a href="/shop.html?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}" class="megamenu-subcat-link">
          <i class="fas fa-chevron-right" style="font-size: 0.65rem; color: #a1a1aa;"></i>
          <span>${sub}</span>
        </a>
      `).join('')}
    </div>

    <div class="megamenu-banner-promo">
      <img src="${cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800'}" alt="${cat.name}">
      <div class="megamenu-banner-promo-content">
        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #ef4444; font-weight: 700;">Verified Quality</span>
        <h5 style="font-size: 1.1rem; margin: 4px 0 10px; font-weight: 700;">Featured In ${cat.name}</h5>
        <a href="/shop.html?category=${encodeURIComponent(cat.name)}" class="btn btn-sm btn-primary" style="background:#fff; color:#111;">
          Explore All ${cat.name} <i class="fas fa-arrow-right" style="font-size:0.7rem; margin-left:4px;"></i>
        </a>
      </div>
    </div>
  `;
}

// Flash Sale Countdown Timer
function startFlashSaleTimer(targetElementId = 'flash-countdown') {
  const container = document.getElementById(targetElementId);
  if (!container) return;

  function update() {
    const now = new Date();
    // Daily midnight countdown or fixed 12-hour cycle
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();

    if (diff <= 0) {
      container.innerHTML = `<span>Ending soon</span>`;
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    container.innerHTML = `
      <div class="flash-timer-wrapper">
        <div class="flash-timer-box">${pad(hours)}</div>
        <span class="flash-timer-sep">:</span>
        <div class="flash-timer-box">${pad(mins)}</div>
        <span class="flash-timer-sep">:</span>
        <div class="flash-timer-box">${pad(secs)}</div>
      </div>
    `;
  }

  update();
  setInterval(update, 1000);
}

// Newsletter Handler
function setupNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      if (email) {
        showToast('Thank you for subscribing! Promo code ZENVY10 sent to your email.', 'success');
        form.reset();
      }
    });
  }
}

// Search Modal / Input redirect
function setupSearch() {
  const searchInputs = document.querySelectorAll('.nav-search-input');
  searchInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.href = `/shop.html?search=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });
}

// Founder Photo Upload & Synchronization
function setupFounderPhotoUpload() {
  const uploadInput = document.getElementById('founder-photo-upload');
  const imgElement = document.getElementById('founder-profile-img');
  
  // Check if there is a cached custom uploaded photo in localStorage
  const cachedPhoto = localStorage.getItem('zenvy_founder_photo_preview');
  if (cachedPhoto && imgElement) {
    imgElement.src = cachedPhoto;
  }

  if (uploadInput && imgElement) {
    uploadInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;
        // Instant client-side preview
        imgElement.src = base64Data;
        try {
          localStorage.setItem('zenvy_founder_photo_preview', base64Data);
        } catch {
          // ignore quota
        }

        showToast('Saving photo to assets/images/masum-parvej.jpg...', 'info');

        try {
          const res = await apiRequest('/upload-founder-photo', {
            method: 'POST',
            body: JSON.stringify({ imageBase64: base64Data })
          });

          if (res.ok && res.data.success) {
            showToast('Profile photo saved to client/assets/images/masum-parvej.jpg!', 'success');
            imgElement.src = res.data.url;
          } else {
            showToast('Photo updated in preview. You can also copy it to client/assets/images/masum-parvej.jpg', 'info');
          }
        } catch (err) {
          showToast('Photo updated in preview.', 'info');
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  setupUserNav();
  setupMobileMenu();
  setupNewsletter();
  setupSearch();
  setupCategoriesMegaMenu();
  setupFounderPhotoUpload();
  CompareManager.renderDrawer();
  updateNavBadges();
  updateCompareButtons();
});
