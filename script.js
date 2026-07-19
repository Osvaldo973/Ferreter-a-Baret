document.addEventListener('DOMContentLoaded', () => {
    // Variables Generales
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    const toast = document.getElementById('toast');

    // Variables del Carrito
    const cartCountEl = document.getElementById('cart-count');
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const btnComprar = document.getElementById('btn-comprar');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutNombre = document.getElementById('checkout-nombre');
    const checkoutApellido = document.getElementById('checkout-apellido');
    const checkoutTelefono = document.getElementById('checkout-telefono');

    let cartItemsList = JSON.parse(localStorage.getItem('ferreteria_carrito')) || [];
    let cartCount = cartItemsList.length;

    // ========================
    // Scroll Reveal Animation
    // ========================
    function observeRevealElements() {
        const revealElements = document.querySelectorAll('.reveal:not(.active)');
        const revealOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };
        const revealOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        revealElements.forEach(el => revealOnScroll.observe(el));
    }

    observeRevealElements();

    // Sombra y posición del Navbar al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.style.top = '0';
            navbar.style.boxShadow = '0 6px 20px rgba(30, 58, 138, 0.4)';
            navbar.style.padding = '10px 0';
        } else {
            navbar.style.top = '40px';
            navbar.style.boxShadow = '0 4px 20px rgba(30, 58, 138, 0.3)';
            navbar.style.padding = '15px 0';
        }
    });

    // Menú Móvil
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-xmark');
        } else {
            icon.classList.replace('fa-xmark', 'fa-bars');
        }
    });

    // Cerrar menú móvil al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
        });
    });

    // ========================
    // Productos (Catálogo Principal)
    // ========================
    function initProducts() {
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

        renderProducts(products);
        renderOfertas(products);
        renderRecomendados(products);
        initSearchAndFilters(products);
        // Re-observar elementos reveal recién inyectados
        setTimeout(observeRevealElements, 100);
    }

    function initSearchAndFilters(products) {
        const searchInput = document.getElementById('search-input');
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (!searchInput && filterBtns.length === 0) return;

        let activeCategory = 'All';
        let searchQuery = '';

        function filterAndRender() {
            const filtered = products.filter(p => {
                const matchesCategory = (activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase());
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            });
            renderProducts(filtered);
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                filterAndRender();
            });
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category');
                filterAndRender();
            });
        });
    }

    // ========================
    // Función base para crear una tarjeta de producto
    // ========================
    function createProductCardHTML(product, showBadges = true) {
        const isOffer = product.isOffer || product.onSale;
        const isRecommended = product.isRecommended || product.recommended;

        const priceBlock = (isOffer && product.discountPrice)
            ? `<div class="price-block">
                <span class="price-original">$${parseFloat(product.price).toFixed(2)}</span>
                <span class="price-oferta">$${parseFloat(product.discountPrice).toFixed(2)}</span>
               </div>`
            : `<div class="price-block"><span class="price">$${parseFloat(product.price).toFixed(2)}</span></div>`;

        const badgeOferta = (showBadges && isOffer)
            ? `<span class="badge-oferta"><i class="fa-solid fa-bolt"></i> Oferta</span>` : '';
        const badgeRec = (showBadges && isRecommended)
            ? `<span class="badge-recomendado"><i class="fa-solid fa-star"></i></span>` : '';

        const displayPrice = (isOffer && product.discountPrice)
            ? product.discountPrice : product.price;

        return `
            <div class="product-card reveal">
                ${badgeOferta}
                ${badgeRec}
                <div class="product-image">
                    <div class="placeholder-img">
                        <i class="fa-solid ${product.icon || 'fa-box'}"></i>
                    </div>
                </div>
                <div class="product-info">
                    <span class="category">${product.category}</span>
                    <h3>${product.name}</h3>
                    ${priceBlock}
                    <button class="btn btn-primary add-to-cart"
                        data-name="${product.name}"
                        data-price="${displayPrice}">
                        <i class="fa-solid fa-cart-plus" style="margin-right:6px;"></i>Añadir al carrito
                    </button>
                </div>
            </div>
        `;
    }

    // ========================
    // Renderizar Catálogo Principal
    // ========================
    function renderProducts(products) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = `<div class="empty-section-msg"><i class="fa-solid fa-box-open"></i>No hay productos disponibles.</div>`;
            return;
        }

        products.forEach(product => {
            productGrid.insertAdjacentHTML('beforeend', createProductCardHTML(product));
        });

        bindAddToCartButtons();
    }

    // ========================
    // Renderizar Ofertas Especiales
    // ========================
    function renderOfertas(products) {
        const grid = document.getElementById('ofertas-grid');
        const section = document.getElementById('ofertas');
        if (!grid) return;

        const ofertas = products.filter(p => p.isOffer || p.onSale);

        if (ofertas.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = '';
        grid.innerHTML = '';

        ofertas.forEach(product => {
            grid.insertAdjacentHTML('beforeend', createProductCardHTML(product));
        });

        bindAddToCartButtons();
    }

    // ========================
    // Renderizar Artículos Recomendados
    // ========================
    function renderRecomendados(products) {
        const grid = document.getElementById('recomendados-grid');
        const section = document.getElementById('recomendados');
        if (!grid) return;

        const recomendados = products.filter(p => p.isRecommended || p.recommended);

        if (recomendados.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = '';
        grid.innerHTML = '';

        recomendados.forEach(product => {
            grid.insertAdjacentHTML('beforeend', createProductCardHTML(product));
        });

        bindAddToCartButtons();
    }

    // ========================
    // Renderizar Marcas
    // ========================
    function renderBrands() {
        const container = document.getElementById('brands-container');
        const section = document.getElementById('marcas');
        if (!container) return;

        const brands = JSON.parse(localStorage.getItem('ferreteria_marcas')) || [];

        if (brands.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = '';
        container.innerHTML = '';

        brands.forEach(brand => {
            const brandHTML = brand.logo
                ? `<div class="brand-card reveal">
                       <img src="${brand.logo}" alt="Logo ${brand.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                       <i class="fa-solid fa-industry" style="display:none;"></i>
                       <span class="brand-name">${brand.name}</span>
                   </div>`
                : `<div class="brand-card reveal">
                       <i class="fa-solid fa-industry"></i>
                       <span class="brand-name">${brand.name}</span>
                   </div>`;
            container.insertAdjacentHTML('beforeend', brandHTML);
        });
    }

    // Vincular eventos a los botones de añadir al carrito
    function bindAddToCartButtons() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            // Evitar doble-bind
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', handleAddToCart);
        });
    }

    // Inicializar todo
    initProducts();
    renderBrands();

    // Inicializar el carrito en la UI al cargar la página
    if (cartCountEl) {
        cartCountEl.textContent = cartCount;
    }
    renderCart();

    // ========================
    // Carrito
    // ========================
    function handleAddToCart(e) {
        e.preventDefault();
        const productName = e.currentTarget.getAttribute('data-name');
        const price = parseFloat(e.currentTarget.getAttribute('data-price'));

        cartItemsList.push({ name: productName, price: price });
        localStorage.setItem('ferreteria_carrito', JSON.stringify(cartItemsList));
        cartCount = cartItemsList.length;

        cartCountEl.classList.remove('pulse-anim');
        void cartCountEl.offsetWidth;
        cartCountEl.classList.add('pulse-anim');

        setTimeout(() => {
            cartCountEl.textContent = cartCount;
        }, 100);

        renderCart();
        showToast(`<i class="fa-solid fa-circle-check"></i> "${productName}" añadido al carrito`);
    }

    function toggleCart(e) {
        if (e) e.preventDefault();
        cartSidebar.classList.toggle('active');

        if (cartSidebar.classList.contains('active')) {
            cartOverlay.style.display = 'block';
            setTimeout(() => cartOverlay.classList.add('active'), 10);
        } else {
            cartOverlay.classList.remove('active');
            setTimeout(() => { cartOverlay.style.display = 'none'; }, 300);
        }
    }

    cartIcon.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cartItemsList.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fa-solid fa-cart-shopping" style="font-size:3rem; opacity:0.2; margin-bottom:15px; display:block;"></i>
                    Tu carrito está vacío
                </div>`;
        } else {
            cartItemsList.forEach((item, index) => {
                total += item.price;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <button class="remove-item" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                    cartItemsList.splice(idx, 1);
                    localStorage.setItem('ferreteria_carrito', JSON.stringify(cartItemsList));
                    cartCount = cartItemsList.length;
                    cartCountEl.textContent = cartCount;
                    renderCart();
                });
            });
        }

        cartTotalPrice.textContent = '$' + total.toFixed(2);
    }

    // Proceder al Pago / WhatsApp
    btnComprar.addEventListener('click', () => {
        if (cartItemsList.length === 0) {
            showToast('El carrito está vacío');
            return;
        }

        if (checkoutForm.style.display === 'none') {
            checkoutForm.style.display = 'block';
            btnComprar.textContent = 'Enviar Pedido por WhatsApp';
            btnComprar.style.background = '#25D366';
        } else {
            const nombre = checkoutNombre.value.trim();
            const apellido = checkoutApellido.value.trim();
            const telefono = checkoutTelefono.value.trim();

            if (!nombre || !apellido || !telefono) {
                showToast('Por favor, completa tus datos');
                return;
            }

            let mensaje = `Hola, soy ${nombre} ${apellido}.\nTeléfono: ${telefono}\nMe gustaría hacer el siguiente pedido:\n\n`;
            let totalPedido = 0;

            cartItemsList.forEach(item => {
                mensaje += `- 1x ${item.name} ($${item.price.toFixed(2)})\n`;
                totalPedido += item.price;
            });

            mensaje += `\n*Total a pagar: $${totalPedido.toFixed(2)}*`;

            const numeroWhatsApp = '18096090047';
            window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, '_blank');

            cartItemsList = [];
            localStorage.setItem('ferreteria_carrito', JSON.stringify(cartItemsList));
            cartCount = 0;
            cartCountEl.textContent = 0;
            renderCart();
            checkoutForm.style.display = 'none';
            checkoutNombre.value = '';
            checkoutApellido.value = '';
            checkoutTelefono.value = '';
            btnComprar.textContent = 'Proceder al Pago';
            btnComprar.style.background = '';

            toggleCart();
            showToast('¡Pedido enviado por WhatsApp!');
        }
    });

    // Toast
    function showToast(message) {
        if (toast) {
            toast.innerHTML = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        } else {
            alert(message.replace(/<[^>]*>/g, ''));
        }
    }

    // Formulario de Presupuesto en servicios.html
    const formPresupuesto = document.getElementById('form-presupuesto');
    if (formPresupuesto) {
        formPresupuesto.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('pres-nombre').value.trim();
            const telefono = document.getElementById('pres-telefono').value.trim();
            const servicio = document.getElementById('pres-servicio').value;
            const detalles = document.getElementById('pres-detalles').value.trim();

            if (!nombre || !telefono || !detalles) {
                showToast('Por favor, completa todos los campos requeridos');
                return;
            }

            let mensaje = `*Solicitud de Presupuesto - Ferretería Baret*\n\n`;
            mensaje += `*Nombre:* ${nombre}\n`;
            mensaje += `*Teléfono:* ${telefono}\n`;
            mensaje += `*Servicio de Interés:* ${servicio}\n\n`;
            mensaje += `*Detalles / Materiales a cotizar:*\n${detalles}\n`;

            const numeroWhatsApp = '18096090047';
            window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, '_blank');

            formPresupuesto.reset();
            showToast('<i class="fa-solid fa-circle-check"></i> ¡Solicitud de presupuesto enviada!');
        });
    }
});
