// Fetch and render featured products from Supabase
document.addEventListener('DOMContentLoaded', async function() {
    const featuredGrid = document.querySelector('.products-grid');
    if (!featuredGrid) return;

    async function fetchFeatured() {
        const { data, error } = await window.supabaseClient
            .from('products')
            .select(`
                *,
                product_images (url, is_main, display_order)
            `)
            .eq('status', 'active')
            .eq('is_featured', true)
            .limit(4);

        if (error) {
            console.error('Error fetching featured products:', error);
            return;
        }

        if (data && data.length > 0) {
            renderFeatured(data);
        }
    }

    function renderFeatured(products) {
        featuredGrid.innerHTML = '';

        products.forEach(product => {
            const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0];
            const imageUrl = mainImage ? mainImage.url : 'images/placeholder.jpg';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" class="product-img">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <a href="produtos.html" class="btn">Ver Detalhes</a>
                </div>
            `;
            featuredGrid.appendChild(card);
        });
    }

    fetchFeatured();
});
