/**
 * ZENVY WEAR — ADMIN CONSOLE CONTROLLER
 */

function verifyAdminAuth() {
  const user = Storage.getUser();
  const token = Storage.getToken();

  if (!user || !token || user.role !== 'admin') {
    window.location.href = '/admin/login.html';
    return false;
  }

  const nameEl = document.getElementById('admin-user-name');
  if (nameEl) nameEl.textContent = user.name;
  return true;
}

// 1. Dashboard Overview
async function loadAdminDashboard() {
  if (!verifyAdminAuth()) return;

  const res = await apiRequest('/admin/stats');
  if (!res.ok) {
    showToast('Failed to load admin statistics', 'error');
    return;
  }

  const stats = res.data.stats;

  // Stat Counters
  const salesEl = document.getElementById('admin-stat-sales');
  const ordersEl = document.getElementById('admin-stat-orders');
  const prodsEl = document.getElementById('admin-stat-products');
  const usersEl = document.getElementById('admin-stat-users');

  if (salesEl) salesEl.textContent = formatBDT(stats.totalSales);
  if (ordersEl) ordersEl.textContent = stats.totalOrders;
  if (prodsEl) prodsEl.textContent = stats.totalProducts;
  if (usersEl) usersEl.textContent = stats.totalUsers;

  // Sales Chart
  renderSalesChart(stats.monthlySales || []);

  // Recent Orders Table
  renderRecentOrders(stats.recentOrders || []);
}

function renderSalesChart(monthlyData) {
  const container = document.getElementById('admin-sales-chart');
  if (!container) return;

  const maxVal = Math.max(...monthlyData.map(m => m.sales), 1000);

  container.innerHTML = monthlyData.map(item => {
    const heightPercent = Math.max(12, Math.round((item.sales / maxVal) * 100));
    return `
      <div class="chart-bar-group">
        <div style="font-size: 0.7rem; font-weight: 600; margin-bottom: 6px; color: #111;">${formatBDT(item.sales)}</div>
        <div class="chart-bar" style="height: ${heightPercent}%;" title="${item.month}: ${formatBDT(item.sales)} (${item.orders} orders)"></div>
        <span class="chart-label">${item.month}</span>
      </div>
    `;
  }).join('');
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recent-orders-table-body');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;">No recent orders.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(ord => `
    <tr>
      <td><strong>${ord.orderNumber}</strong></td>
      <td>
        <div>${ord.shippingAddress?.fullName || 'Customer'}</div>
        <small style="color: #71717a;">${ord.shippingAddress?.phone || ''}</small>
      </td>
      <td>${new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
      <td><strong>${formatBDT(ord.total)}</strong></td>
      <td>
        <span class="status-pill status-${ord.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}">${ord.paymentStatus}</span>
      </td>
      <td>
        <select onchange="updateOrderStatus('${ord._id}', this.value)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 0.8rem; font-weight: 600;">
          ${['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => `
            <option value="${st}" ${st === ord.orderStatus ? 'selected' : ''}>${st}</option>
          `).join('')}
        </select>
      </td>
    </tr>
  `).join('');
}

// 2. Product Management
async function loadAdminProducts() {
  if (!verifyAdminAuth()) return;

  const tbody = document.getElementById('admin-products-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Loading catalog...</td></tr>';

  const res = await apiRequest('/products?limit=100');
  if (!res.ok || !res.data.data) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load products.</td></tr>';
    return;
  }

  const products = res.data.data;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="${p.images[0]}" alt="${p.name}" style="width: 48px; height: 60px; object-fit: cover; border-radius: 4px;">
      </td>
      <td>
        <strong style="display:block;">${p.name}</strong>
        <small style="color: #71717a;">SKU: ${p.sku}</small>
      </td>
      <td>${p.category}</td>
      <td>
        <strong>${formatBDT(p.discountPrice || p.price)}</strong>
        ${p.discountPrice ? `<br><small style="text-decoration: line-through; color: #71717a;">${formatBDT(p.price)}</small>` : ''}
      </td>
      <td>
        <span style="font-weight: 700; color: ${p.stock > 5 ? '#16a34a' : '#dc2626'};">${p.stock} units</span>
      </td>
      <td>
        <div style="color: #f59e0b; font-size: 0.82rem;">
          <i class="fas fa-star"></i> ${p.rating} (${p.numReviews})
        </div>
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editProductModal('${p._id}')" style="margin-right: 6px;" title="Edit Product">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-secondary btn-sm" onclick="deleteProduct('${p._id}', '${p.name.replace(/'/g, "\\'")}')" style="color: #dc2626;" title="Delete Product">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

let editingProductId = null;

function openAddProductModal() {
  editingProductId = null;
  const form = document.getElementById('product-form');
  if (form) form.reset();
  const title = document.getElementById('product-modal-title');
  if (title) title.textContent = 'Add New Designer Piece';
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.add('show');
}

async function editProductModal(productId) {
  editingProductId = productId;
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  if (title) title.textContent = 'Update Product Details';

  const res = await apiRequest(`/products/${productId}`);
  if (!res.ok) {
    showToast('Failed to load product for editing', 'error');
    return;
  }

  const p = res.data.product;
  document.getElementById('form-prod-name').value = p.name;
  document.getElementById('form-prod-category').value = p.category;
  document.getElementById('form-prod-gender').value = p.gender;
  document.getElementById('form-prod-price').value = p.price;
  document.getElementById('form-prod-discount-price').value = p.discountPrice || '';
  document.getElementById('form-prod-stock').value = p.stock;
  document.getElementById('form-prod-images').value = p.images.join(', ');
  document.getElementById('form-prod-sizes').value = p.sizes.join(', ');
  document.getElementById('form-prod-colors').value = p.colors.join(', ');
  document.getElementById('form-prod-desc').value = p.description;

  if (modal) modal.classList.add('show');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('show');
}

async function handleProductFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('form-prod-name').value.trim();
  const category = document.getElementById('form-prod-category').value;
  const gender = document.getElementById('form-prod-gender').value;
  const price = Number(document.getElementById('form-prod-price').value);
  const discountPriceRaw = document.getElementById('form-prod-discount-price').value;
  const discountPrice = discountPriceRaw ? Number(discountPriceRaw) : undefined;
  const stock = Number(document.getElementById('form-prod-stock').value);
  const images = document.getElementById('form-prod-images').value.split(',').map(s => s.trim()).filter(Boolean);
  const sizes = document.getElementById('form-prod-sizes').value.split(',').map(s => s.trim()).filter(Boolean);
  const colors = document.getElementById('form-prod-colors').value.split(',').map(s => s.trim()).filter(Boolean);
  const description = document.getElementById('form-prod-desc').value.trim();

  const payload = {
    name,
    category,
    gender,
    price,
    discountPrice,
    stock,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'],
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
    colors: colors.length > 0 ? colors : ['Black', 'Navy'],
    description
  };

  let res;
  if (editingProductId) {
    res = await apiRequest(`/products/${editingProductId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } else {
    res = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  if (res.ok) {
    showToast(`Product ${editingProductId ? 'updated' : 'created'} successfully!`, 'success');
    closeProductModal();
    loadAdminProducts();
  } else {
    showToast(res.data.message || 'Operation failed', 'error');
  }
}

async function deleteProduct(productId, name) {
  if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

  const res = await apiRequest(`/products/${productId}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    showToast('Product deleted from inventory', 'info');
    loadAdminProducts();
  } else {
    showToast(res.data.message || 'Failed to delete product', 'error');
  }
}

// 3. Orders Management
async function loadAdminOrders() {
  if (!verifyAdminAuth()) return;

  const tbody = document.getElementById('admin-orders-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Fetching orders...</td></tr>';

  const res = await apiRequest('/orders/admin/all');
  if (!res.ok || !res.data.orders) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load orders.</td></tr>';
    return;
  }

  const orders = res.data.orders;
  tbody.innerHTML = orders.map(ord => `
    <tr>
      <td><strong>${ord.orderNumber}</strong></td>
      <td>
        <strong>${ord.shippingAddress?.fullName || 'Customer'}</strong>
        <div style="font-size: 0.78rem; color: #71717a;">${ord.shippingAddress?.city} • ${ord.shippingAddress?.phone}</div>
      </td>
      <td>
        <span style="font-size: 0.85rem;">${ord.items.length} item(s)</span>
      </td>
      <td><strong>${formatBDT(ord.total)}</strong></td>
      <td>
        <select onchange="updateOrderPaymentStatus('${ord._id}', this.value)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 0.8rem; font-weight: 600;">
          <option value="Unpaid" ${ord.paymentStatus === 'Unpaid' ? 'selected' : ''}>Unpaid</option>
          <option value="Paid" ${ord.paymentStatus === 'Paid' ? 'selected' : ''}>Paid</option>
          <option value="Refunded" ${ord.paymentStatus === 'Refunded' ? 'selected' : ''}>Refunded</option>
        </select>
      </td>
      <td>
        <select onchange="updateOrderStatus('${ord._id}', this.value)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 0.8rem; font-weight: 600;">
          ${['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => `
            <option value="${st}" ${st === ord.orderStatus ? 'selected' : ''}>${st}</option>
          `).join('')}
        </select>
      </td>
      <td>
        <small style="color: #71717a;">${new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</small>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(orderId, orderStatus) {
  const res = await apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ orderStatus })
  });

  if (res.ok) {
    showToast(`Order status updated to ${orderStatus}`, 'success');
  } else {
    showToast('Failed to update status', 'error');
  }
}

async function updateOrderPaymentStatus(orderId, paymentStatus) {
  const res = await apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ paymentStatus })
  });

  if (res.ok) {
    showToast(`Payment status updated to ${paymentStatus}`, 'success');
  } else {
    showToast('Failed to update payment status', 'error');
  }
}

// 4. Users Management
async function loadAdminUsers() {
  if (!verifyAdminAuth()) return;

  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;

  const res = await apiRequest('/admin/users');
  if (!res.ok || !res.data.users) return;

  const users = res.data.users;
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="admin-avatar" style="width:34px; height:34px; font-size: 0.8rem;">${u.name[0]}</div>
          <div>
            <strong>${u.name}</strong>
            <div style="font-size:0.75rem; color:#71717a;">${u.phone || 'No phone'}</div>
          </div>
        </div>
      </td>
      <td>${u.email}</td>
      <td>
        <span class="status-pill" style="background: ${u.role === 'admin' ? '#111' : '#f4f4f5'}; color: ${u.role === 'admin' ? '#fff' : '#111'};">${u.role}</span>
      </td>
      <td>
        <span class="status-pill status-${u.isBlocked ? 'cancelled' : 'delivered'}">${u.isBlocked ? 'Blocked' : 'Active'}</span>
      </td>
      <td>${new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>
        ${u.role !== 'admin' ? `
          <button class="btn btn-secondary btn-sm" onclick="toggleBlockUser('${u._id}')" style="color: ${u.isBlocked ? '#16a34a' : '#dc2626'};">
            ${u.isBlocked ? 'Unblock' : 'Block User'}
          </button>
        ` : '<span style="color:#71717a; font-size:0.8rem;">Master Admin</span>'}
      </td>
    </tr>
  `).join('');
}

async function toggleBlockUser(userId) {
  const res = await apiRequest(`/admin/users/${userId}/block`, {
    method: 'PUT'
  });

  if (res.ok) {
    showToast(res.data.message, 'info');
    loadAdminUsers();
  } else {
    showToast('Could not modify user status', 'error');
  }
}
