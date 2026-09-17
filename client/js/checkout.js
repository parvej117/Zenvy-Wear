/**
 * ZENVY WEAR — CHECKOUT & ORDER SUBMISSION CONTROLLER
 */

let checkoutShippingFee = 80;
let checkoutPaymentMethod = 'Cash on Delivery';

async function initCheckoutPage() {
  const user = Storage.getUser();
  if (user) {
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const phoneInput = document.getElementById('checkout-phone');
    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
  }

  // Load cart summary
  await loadCheckoutCartSummary();

  // Payment method tabs
  document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      checkoutPaymentMethod = card.getAttribute('data-method');

      // Toggle bKash/Nagad instructions
      const bkashBox = document.getElementById('bkash-instructions');
      const cardBox = document.getElementById('card-instructions');

      if (bkashBox) {
        bkashBox.style.display = (checkoutPaymentMethod === 'bKash' || checkoutPaymentMethod === 'Nagad') ? 'block' : 'none';
      }
      if (cardBox) {
        cardBox.style.display = checkoutPaymentMethod === 'Credit/Debit Card' ? 'block' : 'none';
      }
    });
  });

  // Delivery zone change
  const zoneSelect = document.getElementById('checkout-delivery-zone');
  if (zoneSelect) {
    zoneSelect.addEventListener('change', () => {
      checkoutShippingFee = zoneSelect.value === 'Outside Dhaka' ? 130 : 80;
      updateCheckoutTotals();
    });
  }
}

async function loadCheckoutCartSummary() {
  const res = await apiRequest('/cart');
  if (!res.ok || !res.data.cart || res.data.cart.items.length === 0) {
    showToast('Your shopping bag is empty. Please add products first.', 'info');
    setTimeout(() => window.location.href = '/shop.html', 1500);
    return;
  }

  const items = res.data.cart.items;
  const listEl = document.getElementById('checkout-items-list');

  if (listEl) {
    listEl.innerHTML = items.map(item => `
      <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 14px;">
        <div style="position: relative;">
          <img src="${item.image}" alt="${item.name}" style="width: 52px; height: 65px; object-fit: cover; border-radius: 4px;">
          <span style="position: absolute; top: -6px; right: -6px; background: #111; color: #fff; font-size: 0.65rem; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
            ${item.quantity}
          </span>
        </div>
        <div style="flex: 1;">
          <h5 style="font-size: 0.88rem; font-weight: 600; line-height: 1.3;">${item.name}</h5>
          <span style="font-size: 0.76rem; color: #71717a;">${item.size} / ${item.color}</span>
        </div>
        <div style="font-weight: 600; font-size: 0.9rem;">
          ${formatBDT((item.discountPrice || item.price) * item.quantity)}
        </div>
      </div>
    `).join('');
  }

  updateCheckoutTotals(res.data.summary.subtotal);
}

function updateCheckoutTotals(subtotalPassed) {
  let subtotal = subtotalPassed;
  if (subtotal === undefined) {
    const saved = sessionStorage.getItem('zenvy_checkout_subtotal');
    subtotal = saved ? Number(saved) : 0;
  }

  const discount = Number(sessionStorage.getItem('zenvy_checkout_discount') || 0);
  const finalShipping = subtotal >= 5000 ? 0 : checkoutShippingFee;
  const grandTotal = Math.max(0, subtotal - discount + finalShipping);

  const subEl = document.getElementById('checkout-subtotal-val');
  const discEl = document.getElementById('checkout-discount-val');
  const shipEl = document.getElementById('checkout-shipping-val');
  const totalEl = document.getElementById('checkout-grand-total');

  if (subEl) subEl.textContent = formatBDT(subtotal);
  if (discEl) discEl.textContent = discount > 0 ? `-${formatBDT(discount)}` : '৳ 0';
  if (shipEl) shipEl.textContent = finalShipping === 0 ? 'FREE' : formatBDT(finalShipping);
  if (totalEl) totalEl.textContent = formatBDT(grandTotal);
}

async function placeOrder(event) {
  event.preventDefault();

  const name = document.getElementById('checkout-name').value.trim();
  const email = document.getElementById('checkout-email').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const city = document.getElementById('checkout-delivery-zone').value;
  const postalCode = document.getElementById('checkout-postal') ? document.getElementById('checkout-postal').value.trim() : '';
  const notes = document.getElementById('checkout-notes') ? document.getElementById('checkout-notes').value.trim() : '';

  if (!name || !email || !phone || !address) {
    showToast('Please complete all required shipping fields', 'error');
    return;
  }

  const submitBtn = document.getElementById('place-order-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securing Your Order...';
  }

  const res = await apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify({
      shippingAddress: {
        fullName: name,
        phone,
        email,
        address,
        city,
        postalCode,
        country: 'Bangladesh'
      },
      paymentMethod: checkoutPaymentMethod,
      notes
    })
  });

  if (res.ok && res.data.order) {
    const order = res.data.order;
    // Clear session checkout totals
    sessionStorage.removeItem('zenvy_checkout_subtotal');
    sessionStorage.removeItem('zenvy_checkout_discount');
    sessionStorage.removeItem('zenvy_checkout_total');

    updateNavBadges();
    showOrderSuccess(order);
  } else {
    showToast(res.data.message || 'Order failed. Please try again.', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Complete Order & Pay';
    }
  }
}

function showOrderSuccess(order) {
  const checkoutMain = document.getElementById('checkout-form-container');
  const successModal = document.getElementById('checkout-success-view');

  if (checkoutMain) checkoutMain.style.display = 'none';
  if (successModal) {
    successModal.style.display = 'block';
    const numEl = document.getElementById('success-order-number');
    const totalEl = document.getElementById('success-order-total');
    const paymentEl = document.getElementById('success-order-payment');
    const trackingEl = document.getElementById('success-order-tracking');

    if (numEl) numEl.textContent = order.orderNumber;
    if (totalEl) totalEl.textContent = formatBDT(order.total);
    if (paymentEl) paymentEl.textContent = order.paymentMethod;
    if (trackingEl) trackingEl.textContent = order.trackingCode || 'ZW-BD-' + Math.floor(100000 + Math.random() * 900000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout-form-container')) {
    initCheckoutPage();
  }
});
