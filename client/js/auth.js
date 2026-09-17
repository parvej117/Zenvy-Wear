/**
 * ZENVY WEAR — AUTHENTICATION & USER PROFILE CONTROLLER
 */

// Registration
async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  const errorAlert = document.getElementById('auth-error-alert');

  if (errorAlert) errorAlert.style.display = 'none';

  if (!name || !email || !phone || !password) {
    displayAuthError('All fields are required.');
    return;
  }

  if (password !== confirmPassword) {
    displayAuthError('Passwords do not match.');
    return;
  }

  if (password.length < 6) {
    displayAuthError('Password must be at least 6 characters.');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
  }

  const res = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password, confirmPassword })
  });

  if (res.ok && res.data.token) {
    Storage.setToken(res.data.token);
    Storage.setUser(res.data.user);
    showToast('Welcome to Zenvy Wear! Account created.', 'success');
    setTimeout(() => {
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/profile.html';
      window.location.href = redirect;
    }, 1000);
  } else {
    displayAuthError(res.data.message || 'Registration failed.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Create Account';
    }
  }
}

// Login
async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const errorAlert = document.getElementById('auth-error-alert');

  if (errorAlert) errorAlert.style.display = 'none';

  if (!email || !password) {
    displayAuthError('Please provide both email and password.');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
  }

  const res = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (res.ok && res.data.token) {
    Storage.setToken(res.data.token);
    Storage.setUser(res.data.user);
    showToast(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, 'success');
    setTimeout(() => {
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      if (redirect) {
        window.location.href = redirect;
      } else if (res.data.user.role === 'admin') {
        window.location.href = '/admin/dashboard.html';
      } else {
        window.location.href = '/profile.html';
      }
    }, 800);
  } else {
    displayAuthError(res.data.message || 'Invalid email or password.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In';
    }
  }
}

function displayAuthError(msg) {
  const alert = document.getElementById('auth-error-alert');
  if (alert) {
    alert.textContent = msg;
    alert.style.display = 'block';
  } else {
    showToast(msg, 'error');
  }
}

function fillDemoCustomer() {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (emailInput && passInput) {
    emailInput.value = 'customer@zenvywear.com';
    passInput.value = 'customer123';
    showToast('Customer demo credentials filled!', 'info');
  }
}

function fillDemoAdmin() {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (emailInput && passInput) {
    emailInput.value = 'admin@zenvywear.com';
    passInput.value = 'admin123456';
    showToast('Admin demo credentials filled!', 'info');
  }
}

function togglePasswordVisibility(fieldId, iconBtn) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  const icon = iconBtn.querySelector('i');
  if (icon) {
    icon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
  }
}

function logoutUser() {
  Storage.removeToken();
  Storage.removeUser();
  showToast('You have been signed out.', 'info');
  setTimeout(() => window.location.href = '/', 600);
}

// User Profile Dashboard Handler
async function loadProfileDashboard() {
  const user = Storage.getUser();
  if (!user || !Storage.getToken()) {
    window.location.href = '/login.html?redirect=/profile.html';
    return;
  }

  // Profile fields
  const nameEl = document.getElementById('profile-display-name');
  const emailEl = document.getElementById('profile-display-email');
  const phoneEl = document.getElementById('profile-display-phone');
  const editName = document.getElementById('edit-profile-name');
  const editPhone = document.getElementById('edit-profile-phone');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (phoneEl) phoneEl.textContent = user.phone || 'Not provided';
  if (editName) editName.value = user.name;
  if (editPhone) editPhone.value = user.phone || '';

  // Load user orders in profile
  loadProfileOrders();
}

async function handleProfileUpdate(event) {
  event.preventDefault();
  const name = document.getElementById('edit-profile-name').value.trim();
  const phone = document.getElementById('edit-profile-phone').value.trim();

  const res = await apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, phone })
  });

  if (res.ok && res.data.user) {
    Storage.setUser(res.data.user);
    showToast('Profile details updated successfully!', 'success');
    loadProfileDashboard();
  } else {
    showToast(res.data.message || 'Failed to update profile', 'error');
  }
}

async function handleChangePassword(event) {
  event.preventDefault();
  const currentPassword = document.getElementById('pwd-current').value;
  const newPassword = document.getElementById('pwd-new').value;
  const confirmPassword = document.getElementById('pwd-confirm').value;

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match', 'error');
    return;
  }

  const res = await apiRequest('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
  });

  if (res.ok) {
    showToast('Password changed successfully!', 'success');
    event.target.reset();
  } else {
    showToast(res.data.message || 'Could not change password', 'error');
  }
}

async function loadProfileOrders() {
  const container = document.getElementById('profile-orders-list');
  if (!container) return;

  const res = await apiRequest('/orders');
  if (!res.ok || !res.data.orders) {
    container.innerHTML = '<p style="padding: 20px; color: #71717a;">Failed to load order history.</p>';
    return;
  }

  const orders = res.data.orders;
  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #71717a;">
        <i class="fas fa-box-open fa-2x" style="margin-bottom: 12px;"></i>
        <p>You haven't placed any orders yet.</p>
        <a href="/shop.html" class="btn btn-secondary btn-sm" style="margin-top: 12px;">Explore Shop</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(ord => `
    <div style="border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: #fff;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div>
          <span style="font-size: 0.8rem; text-transform: uppercase; color: #71717a;">Order</span>
          <strong style="margin-left: 6px; font-size: 0.95rem;">${ord.orderNumber}</strong>
        </div>
        <div style="font-size: 0.82rem; color: #71717a;">
          ${new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div>
          <span class="status-pill status-${ord.orderStatus.toLowerCase()}">${ord.orderStatus}</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${ord.items.map(it => `
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${it.image}" alt="${it.name}" style="width: 48px; height: 60px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1;">
              <h5 style="font-size: 0.9rem; font-weight: 600;">${it.name}</h5>
              <div style="font-size: 0.78rem; color: #71717a;">Qty: ${it.quantity} | Size: ${it.size} | Color: ${it.color}</div>
            </div>
            <div style="font-weight: 600; font-size: 0.9rem;">${formatBDT(it.price * it.quantity)}</div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 14px; font-size: 0.92rem;">
        <div>
          <span>Payment: <strong>${ord.paymentMethod}</strong></span>
          <span class="status-pill status-${ord.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}" style="margin-left: 8px;">${ord.paymentStatus}</span>
        </div>
        <div>
          <span>Total: </span>
          <strong style="font-size: 1.1rem; color: #111;">${formatBDT(ord.total)}</strong>
        </div>
      </div>
    </div>
  `).join('');
}
