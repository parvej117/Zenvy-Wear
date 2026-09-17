/**
 * ZENVY WEAR — SHOPPING CART CONTROLLER
 */

let activePromoDiscount = 0;
let selectedDeliveryFee = 80;

async function loadCartPage() {
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const mainCartView = document.getElementById('cart-main-view');

  if (!container) return;

  container.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p style="margin-top: 10px; color: #71717a;">Loading your shopping bag...</p>
      </td>
    </tr>
  `;

  const res = await apiRequest('/cart');
  if (!res.ok || !res.data.cart) {
    showToast('Failed to load cart', 'error');
    return;
  }

  const items = res.data.cart.items || [];
  const summary = res.data.summary || {};

  if (items.length === 0) {
    if (mainCartView) mainCartView.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    updateNavBadges();
    return;
  }

  if (mainCartView) mainCartView.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = items.map(item => {
    const itemPrice = item.discountPrice || item.price;
    const itemTotal = itemPrice * item.quantity;

    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 20px 12px; display: flex; gap: 16px; align-items: center;">
          <img src="${item.image}" alt="${item.name}" style="width: 75px; height: 95px; object-fit: cover; border-radius: 4px;">
          <div>
            <a href="/product.html?id=${item.productId}" style="font-weight: 600; font-size: 0.95rem; color: #111;">${item.name}</a>
            <div style="font-size: 0.8rem; color: #71717a; margin-top: 4px;">
              <span>Size: <strong>${item.size}</strong></span> | <span>Color: <strong>${item.color}</strong></span>
            </div>
            <button onclick="removeCartItem('${item.id}')" style="font-size: 0.78rem; color: #dc2626; margin-top: 8px; cursor: pointer;">
              <i class="far fa-trash-alt"></i> Remove
            </button>
          </div>
        </td>
        <td style="padding: 20px 12px; font-weight: 600;">${formatBDT(itemPrice)}</td>
        <td style="padding: 20px 12px;">
          <div style="display: inline-flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; height: 38px;">
            <button onclick="updateItemQuantity('${item.id}', ${item.quantity - 1})" style="padding: 0 10px; height: 100%;"><i class="fas fa-minus fa-xs"></i></button>
            <span style="width: 38px; text-align: center; font-weight: 600; font-size: 0.88rem;">${item.quantity}</span>
            <button onclick="updateItemQuantity('${item.id}', ${item.quantity + 1})" style="padding: 0 10px; height: 100%;"><i class="fas fa-plus fa-xs"></i></button>
          </div>
        </td>
        <td style="padding: 20px 12px; font-weight: 700; text-align: right;">${formatBDT(itemTotal)}</td>
      </tr>
    `;
  }).join('');

  updateCartSummary(summary.subtotal);
  updateNavBadges();
}

async function updateItemQuantity(itemId, newQty) {
  if (newQty <= 0) {
    if (confirm('Remove this item from your shopping bag?')) {
      await removeCartItem(itemId);
    }
    return;
  }

  const res = await apiRequest(`/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity: newQty })
  });

  if (res.ok) {
    loadCartPage();
  } else {
    showToast(res.data.message || 'Failed to update quantity', 'error');
  }
}

async function removeCartItem(itemId) {
  const res = await apiRequest(`/cart/${itemId}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    showToast('Item removed from cart', 'info');
    loadCartPage();
  } else {
    showToast(res.data.message || 'Could not remove item', 'error');
  }
}

function updateCartSummary(subtotal) {
  const subtotalEl = document.getElementById('cart-subtotal-val');
  const discountEl = document.getElementById('cart-discount-val');
  const shippingEl = document.getElementById('cart-shipping-val');
  const totalEl = document.getElementById('cart-total-val');

  if (subtotalEl) subtotalEl.textContent = formatBDT(subtotal);

  // Check Dhaka location selector
  const locationSelect = document.getElementById('cart-delivery-zone');
  if (locationSelect) {
    selectedDeliveryFee = locationSelect.value === 'dhaka' ? 80 : 130;
  }

  // Free delivery threshold over 5000 BDT
  const finalShipping = subtotal >= 5000 ? 0 : selectedDeliveryFee;
  if (shippingEl) {
    shippingEl.textContent = finalShipping === 0 ? 'FREE' : formatBDT(finalShipping);
    if (finalShipping === 0) shippingEl.style.color = '#16a34a';
  }

  const discountAmount = activePromoDiscount > 0 ? Math.round(subtotal * activePromoDiscount) : 0;
  if (discountEl) {
    discountEl.textContent = discountAmount > 0 ? `-${formatBDT(discountAmount)}` : '৳ 0';
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + finalShipping);
  if (totalEl) totalEl.textContent = formatBDT(grandTotal);

  // Store active cart total for checkout
  sessionStorage.setItem('zenvy_checkout_subtotal', subtotal);
  sessionStorage.setItem('zenvy_checkout_discount', discountAmount);
  sessionStorage.setItem('zenvy_checkout_shipping', finalShipping);
  sessionStorage.setItem('zenvy_checkout_total', grandTotal);
}

function applyCoupon(event) {
  event.preventDefault();
  const input = document.getElementById('cart-coupon-input');
  const code = input ? input.value.trim().toUpperCase() : '';

  if (code === 'ZENVY10') {
    activePromoDiscount = 0.10; // 10%
    showToast('Promo code ZENVY10 applied! 10% discount deducted.', 'success');
    loadCartPage();
  } else if (code === 'CONFIDENCE20') {
    activePromoDiscount = 0.20; // 20%
    showToast('VIP code CONFIDENCE20 applied! 20% discount deducted.', 'success');
    loadCartPage();
  } else {
    showToast('Invalid coupon code. Try ZENVY10', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-items-container')) {
    loadCartPage();

    const locationSelect = document.getElementById('cart-delivery-zone');
    if (locationSelect) {
      locationSelect.addEventListener('change', () => {
        loadCartPage();
      });
    }
  }
});
