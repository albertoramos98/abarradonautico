// Fetch and render products from Supabase
document.addEventListener('DOMContentLoaded', async function() {
    const productGrid = document.querySelector('.product-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    if (!productGrid) return;

    // Show loading state (optional, can use existing cards as placeholders)
    // productGrid.innerHTML = '<p>Carregando produtos...</p>';

    async function fetchProducts(category = 'Todos') {
        let query = window.supabaseClient
            .from('products')
            .select(`
                *,
                inventory (quantity, hide_if_out_of_stock),
                product_images (url, is_main, display_order)
            `)
            .eq('status', 'active');

        if (category !== 'Todos') {
            query = query.eq('category', category);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return;
        }

        renderProducts(data);
    }

    function renderProducts(products) {
        productGrid.innerHTML = '';

        products.forEach(product => {
            // Check if product should be hidden (out of stock rule)
            const inventory = product.inventory ? product.inventory[0] : null;
            if (inventory && inventory.quantity <= 0 && inventory.hide_if_out_of_stock) {
                return;
            }

            const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0];
            const imageUrl = mainImage ? mainImage.url : 'images/placeholder.jpg';
            const isOutOfStock = inventory && inventory.quantity <= 0;

            const card = document.createElement('div');
            card.className = 'product-card';
            if (isOutOfStock) card.style.opacity = '0.7';

            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" class="product-img">
                <div class="product-info">
                    <h3>${product.name.toUpperCase()}</h3>
                    <p>R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    ${isOutOfStock ? 
                        '<span class="out-of-stock" style="color: var(--vermelho); font-weight: bold; display: block; margin-bottom: 10px;">ESGOTADO</span>' : 
                        `<button class="btn" onclick="cartHook.addItem({id:'${product.id}', name:'${product.name}', price:${product.price}, image:'${imageUrl}'})">ADICIONAR AO CARRINHO</button>`
                    }
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.textContent.trim();
            fetchProducts(category);
        });
    });

    // Initial fetch
    fetchProducts();
});

// Mock addToCart for now
window.addToCart = function(productId) {
    alert('Produto adicionado ao carrinho (em desenvolvimento)');
};
