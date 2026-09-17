/**
 * ZENVY WEAR — PRODUCT CATALOG & DETAILS CONTROLLER
 */

// Home Page Loader: Flash Sales, Categories, Sellers & New Arrivals
async function loadHomeContent() {
  const flashSalesGrid = document.getElementById('home-flash-sales-grid');
  const categoriesGrid = document.getElementById('home-categories-grid');
  const sellersGrid = document.getElementById('home-sellers-grid');
  const newArrivalsGrid = document.getElementById('home-new-arrivals-grid');

  // Start countdown timer
  startFlashSaleTimer('flash-countdown');

  // 1. Load Flash Sales
  if (flashSalesGrid) {
    const flashRes = await apiRequest('/products/flash-sales?limit=4');
    const wishRes = await apiRequest('/wishlist');
    const wishIds = (wishRes.ok && wishRes.data && wishRes.data.productIds) ? wishRes.data.productIds : [];

    if (flashRes.ok && flashRes.data && flashRes.data.products) {
      flashSalesGrid.innerHTML = flashRes.data.products.map(p =>
        generateProductCardHTML(p, wishIds.includes(p._id))
      ).join('');
    } else {
      flashSalesGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #71717a;">Flash sale items will refresh shortly.</div>`;
    }
  }

  // 2. Load All 17 Categories
  if (categoriesGrid) {
    const catRes = await apiRequest('/categories');
    if (catRes.ok && catRes.data && catRes.data.data) {
      categoriesGrid.innerHTML = catRes.data.data.map(c => `
        <div class="category-card" onclick="window.location.href='/shop.html?category=${encodeURIComponent(c.name)}'" style="border-radius: var(--radius-md); overflow: hidden; position: relative; aspect-ratio: 1/1; cursor: pointer;">
          <img src="${c.image}" alt="${c.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;">
          <div class="category-card-overlay" style="background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%); padding: 16px; display: flex; flex-direction: column; justify-content: flex-end;">
            <div style="display: flex; align-items: center; gap: 6px; color: #fff; font-size: 0.85rem; margin-bottom: 2px;">
              <i class="${c.icon || 'fas fa-tag'}" style="color: #ef4444; font-size: 0.8rem;"></i>
              <span style="font-weight: 700; font-size: 0.95rem;">${c.name}</span>
            </div>
            <span style="font-size: 0.75rem; color: #d4d4d8;">${c.productCount || 0} Products</span>
          </div>
        </div>
      `).join('');
    }
  }

  // 3. Load Verified Marketplace Sellers
  if (sellersGrid) {
    const sellersRes = await apiRequest('/sellers?status=approved');
    if (sellersRes.ok && sellersRes.data && sellersRes.data.sellers) {
      sellersGrid.innerHTML = sellersRes.data.sellers.slice(0, 5).map(s => `
        <div class="seller-card" style="background: #ffffff; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
          <div style="height: 90px; background: #111; position: relative; overflow: hidden;">
            <img src="${s.banner}" alt="${s.storeName}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5;">
            <div style="position: absolute; top: 10px; right: 10px;">
              <span class="seller-tag-badge seller-tag-official"><i class="fas fa-certificate"></i> Verified</span>
            </div>
          </div>
          <div style="padding: 16px; position: relative; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="margin-top: -36px; margin-bottom: 12px; display: flex; align-items: flex-end; gap: 12px;">
              <img src="${s.logo}" alt="${s.storeName}" style="width: 52px; height: 52px; border-radius: 50%; border: 3px solid #fff; box-shadow: var(--shadow-md); object-fit: cover; background: #fff;">
              <div>
                <h4 style="font-size: 1rem; font-weight: 700; margin: 0;">${s.storeName}</h4>
                <span style="font-size: 0.75rem; color: #71717a;">${s.category}</span>
              </div>
            </div>

            <p style="font-size: 0.8rem; color: #52525b; line-height: 1.5; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${s.description}
            </p>

            <div style="display: flex; justify-content: space-between; border-top: 1px solid #f0f0f0; padding-top: 10px; font-size: 0.78rem; color: #71717a; margin-bottom: 14px;">
              <div><strong style="color: #111;">${s.rating}</strong> <i class="fas fa-star" style="color: #f59e0b; font-size: 0.7rem;"></i> Rating</div>
              <div><strong style="color: #16a34a;">${s.positiveResponseRate}%</strong> Positive</div>
            </div>

            <a href="/seller-store.html?id=${s._id}" class="btn btn-secondary btn-sm" style="width: 100%; text-align: center;">
              Visit Store <i class="fas fa-arrow-right" style="font-size: 0.7rem; margin-left: 4px;"></i>
            </a>
          </div>
        </div>
      `).join('');
    }
  }

  // 4. Load New Arrivals / Spotlight
  if (newArrivalsGrid) {
    const prodRes = await apiRequest('/products?limit=8');
    const wishRes = await apiRequest('/wishlist');
    const wishIds = (wishRes.ok && wishRes.data && wishRes.data.productIds) ? wishRes.data.productIds : [];

    if (prodRes.ok && prodRes.data && prodRes.data.data) {
      newArrivalsGrid.innerHTML = prodRes.data.data.map(p =>
        generateProductCardHTML(p, wishIds.includes(p._id))
      ).join('');
    }
  }
}

// Shop Page Filters & Pagination
const ShopState = {
  category: 'all',
  gender: 'all',
  search: '',
  size: '',
  color: '',
  minPrice: 0,
  maxPrice: 6000,
  rating: 0,
  sort: 'newest',
  page: 1,
  limit: 9
};

async function initShopPage() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('category')) ShopState.category = urlParams.get('category');
  if (urlParams.get('gender')) ShopState.gender = urlParams.get('gender');
  if (urlParams.get('search')) ShopState.search = urlParams.get('search');
  if (urlParams.get('sort')) ShopState.sort = urlParams.get('sort');

  // Initialize UI inputs from state
  const searchInput = document.getElementById('shop-search-input');
  if (searchInput && ShopState.search) searchInput.value = ShopState.search;

  const sortSelect = document.getElementById('shop-sort-select');
  if (sortSelect && ShopState.sort) sortSelect.value = ShopState.sort;

  const priceRange = document.getElementById('price-range-slider');
  const priceDisplay = document.getElementById('price-range-val');
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      ShopState.maxPrice = Number(e.target.value);
      if (priceDisplay) priceDisplay.textContent = formatBDT(ShopState.maxPrice);
    });
    priceRange.addEventListener('change', () => {
      ShopState.page = 1;
      fetchShopProducts();
    });
  }

  // Setup sidebar filter listeners
  document.querySelectorAll('[data-filter-cat]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-filter-cat]').forEach(btn => btn.classList.remove('active'));
      el.classList.add('active');
      ShopState.category = el.getAttribute('data-filter-cat');
      ShopState.page = 1;
      fetchShopProducts();
    });
  });

  document.querySelectorAll('[data-filter-gender]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-filter-gender]').forEach(btn => btn.classList.remove('active'));
      el.classList.add('active');
      ShopState.gender = el.getAttribute('data-filter-gender');
      ShopState.page = 1;
      fetchShopProducts();
    });
  });

  document.querySelectorAll('.filter-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = btn.getAttribute('data-size');
      if (ShopState.size === s) {
        ShopState.size = '';
        btn.classList.remove('active');
      } else {
        document.querySelectorAll('.filter-size-btn').forEach(b => b.classList.remove('active'));
        ShopState.size = s;
        btn.classList.add('active');
      }
      ShopState.page = 1;
      fetchShopProducts();
    });
  });

  document.querySelectorAll('.filter-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.getAttribute('data-color');
      if (ShopState.color === c) {
        ShopState.color = '';
        btn.classList.remove('active');
      } else {
        document.querySelectorAll('.filter-color-btn').forEach(b => b.classList.remove('active'));
        ShopState.color = c;
        btn.classList.add('active');
      }
      ShopState.page = 1;
      fetchShopProducts();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      ShopState.sort = e.target.value;
      ShopState.page = 1;
      fetchShopProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      ShopState.search = searchInput.value.trim();
      ShopState.page = 1;
      fetchShopProducts();
    }, 400));
  }

  // Mobile Filter Drawer
  const mobileFilterOpen = document.getElementById('mobile-filter-open');
  const mobileFilterClose = document.getElementById('mobile-filter-close');
  const shopSidebar = document.getElementById('shop-sidebar');
  const shopBackdrop = document.getElementById('shop-sidebar-backdrop');

  if (mobileFilterOpen && shopSidebar) {
    mobileFilterOpen.addEventListener('click', () => {
      shopSidebar.classList.add('open');
      if (shopBackdrop) shopBackdrop.classList.add('show');
    });
  }

  const closeFilterDrawer = () => {
    if (shopSidebar) shopSidebar.classList.remove('open');
    if (shopBackdrop) shopBackdrop.classList.remove('show');
  };

  if (mobileFilterClose) mobileFilterClose.addEventListener('click', closeFilterDrawer);
  if (shopBackdrop) shopBackdrop.addEventListener('click', closeFilterDrawer);

  await fetchShopProducts();
}

async function fetchShopProducts() {
  const container = document.getElementById('shop-products-grid');
  const paginationContainer = document.getElementById('shop-pagination');
  const countDisplay = document.getElementById('shop-product-count');

  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
      <i class="fas fa-spinner fa-spin fa-2x" style="color: #111;"></i>
      <p style="margin-top: 12px; color: #71717a;">Curating Zenvy Wear collection...</p>
    </div>
  `;

  // Build query
  const params = new URLSearchParams();
  if (ShopState.category && ShopState.category !== 'all') params.append('category', ShopState.category);
  if (ShopState.gender && ShopState.gender !== 'all') params.append('gender', ShopState.gender);
  if (ShopState.search) params.append('search', ShopState.search);
  if (ShopState.size) params.append('size', ShopState.size);
  if (ShopState.color) params.append('color', ShopState.color);
  if (ShopState.maxPrice < 6000) params.append('maxPrice', ShopState.maxPrice);
  if (ShopState.sort) params.append('sort', ShopState.sort);
  params.append('page', ShopState.page);
  params.append('limit', ShopState.limit);

  const [prodRes, wishRes] = await Promise.all([
    apiRequest(`/products?${params.toString()}`),
    apiRequest('/wishlist')
  ]);

  if (!prodRes.ok || !prodRes.data.data) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 60px;">Failed to load products.</div>`;
    return;
  }

  const products = prodRes.data.data;
  const pagination = prodRes.data.pagination;
  const wishIds = (wishRes.ok && wishRes.data && wishRes.data.productIds) ? wishRes.data.productIds : [];

  if (countDisplay) {
    countDisplay.textContent = `Showing ${products.length} of ${pagination.total} products`;
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; background: #fff; border-radius: 8px; border: 1px dashed #ddd;">
        <i class="fas fa-search fa-3x" style="color: #a1a1aa; margin-bottom: 16px;"></i>
        <h4 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 8px;">No matching items found</h4>
        <p style="color: #71717a; margin-bottom: 24px;">Try clearing some filters or searching with different keywords.</p>
        <button class="btn btn-secondary" onclick="resetShopFilters()">Reset All Filters</button>
      </div>
    `;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  container.innerHTML = products.map(p => generateProductCardHTML(p, wishIds.includes(p._id))).join('');

  // Render pagination
  if (paginationContainer) {
    if (pagination.totalPages <= 1) {
      paginationContainer.innerHTML = '';
    } else {
      let pageHTML = '';
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageHTML += `
          <button class="page-btn ${i === pagination.page ? 'active' : ''}" onclick="goToShopPage(${i})" style="width: 40px; height: 40px; border-radius: 4px; border: 1px solid ${i === pagination.page ? '#111' : '#ddd'}; background: ${i === pagination.page ? '#111' : '#fff'}; color: ${i === pagination.page ? '#fff' : '#111'}; font-weight: 600; margin: 0 4px;">
            ${i}
          </button>
        `;
      }
      paginationContainer.innerHTML = pageHTML;
    }
  }
}

function goToShopPage(page) {
  ShopState.page = page;
  fetchShopProducts();
  window.scrollTo({ top: 200, behavior: 'smooth' });
}

function resetShopFilters() {
  ShopState.category = 'all';
  ShopState.gender = 'all';
  ShopState.search = '';
  ShopState.size = '';
  ShopState.color = '';
  ShopState.maxPrice = 6000;
  ShopState.sort = 'newest';
  ShopState.page = 1;

  const searchInput = document.getElementById('shop-search-input');
  if (searchInput) searchInput.value = '';
  const priceRange = document.getElementById('price-range-slider');
  if (priceRange) priceRange.value = 6000;
  const priceDisplay = document.getElementById('price-range-val');
  if (priceDisplay) priceDisplay.textContent = formatBDT(6000);

  document.querySelectorAll('[data-filter-cat]').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('[data-filter-gender]').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.filter-size-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.filter-color-btn').forEach(b => b.classList.remove('active'));

  fetchShopProducts();
}

// Single Product Details Page
let currentProduct = null;
let selectedColor = '';
let selectedSize = '';
let selectedQuantity = 1;

async function loadProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = '/shop.html';
    return;
  }

  const res = await apiRequest(`/products/${productId}`);
  if (!res.ok || !res.data.product) {
    showToast('Product not found.', 'error');
    setTimeout(() => window.location.href = '/shop.html', 1500);
    return;
  }

  currentProduct = res.data.product;
  const reviews = res.data.reviews || [];
  const related = res.data.relatedProducts || [];

  selectedColor = currentProduct.colors[0] || 'Default';
  selectedSize = currentProduct.sizes[0] || 'Standard';
  selectedQuantity = 1;

  // Set Title & Meta
  document.title = `${currentProduct.name} — Zenvy Wear`;

  // Gallery
  const mainImg = document.getElementById('product-main-image');
  const thumbsContainer = document.getElementById('product-thumbs-container');
  if (mainImg) mainImg.src = currentProduct.images[0];
  if (thumbsContainer) {
    thumbsContainer.innerHTML = currentProduct.images.map((img, i) => `
      <img src="${img}" alt="${currentProduct.name}" class="product-thumb ${i === 0 ? 'active' : ''}" onclick="switchDetailImage(this, '${img}')" style="width: 80px; height: 100px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid ${i === 0 ? '#111' : 'transparent'};">
    `).join('');
  }

  // Product Header Info
  const titleEl = document.getElementById('product-detail-title');
  const catEl = document.getElementById('product-detail-category');
  const priceEl = document.getElementById('product-detail-price');
  const origPriceEl = document.getElementById('product-detail-original-price');
  const discTagEl = document.getElementById('product-detail-discount-tag');
  const descEl = document.getElementById('product-detail-description');
  const skuEl = document.getElementById('product-detail-sku');
  const stockEl = document.getElementById('product-detail-stock');
  const ratingEl = document.getElementById('product-detail-rating');

  if (titleEl) titleEl.textContent = currentProduct.name;
  if (catEl) catEl.textContent = currentProduct.category;
  if (priceEl) priceEl.textContent = formatBDT(currentProduct.discountPrice || currentProduct.price);
  if (origPriceEl) {
    origPriceEl.textContent = currentProduct.discountPrice ? formatBDT(currentProduct.price) : '';
  }
  if (discTagEl) {
    discTagEl.textContent = currentProduct.discountPercentage ? `-${currentProduct.discountPercentage}% OFF` : '';
  }
  if (descEl) descEl.textContent = currentProduct.description;
  if (skuEl) skuEl.textContent = currentProduct.sku;
  if (stockEl) {
    stockEl.textContent = currentProduct.stock > 0 ? `In Stock (${currentProduct.stock} available)` : 'Sold Out';
    stockEl.style.color = currentProduct.stock > 0 ? '#16a34a' : '#dc2626';
  }
  if (ratingEl) {
    ratingEl.innerHTML = `
      <div style="color: #f59e0b; margin-right: 6px;">
        ${[1, 2, 3, 4, 5].map(s => `<i class="${s <= Math.round(currentProduct.rating) ? 'fas' : 'far'} fa-star"></i>`).join('')}
      </div>
      <span style="font-weight: 600; margin-right: 6px;">${currentProduct.rating}</span>
      <span style="color: #71717a;">(${currentProduct.numReviews} customer reviews)</span>
    `;
  }

  // Colors
  const colorsContainer = document.getElementById('product-colors-container');
  const selectedColorLabel = document.getElementById('selected-color-label');
  if (colorsContainer) {
    colorsContainer.innerHTML = currentProduct.colors.map((c, i) => `
      <button type="button" class="color-pill ${i === 0 ? 'active' : ''}" onclick="selectDetailColor(this, '${c}')" style="padding: 8px 18px; border-radius: 4px; border: 1px solid ${i === 0 ? '#111' : '#ddd'}; background: ${i === 0 ? '#111' : '#fff'}; color: ${i === 0 ? '#fff' : '#111'}; font-weight: 500; font-size: 0.88rem;">
        ${c}
      </button>
    `).join('');
    if (selectedColorLabel) selectedColorLabel.textContent = selectedColor;
  }

  // Sizes
  const sizesContainer = document.getElementById('product-sizes-container');
  const selectedSizeLabel = document.getElementById('selected-size-label');
  if (sizesContainer) {
    sizesContainer.innerHTML = currentProduct.sizes.map((s, i) => `
      <button type="button" class="size-pill ${i === 0 ? 'active' : ''}" onclick="selectDetailSize(this, '${s}')" style="min-width: 50px; height: 44px; border-radius: 4px; border: 1px solid ${i === 0 ? '#111' : '#ddd'}; background: ${i === 0 ? '#111' : '#fff'}; color: ${i === 0 ? '#fff' : '#111'}; font-weight: 600; font-size: 0.9rem;">
        ${s}
      </button>
    `).join('');
    if (selectedSizeLabel) selectedSizeLabel.textContent = selectedSize;
  }

  // Reviews list render
  renderProductReviews(reviews);

  // Related products render
  const relatedGrid = document.getElementById('related-products-grid');
  if (relatedGrid && related.length > 0) {
    relatedGrid.innerHTML = related.map(p => generateProductCardHTML(p)).join('');
  }
}

function switchDetailImage(thumb, src) {
  document.querySelectorAll('.product-thumb').forEach(t => t.style.borderColor = 'transparent');
  thumb.style.borderColor = '#111';
  const mainImg = document.getElementById('product-main-image');
  if (mainImg) mainImg.src = src;
}

function selectDetailColor(btn, color) {
  document.querySelectorAll('.color-pill').forEach(b => {
    b.style.background = '#fff';
    b.style.color = '#111';
    b.style.borderColor = '#ddd';
  });
  btn.style.background = '#111';
  btn.style.color = '#fff';
  btn.style.borderColor = '#111';
  selectedColor = color;
  const lbl = document.getElementById('selected-color-label');
  if (lbl) lbl.textContent = color;
}

function selectDetailSize(btn, size) {
  document.querySelectorAll('.size-pill').forEach(b => {
    b.style.background = '#fff';
    b.style.color = '#111';
    b.style.borderColor = '#ddd';
  });
  btn.style.background = '#111';
  btn.style.color = '#fff';
  btn.style.borderColor = '#111';
  selectedSize = size;
  const lbl = document.getElementById('selected-size-label');
  if (lbl) lbl.textContent = size;
}

function adjustDetailQuantity(delta) {
  const input = document.getElementById('detail-qty-input');
  if (!input || !currentProduct) return;
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(currentProduct.stock || 10, val + delta));
  input.value = val;
  selectedQuantity = val;
}

async function addDetailToCart() {
  if (!currentProduct) return;

  const res = await apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({
      productId: currentProduct._id,
      color: selectedColor,
      size: selectedSize,
      quantity: selectedQuantity
    })
  });

  if (res.ok) {
    showToast(`${currentProduct.name} (${selectedSize}, ${selectedColor}) added to cart!`, 'success');
    updateNavBadges();
  } else {
    showToast(res.data.message || 'Could not add to cart', 'error');
  }
}

async function buyNow() {
  if (!currentProduct) return;

  const res = await apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({
      productId: currentProduct._id,
      color: selectedColor,
      size: selectedSize,
      quantity: selectedQuantity
    })
  });

  if (res.ok) {
    window.location.href = '/checkout.html';
  } else {
    showToast(res.data.message || 'Could not initiate checkout', 'error');
  }
}

function renderProductReviews(reviews) {
  const list = document.getElementById('product-reviews-list');
  const countBadge = document.getElementById('reviews-count-badge');
  if (!list) return;

  if (countBadge) countBadge.textContent = reviews.length;

  if (reviews.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #71717a;">
        <i class="far fa-comment-alt fa-2x" style="margin-bottom: 12px;"></i>
        <p>No customer reviews yet. Be the first to review after purchasing!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = reviews.map(r => `
    <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div>
          <span style="font-weight: 600; margin-right: 8px;">${r.userName}</span>
          ${r.isVerifiedPurchase ? '<span style="font-size: 0.75rem; background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 4px; font-weight: 600;"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
        </div>
        <span style="font-size: 0.78rem; color: #71717a;">${new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <div style="color: #f59e0b; font-size: 0.8rem; margin-bottom: 8px;">
        ${[1, 2, 3, 4, 5].map(s => `<i class="${s <= r.rating ? 'fas' : 'far'} fa-star"></i>`).join('')}
      </div>
      <p style="color: #3f3f46; font-size: 0.92rem; line-height: 1.6;">${r.comment}</p>
    </div>
  `).join('');
}

async function handleReviewSubmit(event) {
  event.preventDefault();
  const user = Storage.getUser();
  if (!user) {
    showToast('Please sign in to submit a verified review', 'error');
    setTimeout(() => window.location.href = '/login.html', 1500);
    return;
  }

  const rating = Number(document.getElementById('review-rating-input').value) || 5;
  const comment = document.getElementById('review-comment-input').value.trim();

  if (!comment) {
    showToast('Please enter your review feedback', 'error');
    return;
  }

  const res = await apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify({
      productId: currentProduct._id,
      rating,
      comment
    })
  });

  if (res.ok) {
    showToast('Verified review posted successfully!', 'success');
    document.getElementById('review-form').reset();
    // Reload product details
    loadProductDetailPage();
  } else {
    showToast(res.data.message || 'Could not submit review', 'error');
  }
}

// Helper Debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
