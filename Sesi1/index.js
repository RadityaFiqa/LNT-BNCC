// Restaurant Menu Application
let cart = [];
let restaurantData = null;

// Load restaurant data from JSON
async function loadRestaurantData() {
    try {
        const response = await fetch('restaurant-data.json');
        restaurantData = await response.json();
        console.log('Restaurant data loaded successfully');
    } catch (error) {
        console.error('Error loading restaurant data:', error);
    }
}

// Cart functionality
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification(`${name} ditambahkan ke keranjang!`);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartDisplay();
    showNotification(`${name} dihapus dari keranjang!`);
}

function updateQuantity(name, newQuantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(name);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const subtotal = document.getElementById('subtotal');
    const tax = document.getElementById('tax');
    const total = document.getElementById('total');
    const processBtn = document.getElementById('process-order-btn');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Keranjang masih kosong. Pilih menu yang ingin dipesan!</p>';
        subtotal.textContent = 'Rp 0';
        tax.textContent = 'Rp 0';
        total.textContent = 'Rp 0';
        processBtn.disabled = true;
        processBtn.classList.add('disabled');
        return;
    }
    
    // Enable process button when cart has items
    processBtn.disabled = false;
    processBtn.classList.remove('disabled');
    
    let cartHTML = '';
    let subtotalAmount = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotalAmount += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Rp ${item.price.toLocaleString('id-ID')} × ${item.quantity}</p>
                </div>
                <div class="item-controls">
                    <div class="qty-controls">
                        <button onclick="updateQuantity('${item.name}', ${item.quantity - 1})" class="qty-btn minus-btn" title="Kurangi">−</button>
                        <span class="qty">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.name}', ${item.quantity + 1})" class="qty-btn plus-btn" title="Tambah">+</button>
                    </div>
                    <button onclick="removeFromCart('${item.name}')" class="remove-btn" title="Hapus">🗑️ Hapus</button>
                </div>
                <div class="item-total">
                    <strong>Rp ${itemTotal.toLocaleString('id-ID')}</strong>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    
    const taxRate = restaurantData?.settings?.tax_rate || 0.1;
    const taxAmount = Math.round(subtotalAmount * taxRate);
    const totalAmount = subtotalAmount + taxAmount;
    
    subtotal.textContent = `Rp ${subtotalAmount.toLocaleString('id-ID')}`;
    tax.textContent = `Rp ${taxAmount.toLocaleString('id-ID')}`;
    total.textContent = `Rp ${totalAmount.toLocaleString('id-ID')}`;
}

// Order form functions
function showOrderForm() {
    const orderSection = document.getElementById('order-section');
    orderSection.style.display = 'block';
    orderSection.scrollIntoView({ behavior: 'smooth' });
}

function hideOrderForm() {
    const orderSection = document.getElementById('order-section');
    orderSection.style.display = 'none';
}

function submitOrder(event) {
    event.preventDefault();
    
    // Get form data
    const customerName = document.getElementById('customer-name').value.trim();
    const customerEmail = document.getElementById('customer-email').value.trim();
    const orderNotes = document.getElementById('order-notes').value.trim();
    
    // Validate form
    if (!customerName) {
        alert('Nama pelanggan harus diisi!');
        document.getElementById('customer-name').focus();
        return;
    }
    
    if (!customerEmail) {
        alert('Email harus diisi!');
        document.getElementById('customer-email').focus();
        return;
    }
    
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Keranjang masih kosong! Silakan pilih menu terlebih dahulu.');
        return;
    }
    
    // Create formatted message
    const restaurantName = restaurantData?.restaurant?.name || "Restoran Bintang Sembilan";
    const phoneNumber = restaurantData?.restaurant?.phone || "+6281232254875";
    const taxRate = restaurantData?.settings?.tax_rate || 0.1;
    
    let message = `🍽️ *PESANAN ${restaurantName.toUpperCase()}* 🍽️\n\n`;
    message += `👤 *Nama Pelanggan:* ${customerName}\n`;
    message += `📧 *Email:* ${customerEmail}\n\n`;
    message += `📋 *DETAIL PESANAN:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    let totalAmount = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        message += `${index + 1}. ${item.name}\n`;
        message += `   💰 Harga: Rp ${item.price.toLocaleString('id-ID')}\n`;
        message += `   📦 Jumlah: ${item.quantity}\n`;
        message += `   💵 Subtotal: Rp ${itemTotal.toLocaleString('id-ID')}\n\n`;
    });
    
    const taxAmount = Math.round(totalAmount * taxRate);
    const finalTotal = totalAmount + taxAmount;
    
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *Subtotal:* Rp ${totalAmount.toLocaleString('id-ID')}\n`;
    message += `📊 *Pajak (10%):* Rp ${taxAmount.toLocaleString('id-ID')}\n`;
    message += `💳 *TOTAL PEMBAYARAN:* Rp ${finalTotal.toLocaleString('id-ID')}\n\n`;
    
    if (orderNotes.trim()) {
        message += `📝 *Catatan Tambahan:*\n${orderNotes}\n\n`;
    }
    
    message += `⏰ *Waktu Pemesanan:* ${new Date().toLocaleString('id-ID')}\n\n`;
    message += `🙏 Terima kasih atas kepercayaan Anda!`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp API URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    
    // Show confirmation dialog
    const confirmMessage = `Apakah Anda yakin ingin mengirim pesanan ini ke WhatsApp?\n\nTotal: Rp ${finalTotal.toLocaleString('id-ID')}\n\nKlik OK untuk melanjutkan ke WhatsApp.`;
    
    if (confirm(confirmMessage)) {
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Show success notification
        showNotification('Pesanan berhasil dikirim ke WhatsApp!');
        
        // Clear form and cart after a short delay
        setTimeout(() => {
            document.getElementById('customer-name').value = '';
            document.getElementById('customer-email').value = '';
            document.getElementById('order-notes').value = '';
            cart = [];
            updateCartDisplay();
            hideOrderForm();
        }, 1000);
    }
}

// Notification system
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Generate menu sections dynamically from JSON data
function generateMenuSections() {
    if (!restaurantData || !restaurantData.menu) {
        console.error('Restaurant data not loaded');
        return;
    }
    
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) {
        console.error('Menu container not found');
        return;
    }
    
    // Show loading state
    menuContainer.innerHTML = '<div class="loading-message">🔄 Memuat menu...</div>';
    
    const menuSections = [
        { key: 'makanan_utama', title: '🍽️ Menu Makanan Utama', icon: '🍽️' },
        { key: 'minuman', title: '🥤 Menu Minuman', icon: '🥤' },
        { key: 'dessert', title: '🍰 Menu Dessert', icon: '🍰' }
    ];
    
    let menuHTML = '';
    
    menuSections.forEach(section => {
        const menuItems = restaurantData.menu[section.key];
        if (!menuItems || menuItems.length === 0) return;
        
        menuHTML += `
            <div class="menu-section">
                <h2>${section.title}</h2>
                <table class="menu-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Menu</th>
                            <th>Harga</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        menuItems.forEach((item, index) => {
            menuHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                    <td><button class="add-to-cart-btn" onclick="addToCart('${item.name}', ${item.price})">+ Keranjang</button></td>
                </tr>
            `;
        });
        
        menuHTML += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    menuContainer.innerHTML = menuHTML;
}

// Update restaurant information from JSON data
function updateRestaurantInfo() {
    if (!restaurantData) return;
    
    const restaurant = restaurantData.restaurant;
    
    // Update header
    const restaurantName = document.getElementById('restaurant-name');
    const restaurantTagline = document.getElementById('restaurant-tagline');
    const restaurantLogo = document.getElementById('restaurant-logo');
    
    if (restaurantName) restaurantName.textContent = restaurant.name;
    if (restaurantTagline) restaurantTagline.textContent = restaurant.tagline;
    if (restaurantLogo && restaurant.logo) restaurantLogo.src = restaurant.logo;
    
    // Update footer
    const footerCopyright = document.getElementById('footer-copyright');
    const footerContact = document.getElementById('footer-contact');
    
    if (footerCopyright) {
        footerCopyright.textContent = `© 2024 ${restaurant.name}. Hak Cipta Dilindungi.`;
    }
    
    if (footerContact && restaurant.address && restaurant.phone_display) {
        footerContact.textContent = `${restaurant.address} | Telp: ${restaurant.phone_display}`;
    }
    
    // Update page title
    document.title = `Menu ${restaurant.name}`;
}

// Initialize application
async function initializeApp() {
    await loadRestaurantData();
    updateRestaurantInfo();
    generateMenuSections();
    updateCartDisplay();
    console.log('Restaurant menu application initialized');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
