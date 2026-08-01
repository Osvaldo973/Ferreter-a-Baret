document.addEventListener('DOMContentLoaded', () => {
    // Referencias de UI (Login)
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const formLogin = document.getElementById('form-login');
    const loginUser = document.getElementById('login-user');
    const loginPass = document.getElementById('login-pass');
    const loginError = document.getElementById('login-error');
    const btnLogout = document.getElementById('btn-logout');
    const currentAdminName = document.getElementById('current-admin-name');

    // Referencias de UI (Dashboard Navigation)
    const adminTabs = document.querySelectorAll('.admin-tab');
    const adminSections = document.querySelectorAll('.admin-section');

    // Referencias de UI (Productos)
    const formProduct = document.getElementById('form-product');
    const adminProductList = document.getElementById('admin-product-list');
    const btnCancelProd = document.getElementById('btn-cancel-prod');
    const productFormTitle = document.getElementById('product-form-title');
    const prodOffer = document.getElementById('prod-offer');
    const offerPriceGroup = document.getElementById('offer-price-group');
    const prodImageUrl = document.getElementById('prod-image-url');
    const prodImageFile = document.getElementById('prod-image-file');
    const prodImagePreviewContainer = document.getElementById('prod-image-preview-container');
    const prodImagePreview = document.getElementById('prod-image-preview');
    const prodImageName = document.getElementById('prod-image-name');
    const btnRemoveProdImage = document.getElementById('btn-remove-prod-image');

    // Referencias de UI (Marcas)
    const formBrand = document.getElementById('form-brand');
    const adminBrandList = document.getElementById('admin-brand-list');
    const btnCancelBrand = document.getElementById('btn-cancel-brand');
    const brandLogo = document.getElementById('brand-logo');
    const brandLogoFile = document.getElementById('brand-logo-file');
    const brandLogoPreviewContainer = document.getElementById('brand-logo-preview-container');
    const brandLogoPreview = document.getElementById('brand-logo-preview');
    const brandLogoName = document.getElementById('brand-logo-name');
    const btnRemoveBrandLogo = document.getElementById('btn-remove-brand-logo');

    // Referencias de UI (Admins)
    const formAdmin = document.getElementById('form-admin');
    const adminUserList = document.getElementById('admin-user-list');

    // Variables de estado temporal para imágenes subidas
    let currentProductImageBase64 = '';
    let currentBrandLogoBase64 = '';
    let currentInvImageBase64 = '';

    // --- State Initialization ---
    let admins = JSON.parse(localStorage.getItem('ferreteria_admins'));
    if (!admins || admins.length === 0) {
        admins = [{ name: 'Administrador Principal', user: 'admin', pass: 'admin' }];
        localStorage.setItem('ferreteria_admins', JSON.stringify(admins));
    }

    let products = JSON.parse(localStorage.getItem('ferreteria_productos'));
    if (!products || products.length === 0) {
        products = [
            { id: 1, name: "Set de Llaves Profesionales", category: "Herramientas", price: 45.00, icon: "fa-wrench", isRecommended: true, isOffer: false, discountPrice: null },
            { id: 2, name: "Fregadero de Acero Inoxidable", category: "Plomería", price: 120.00, icon: "fa-sink", isRecommended: false, isOffer: true, discountPrice: 99.00 },
            { id: 3, name: "Cubeta de Pintura Acrílica (Blanco)", category: "Pinturas", price: 55.00, icon: "fa-paint-roller", isRecommended: true, isOffer: false, discountPrice: null },
            { id: 4, name: "Kit de Reparación de Tuberías", category: "Plomería", price: 25.00, icon: "fa-screwdriver-wrench", isRecommended: false, isOffer: true, discountPrice: 18.00 }
        ];
        localStorage.setItem('ferreteria_productos', JSON.stringify(products));
    }

    let brands = JSON.parse(localStorage.getItem('ferreteria_marcas'));
    if (!brands) {
        brands = [
            { id: 1, name: 'Stanley', logo: '' },
            { id: 2, name: 'Truper', logo: '' },
            { id: 3, name: 'Pretul', logo: '' }
        ];
        localStorage.setItem('ferreteria_marcas', JSON.stringify(brands));
    }

    let inventory = JSON.parse(localStorage.getItem('ferreteria_inventario')) || [];

    // Helper to compress image and convert to Base64 (Canvas API)
    function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // Manejadores de vista previa para imágenes de productos
    function showProductImagePreview(src, name = 'Imagen cargada') {
        prodImagePreview.src = src;
        prodImageName.textContent = name;
        prodImagePreviewContainer.style.display = 'flex';
        if (!src.startsWith('data:')) {
            prodImageUrl.value = src;
        } else {
            prodImageUrl.value = '';
        }
    }

    function removeProductImage() {
        currentProductImageBase64 = '';
        prodImageFile.value = '';
        prodImageUrl.value = '';
        prodImagePreview.src = '';
        prodImageName.textContent = '';
        prodImagePreviewContainer.style.display = 'none';
    }

    prodImageFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64 = await compressImage(file);
                currentProductImageBase64 = base64;
                showProductImagePreview(base64, file.name);
            } catch (err) {
                console.error('Error al procesar la imagen:', err);
                alert('No se pudo procesar la imagen seleccionada.');
            }
        }
    });

    prodImageUrl.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            currentProductImageBase64 = '';
            showProductImagePreview(url, 'Imagen desde URL');
        } else {
            removeProductImage();
        }
    });

    btnRemoveProdImage.addEventListener('click', removeProductImage);

    // Manejadores de vista previa para logos de marcas
    function showBrandLogoPreview(src, name = 'Logo cargado') {
        brandLogoPreview.src = src;
        brandLogoName.textContent = name;
        brandLogoPreviewContainer.style.display = 'flex';
        if (!src.startsWith('data:')) {
            brandLogo.value = src;
        } else {
            brandLogo.value = '';
        }
    }

    function removeBrandLogo() {
        currentBrandLogoBase64 = '';
        brandLogoFile.value = '';
        brandLogo.value = '';
        brandLogoPreview.src = '';
        brandLogoName.textContent = '';
        brandLogoPreviewContainer.style.display = 'none';
    }

    brandLogoFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64 = await compressImage(file);
                currentBrandLogoBase64 = base64;
                showBrandLogoPreview(base64, file.name);
            } catch (err) {
                console.error('Error al procesar el logo:', err);
                alert('No se pudo procesar la imagen del logo.');
            }
        }
    });

    brandLogo.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            currentBrandLogoBase64 = '';
            showBrandLogoPreview(url, 'Logo desde URL');
        } else {
            removeBrandLogo();
        }
    });

    btnRemoveBrandLogo.addEventListener('click', removeBrandLogo);

    // =====================
    // Inventario - Imagen
    // =====================
    const invImageUrl = document.getElementById('inv-image-url');
    const invImageFile = document.getElementById('inv-image-file');
    const invImagePreviewContainer = document.getElementById('inv-image-preview-container');
    const invImagePreview = document.getElementById('inv-image-preview');
    const invImageName = document.getElementById('inv-image-name');
    const btnRemoveInvImage = document.getElementById('btn-remove-inv-image');

    function showInvImagePreview(src, name = 'Imagen cargada') {
        invImagePreview.src = src;
        invImageName.textContent = name;
        invImagePreviewContainer.style.display = 'flex';
        if (!src.startsWith('data:')) {
            invImageUrl.value = src;
        } else {
            invImageUrl.value = '';
        }
    }

    function removeInvImage() {
        currentInvImageBase64 = '';
        invImageFile.value = '';
        invImageUrl.value = '';
        invImagePreview.src = '';
        invImageName.textContent = '';
        invImagePreviewContainer.style.display = 'none';
    }

    invImageFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64 = await compressImage(file);
                currentInvImageBase64 = base64;
                showInvImagePreview(base64, file.name);
            } catch (err) {
                console.error('Error al procesar imagen de inventario:', err);
                alert('No se pudo procesar la imagen.');
            }
        }
    });

    invImageUrl.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            currentInvImageBase64 = '';
            showInvImagePreview(url, 'Imagen desde URL');
        } else {
            removeInvImage();
        }
    });

    btnRemoveInvImage.addEventListener('click', removeInvImage);

    // --- Auth Logic ---
    function checkAuth() {
        const loggedUser = sessionStorage.getItem('ferreteria_logged_in');
        if (loggedUser) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            
            const currentAdmin = admins.find(a => a.user === loggedUser);
            if (currentAdmin) {
                currentAdminName.textContent = currentAdmin.name;
            }
            
            renderProducts();
            renderAdmins();
            renderBrands();
            renderInventory();
        } else {
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
    }

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = loginUser.value.trim();
        const pass = loginPass.value.trim();

        const match = admins.find(a => a.user === user && a.pass === pass);
        if (match) {
            loginError.style.display = 'none';
            sessionStorage.setItem('ferreteria_logged_in', match.user);
            formLogin.reset();
            checkAuth();
        } else {
            loginError.style.display = 'block';
        }
    });

    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('ferreteria_logged_in');
        checkAuth();
    });

    // --- Tab Navigation ---
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs and sections
            adminTabs.forEach(t => t.classList.remove('active'));
            adminSections.forEach(s => s.classList.remove('active'));

            // Add active to clicked tab and corresponding section
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // Toggle offer price field
    prodOffer.addEventListener('change', () => {
        offerPriceGroup.style.display = prodOffer.checked ? 'block' : 'none';
    });

    // --- Products Management ---
    function renderProducts() {
        adminProductList.innerHTML = '';
        products.forEach(p => {
            const badges = [];
            if (p.isRecommended) badges.push('<span style="background:#DBEAFE; color:#1E40AF; padding:2px 7px; border-radius:10px; font-size:0.75rem; margin-right:4px;">⭐ Recomendado</span>');
            if (p.isOffer) badges.push('<span style="background:#FEF3C7; color:#92400E; padding:2px 7px; border-radius:10px; font-size:0.75rem;">🏷️ Oferta</span>');
            
            const imageOrIcon = p.image 
                ? `<img src="${p.image}" style="height:30px; width:30px; object-fit:cover; border-radius:4px; margin-right:8px; vertical-align:middle;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';"><i class="fa-solid fa-box" style="display:none; color:var(--text-muted); margin-right:8px; vertical-align:middle;"></i>`
                : `<i class="fa-solid ${p.icon || 'fa-box'}" style="color:var(--text-muted); margin-right:8px; vertical-align:middle;"></i>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${p.id}</td>
                <td>
                    <div style="font-weight:600; display:flex; align-items:center;">
                        ${imageOrIcon}
                        <span>${p.name}</span>
                    </div>
                    <div style="margin-top:4px; padding-left:38px;">${badges.join('')}</div>
                </td>
                <td><span style="background:var(--bg-light); padding:3px 8px; border-radius:12px; font-size:0.8rem;">${p.category}</span></td>
                <td>
                    ${p.isOffer && p.discountPrice ? `<span style="text-decoration:line-through; color:var(--text-muted); font-size:0.85rem;">$${parseFloat(p.price).toFixed(2)}</span><br><strong style="color:var(--accent-blue);">$${parseFloat(p.discountPrice).toFixed(2)}</strong>` : `$${parseFloat(p.price).toFixed(2)}`}
                </td>
                <td>
                    <button class="action-btn btn-edit" onclick="editProduct(${p.id})" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn btn-delete" onclick="deleteProduct(${p.id})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            adminProductList.appendChild(tr);
        });
    }

    formProduct.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prod-id').value;
        const name = document.getElementById('prod-name').value;
        const price = parseFloat(document.getElementById('prod-price').value);
        const category = document.getElementById('prod-category').value;
        const icon = document.getElementById('prod-icon').value || 'fa-box';
        const isRecommended = document.getElementById('prod-recommended').checked;
        const isOffer = document.getElementById('prod-offer').checked;
        const discountPrice = isOffer ? parseFloat(document.getElementById('prod-discount-price').value) || null : null;

        const imageUrl = prodImageUrl.value.trim();
        const image = currentProductImageBase64 || imageUrl || null;

        const productData = { name, price, category, icon, isRecommended, isOffer, discountPrice, image };

        if (id) {
            const index = products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) products[index] = { id: parseInt(id), ...productData };
        } else {
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, ...productData });
        }

        saveProducts();
        resetProductForm();
    });

    window.editProduct = function(id) {
        const product = products.find(p => p.id === parseInt(id));
        if (product) {
            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-name').value = product.name;
            document.getElementById('prod-price').value = product.price;
            document.getElementById('prod-category').value = product.category;
            document.getElementById('prod-icon').value = product.icon || '';
            document.getElementById('prod-recommended').checked = !!product.isRecommended;
            document.getElementById('prod-offer').checked = !!product.isOffer;
            document.getElementById('prod-discount-price').value = product.discountPrice || '';
            offerPriceGroup.style.display = product.isOffer ? 'block' : 'none';
            productFormTitle.textContent = 'Editar Producto';
            btnCancelProd.style.display = 'inline-block';
            
            if (product.image) {
                if (product.image.startsWith('data:')) {
                    currentProductImageBase64 = product.image;
                    showProductImagePreview(product.image, 'Imagen subida');
                } else {
                    currentProductImageBase64 = '';
                    showProductImagePreview(product.image, 'Imagen desde URL');
                }
            } else {
                removeProductImage();
            }

            document.getElementById('prod-name').focus();
        }
    };

    window.deleteProduct = function(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            products = products.filter(p => p.id !== parseInt(id));
            saveProducts();
            
            // If editing the one we deleted, reset form
            if (document.getElementById('prod-id').value === id.toString()) {
                resetProductForm();
            }
        }
    };

    btnCancelProd.addEventListener('click', resetProductForm);

    function resetProductForm() {
        formProduct.reset();
        document.getElementById('prod-id').value = '';
        document.getElementById('prod-icon').value = 'fa-box';
        offerPriceGroup.style.display = 'none';
        productFormTitle.textContent = 'Añadir Nuevo Producto';
        btnCancelProd.style.display = 'none';
        removeProductImage();
    }

    function saveProducts() {
        localStorage.setItem('ferreteria_productos', JSON.stringify(products));
        renderProducts();
    }


    // --- Admins Management ---
    function renderAdmins() {
        adminUserList.innerHTML = '';
        admins.forEach(a => {
            const tr = document.createElement('tr');
            
            // Check if current user
            const isCurrent = sessionStorage.getItem('ferreteria_logged_in') === a.user;
            
            tr.innerHTML = `
                <td style="font-weight:600;">
                    ${a.name} ${isCurrent ? '<span style="color:#10B981; font-size:0.8em; margin-left:5px;">(Tú)</span>' : ''}
                </td>
                <td>@${a.user}</td>
                <td>
                    <button class="action-btn btn-delete" onclick="deleteAdmin('${a.user}')" title="Eliminar" ${admins.length === 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            adminUserList.appendChild(tr);
        });
    }

    formAdmin.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('adm-name').value.trim();
        const user = document.getElementById('adm-user').value.trim();
        const pass = document.getElementById('adm-pass').value.trim();

        if (admins.some(a => a.user === user)) {
            alert('Este nombre de usuario ya existe.');
            return;
        }

        admins.push({ name, user, pass });
        saveAdmins();
        formAdmin.reset();
    });

    window.deleteAdmin = function(user) {
        if (admins.length <= 1) {
            alert('No puedes eliminar al último administrador del sistema.');
            return;
        }
        
        const isCurrent = sessionStorage.getItem('ferreteria_logged_in') === user;
        if (isCurrent && !confirm('Estás a punto de eliminar tu propia cuenta. Serás desconectado. ¿Continuar?')) {
            return;
        }

        if (!isCurrent && confirm(`¿Eliminar al administrador "@${user}"?`)) {
            continueDelete();
        } else if (isCurrent) {
            continueDelete();
        }

        function continueDelete() {
            admins = admins.filter(a => a.user !== user);
            saveAdmins();
            
            if (isCurrent) {
                sessionStorage.removeItem('ferreteria_logged_in');
                checkAuth();
            }
        }
    };

    function saveAdmins() {
        localStorage.setItem('ferreteria_admins', JSON.stringify(admins));
        renderAdmins();
    }

    // =====================
    // Inventario Management
    // =====================
    const formInventario = document.getElementById('form-inventario');
    const adminInventoryList = document.getElementById('admin-inventory-list');
    const btnCancelInv = document.getElementById('btn-cancel-inv');
    const invFormTitle = document.getElementById('inv-form-title');

    function renderInventory() {
        adminInventoryList.innerHTML = '';
        inventory.forEach(p => {
            const imageOrIcon = p.image
                ? `<img src="${p.image}" style="height:30px; width:30px; object-fit:cover; border-radius:4px; margin-right:8px; vertical-align:middle;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';"><i class="fa-solid fa-box" style="display:none; color:var(--text-muted); margin-right:8px; vertical-align:middle;"></i>`
                : `<i class="fa-solid ${p.icon || 'fa-box'}" style="color:var(--text-muted); margin-right:8px; vertical-align:middle;"></i>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${p.id}</td>
                <td>
                    <div style="font-weight:600; display:flex; align-items:center;">
                        ${imageOrIcon}
                        <span>${p.name}</span>
                    </div>
                </td>
                <td><span style="background:var(--bg-light); padding:3px 8px; border-radius:12px; font-size:0.8rem;">${p.category}</span></td>
                <td>$${parseFloat(p.price).toFixed(2)}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editInventory(${p.id})" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn btn-delete" onclick="deleteInventory(${p.id})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            adminInventoryList.appendChild(tr);
        });
    }

    formInventario.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('inv-id').value;
        const name = document.getElementById('inv-name').value.trim();
        const price = parseFloat(document.getElementById('inv-price').value);
        const category = document.getElementById('inv-category').value.trim();
        const icon = document.getElementById('inv-icon').value || 'fa-box';
        const imageUrl = invImageUrl.value.trim();
        const image = currentInvImageBase64 || imageUrl || null;

        const item = { name, price, category, icon, image, isRecommended: false, isOffer: false, discountPrice: null };

        if (id) {
            const index = inventory.findIndex(p => p.id === parseInt(id));
            if (index !== -1) inventory[index] = { id: parseInt(id), ...item };
        } else {
            const newId = inventory.length > 0 ? Math.max(...inventory.map(p => p.id)) + 1 : 1;
            inventory.push({ id: newId, ...item });
        }

        saveInventory();
        resetInvForm();
    });

    window.editInventory = function(id) {
        const item = inventory.find(p => p.id === parseInt(id));
        if (item) {
            document.getElementById('inv-id').value = item.id;
            document.getElementById('inv-name').value = item.name;
            document.getElementById('inv-price').value = item.price;
            document.getElementById('inv-category').value = item.category;
            document.getElementById('inv-icon').value = item.icon || 'fa-box';
            invFormTitle.textContent = 'Editar Producto de Inventario';
            btnCancelInv.style.display = 'inline-block';

            if (item.image) {
                if (item.image.startsWith('data:')) {
                    currentInvImageBase64 = item.image;
                    showInvImagePreview(item.image, 'Imagen subida');
                } else {
                    currentInvImageBase64 = '';
                    showInvImagePreview(item.image, 'Imagen desde URL');
                }
            } else {
                removeInvImage();
            }

            document.getElementById('inv-name').focus();
        }
    };

    window.deleteInventory = function(id) {
        if (confirm('¿Eliminar este producto del inventario?')) {
            inventory = inventory.filter(p => p.id !== parseInt(id));
            if (document.getElementById('inv-id').value === id.toString()) {
                resetInvForm();
            }
            saveInventory();
        }
    };

    btnCancelInv.addEventListener('click', resetInvForm);

    function resetInvForm() {
        formInventario.reset();
        document.getElementById('inv-id').value = '';
        document.getElementById('inv-icon').value = 'fa-box';
        invFormTitle.textContent = 'Agregar al Inventario';
        btnCancelInv.style.display = 'none';
        removeInvImage();
    }

    function saveInventory() {
        localStorage.setItem('ferreteria_inventario', JSON.stringify(inventory));
        renderInventory();
    }

    // --- Brands Management ---
    function renderBrands() {
        adminBrandList.innerHTML = '';
        brands.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600; display:flex; align-items:center; gap:10px; padding:12px 15px;">
                    ${b.logo ? `<img src="${b.logo}" style="height:30px; max-width:80px; object-fit:contain;" onerror="this.style.display='none'">` : `<span style="background:var(--bg-light); width:40px; height:30px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-size:0.7rem; color:var(--text-muted);">Logo</span>`}
                    ${b.name}
                </td>
                <td>
                    <button class="action-btn btn-edit" onclick="editBrand(${b.id})" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn btn-delete" onclick="deleteBrand(${b.id})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            adminBrandList.appendChild(tr);
        });
    }

    formBrand.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('brand-id').value;
        const name = document.getElementById('brand-name').value.trim();
        const logoUrl = brandLogo.value.trim();
        const logo = currentBrandLogoBase64 || logoUrl || '';

        if (id) {
            const index = brands.findIndex(b => b.id === parseInt(id));
            if (index !== -1) brands[index] = { id: parseInt(id), name, logo };
        } else {
            const newId = brands.length > 0 ? Math.max(...brands.map(b => b.id)) + 1 : 1;
            brands.push({ id: newId, name, logo });
        }
        saveBrands();
        resetBrandForm();
    });

    window.editBrand = function(id) {
        const brand = brands.find(b => b.id === parseInt(id));
        if (brand) {
            document.getElementById('brand-id').value = brand.id;
            document.getElementById('brand-name').value = brand.name;
            btnCancelBrand.style.display = 'inline-block';

            if (brand.logo) {
                if (brand.logo.startsWith('data:')) {
                    currentBrandLogoBase64 = brand.logo;
                    showBrandLogoPreview(brand.logo, 'Logo subido');
                } else {
                    currentBrandLogoBase64 = '';
                    showBrandLogoPreview(brand.logo, 'Logo desde URL');
                }
            } else {
                removeBrandLogo();
            }
        }
    };

    window.deleteBrand = function(id) {
        if (confirm('¿Eliminar esta marca?')) {
            brands = brands.filter(b => b.id !== parseInt(id));
            saveBrands();
        }
    };

    btnCancelBrand.addEventListener('click', resetBrandForm);

    function resetBrandForm() {
        formBrand.reset();
        document.getElementById('brand-id').value = '';
        btnCancelBrand.style.display = 'none';
        removeBrandLogo();
    }

    function saveBrands() {
        localStorage.setItem('ferreteria_marcas', JSON.stringify(brands));
        renderBrands();
    }

    // Init
    checkAuth();
});
