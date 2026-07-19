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

    // Referencias de UI (Marcas)
    const formBrand = document.getElementById('form-brand');
    const adminBrandList = document.getElementById('admin-brand-list');
    const btnCancelBrand = document.getElementById('btn-cancel-brand');

    // Referencias de UI (Admins)
    const formAdmin = document.getElementById('form-admin');
    const adminUserList = document.getElementById('admin-user-list');

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
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${p.id}</td>
                <td>
                    <div style="font-weight:600;"><i class="fa-solid ${p.icon}" style="color:var(--text-muted); margin-right:8px;"></i>${p.name}</div>
                    <div style="margin-top:4px;">${badges.join('')}</div>
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

        const productData = { name, price, category, icon, isRecommended, isOffer, discountPrice };

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
            document.getElementById('prod-icon').value = product.icon;
            document.getElementById('prod-recommended').checked = !!product.isRecommended;
            document.getElementById('prod-offer').checked = !!product.isOffer;
            document.getElementById('prod-discount-price').value = product.discountPrice || '';
            offerPriceGroup.style.display = product.isOffer ? 'block' : 'none';
            productFormTitle.textContent = 'Editar Producto';
            btnCancelProd.style.display = 'inline-block';
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
        const logo = document.getElementById('brand-logo').value.trim();

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
            document.getElementById('brand-logo').value = brand.logo || '';
            btnCancelBrand.style.display = 'inline-block';
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
    }

    function saveBrands() {
        localStorage.setItem('ferreteria_marcas', JSON.stringify(brands));
        renderBrands();
    }

    // Init
    checkAuth();
});
