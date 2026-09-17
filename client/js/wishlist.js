/**
 * ZENVY WEAR — WISHLIST CONTROLLER
 */

async function loadWishlistPage() {
  const grid = document.getElementById('wishlist-grid');
  const emptyState = document.getElementById('wishlist-empty-state');
  const countDisplay = document.getElementById('wishlist-count-display');

  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 60px;">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p style="margin-top: 12px; color: #71717a;">Loading your saved pieces...</p>
    </div>
  `;

  const res = await apiRequest('/wishlist');
  if (!res.ok || !res.data) {
    showToast('Could not retrieve wishlist', 'error');
    return;
  }

  const products = res.data.products || [];

  if (countDisplay) {
    countDisplay.textContent = `${products.length} Saved Item${products.length === 1 ? '' : 's'}`;
  }

  if (products.length === 0) {
    grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = products.map(p => {
    const currentPrice = p.discountPrice || p.price;
    return `
      <div class="product-card" id="wish-card-${p._id}">
        <div class="product-image-container" onclick="window.location.href='/product.html?id=${p._id}'" style="cursor: pointer;">
          <img class="product-img" src="${p.images[0]}" alt="${p.name}">
          
          <button class="product-wishlist-btn active" onclick="removeFromWishlistPage('${p._id}', event)" title="Remove from Wishlist">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <a href="/product.html?id=${p._id}" class="product-title">${p.name}</a>
          
          <div class="product-price-wrapper" style="margin-bottom: 12px;">
            <span class="price-current">${formatBDT(currentPrice)}</span>
            ${p.discountPrice ? `<span class="price-original">${formatBDT(p.price)}</span>` : ''}
          </div>

          <button class="btn btn-primary btn-sm" onclick="moveWishlistToCart('${p._id}')" style="width: 100%;">
            <i class="fas fa-shopping-bag"></i> Move to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function removeFromWishlistPage(productId, event) {
  if (event && event.stopPropagation) event.stopPropagation();

  const res = await apiRequest(`/wishlist/${productId}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    showToast('Item removed from wishlist', 'info');
    loadWishlistPage();
    updateNavBadges();
  } else {
    showToast('Failed to remove item', 'error');
  }
}

async function moveWishlistToCart(productId) {
  // 1. Add to cart
  const cartRes = await apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity: 1 })
  });

  if (cartRes.ok) {
    // 2. Remove from wishlist
    await apiRequest(`/wishlist/${productId}`, { method: 'DELETE' });
    showToast('Moved to shopping bag!', 'success');
    loadWishlistPage();
    updateNavBadges();
  } else {
    showToast(cartRes.data.message || 'Could not move to cart', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('wishlist-grid')) {
    loadWishlistPage();
  }
});
