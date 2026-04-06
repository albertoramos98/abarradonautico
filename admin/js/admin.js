// Admin Dashboard Logic
let selectedFiles = [];
let currentProductImages = [];
let aboutHomeFile = null;

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Auth Check
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session || session.user.user_metadata.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('user-email').textContent = session.user.email;

    // 2. Tab Switching
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            document.getElementById(targetId).classList.add('active');
            
            if (targetId === 'products') loadProducts();
            if (targetId === 'cms') loadCMS();
            if (targetId === 'gallery') loadGallery();
            if (targetId === 'about') loadAbout();
        });
    });

    // Initial Load
    loadProducts();

    // Forms
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('gallery-form').addEventListener('submit', handleGallerySubmit);
    document.getElementById('about-form').addEventListener('submit', handleAboutSubmit);
});

async function logout() {
    await window.supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// --- PRODUCT MANAGEMENT ---
async function loadProducts() {
    const { data, error } = await window.supabaseClient
        .from('products')
        .select('*, inventory(quantity, hide_if_out_of_stock), product_images(*)');
    if (error) return console.error(error);
    const tbody = document.getElementById('product-list-body');
    tbody.innerHTML = '';
    data.forEach(product => {
        const mainImg = product.product_images.find(img => img.is_main) || product.product_images[0];
        const imgUrl = mainImg ? mainImg.url : '../images/placeholder.jpg';
        const stock = product.inventory[0]?.quantity || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${imgUrl}" style="width:50px; height:50px; object-fit:cover;"></td>
            <td>${product.name}</td>
            <td>R$ ${product.price.toFixed(2)}</td>
            <td>${stock}</td>
            <td>
                <button onclick="editProduct('${product.id}')" class="btn-icon btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct('${product.id}')" class="btn-icon btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    document.getElementById('modal-title').textContent = product ? 'EDITAR PRODUTO' : 'NOVO PRODUTO';
    form.reset();
    document.getElementById('product-id').value = product ? product.id : '';
    document.getElementById('preview-container').innerHTML = '';
    selectedFiles = [];
    currentProductImages = [];
    if (product) {
        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-desc').value = product.description || '';
        document.getElementById('prod-price').value = product.price;
        document.getElementById('prod-category').value = product.category;
        document.getElementById('prod-stock').value = product.inventory[0]?.quantity || 0;
        currentProductImages = product.product_images || [];
        renderImagePreviews();
    }
    modal.style.display = 'flex';
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('prod-name').value;
    const description = document.getElementById('prod-desc').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const category = document.getElementById('prod-category').value;
    const quantity = parseInt(document.getElementById('prod-stock').value);

    let productId = id;
    if (id) {
        await window.supabaseClient.from('products').update({ name, description, price, category }).eq('id', id);
    } else {
        const { data } = await window.supabaseClient.from('products').insert([{ name, description, price, category }]).select().single();
        productId = data.id;
    }
    await window.supabaseClient.from('inventory').upsert({ product_id: productId, quantity });
    
    for (const file of selectedFiles) {
        const fileName = `products/${Date.now()}-${file.name}`;
        const { data: uploadData } = await window.supabaseClient.storage.from('products').upload(fileName, file);
        if (uploadData) {
            const { data: { publicUrl } } = window.supabaseClient.storage.from('products').getPublicUrl(fileName);
            await window.supabaseClient.from('product_images').insert({ product_id: productId, url: publicUrl });
        }
    }
    alert('PRODUTO SALVO!');
    closeModal('product-modal');
    loadProducts();
}

function validateAndPreviewImages(input) {
    const files = Array.from(input.files);
    files.forEach(file => {
        if (file.size > 2 * 1024 * 1024) return alert('Máximo 2MB');
        selectedFiles.push(file);
        renderImagePreviews();
    });
}

function renderImagePreviews() {
    const container = document.getElementById('preview-container');
    container.innerHTML = '';
    currentProductImages.forEach(img => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.innerHTML = `<img src="${img.url}"><button type="button" class="btn-delete-img" onclick="removeExistingImage('${img.id}')">&times;</button>`;
        container.appendChild(div);
    });
    selectedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.innerHTML = `<img src="${URL.createObjectURL(file)}"><button type="button" class="btn-delete-img" onclick="removeSelectedFile(${index})">&times;</button>`;
        container.appendChild(div);
    });
}

async function removeExistingImage(id) {
    if (confirm('EXCLUIR IMAGEM?')) {
        await window.supabaseClient.from('product_images').delete().eq('id', id);
        currentProductImages = currentProductImages.filter(img => img.id !== id);
        renderImagePreviews();
    }
}

function removeSelectedFile(index) {
    selectedFiles.splice(index, 1);
    renderImagePreviews();
}

async function deleteProduct(id) {
    if (confirm('Deseja excluir este produto?')) {
        await window.supabaseClient.from('products').delete().eq('id', id);
        loadProducts();
    }
}

// --- CMS MANAGEMENT ---
async function loadCMS() {
    const { data } = await window.supabaseClient.from('site_content').select('*');
    const container = document.getElementById('cms-list');
    container.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card-admin';
        div.style.padding = '15px';
        div.innerHTML = `<label>${item.description || item.key}</label><textarea id="cms-${item.id}">${item.value}</textarea><button onclick="saveCMS('${item.id}')" class="btn-admin" style="margin-top:10px;">SALVAR</button>`;
        container.appendChild(div);
    });
}

async function saveCMS(id) {
    const val = document.getElementById(`cms-${id}`).value;
    await window.supabaseClient.from('site_content').update({ value: val }).eq('id', id);
    alert('CONTEÚDO SALVO!');
}

// --- GALLERY MANAGEMENT ---
function openGalleryModal() {
    document.getElementById('gallery-form').reset();
    document.getElementById('gallery-modal').style.display = 'flex';
}

async function loadGallery(category = 'Todos') {
    let query = window.supabaseClient.from('gallery').select('*');
    if (category !== 'Todos') query = query.eq('category', category);
    const { data } = await query.order('created_at', { ascending: false });
    
    const container = document.getElementById('gallery-list');
    container.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.style.width = '150px';
        div.style.height = '150px';
        div.innerHTML = `<img src="${item.url}"><button onclick="deleteGallery('${item.id}')" class="btn-delete-img">&times;</button>`;
        container.appendChild(div);
    });
}

function filterGallery(cat) {
    document.querySelectorAll('.filter-btn-admin').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    loadGallery(cat);
}

async function handleGallerySubmit(e) {
    e.preventDefault();
    const cat = document.getElementById('gal-category').value;
    const desc = document.getElementById('gal-desc').value;
    const file = document.getElementById('gal-image').files[0];

    const fileName = `gallery/${Date.now()}-${file.name}`;
    const { data: uploadData } = await window.supabaseClient.storage.from('products').upload(fileName, file);
    if (uploadData) {
        const { data: { publicUrl } } = window.supabaseClient.storage.from('products').getPublicUrl(fileName);
        await window.supabaseClient.from('gallery').insert({ url: publicUrl, category: cat, description: desc });
        alert('FOTO ADICIONADA!');
        closeModal('gallery-modal');
        loadGallery();
    }
}

async function deleteGallery(id) {
    if (confirm('EXCLUIR FOTO?')) {
        await window.supabaseClient.from('gallery').delete().eq('id', id);
        loadGallery();
    }
}

// --- ABOUT MANAGEMENT ---
function previewHomeImage(input) {
    if (input.files && input.files[0]) {
        aboutHomeFile = input.files[0];
        document.getElementById('home-image-preview').innerHTML = `<div class="image-preview-item"><img src="${URL.createObjectURL(aboutHomeFile)}"></div>`;
    }
}

async function loadAbout() {
    // Carregar textos
    const { data } = await window.supabaseClient.from('about_section').select('*').limit(1).single();
    if (data) {
        document.getElementById('about-fundacao').value = data.fundacao || '';
        document.getElementById('about-bandeirao').value = data.bandeirao || '';
        document.getElementById('about-crescimento').value = data.crescimento || '';
        document.getElementById('about-acoes').value = data.acoes_sociais || '';
        document.getElementById('about-loja').value = data.loja_oficial || '';
    }

    // Carregar imagem da Home do CMS
    const { data: cmsImg } = await window.supabaseClient.from('site_content').select('value').eq('key', 'about_img').single();
    if (cmsImg) {
        document.getElementById('home-image-preview').innerHTML = `<div class="image-preview-item"><img src="${cmsImg.value}"></div>`;
    }
}

async function handleAboutSubmit(e) {
    e.preventDefault();
    const fundacao = document.getElementById('about-fundacao').value;
    const bandeirao = document.getElementById('about-bandeirao').value;
    const crescimento = document.getElementById('about-crescimento').value;
    const acoes_sociais = document.getElementById('about-acoes').value;
    const loja_oficial = document.getElementById('about-loja').value;

    const updateData = { fundacao, bandeirao, crescimento, acoes_sociais, loja_oficial };

    // 1. Salvar Textos
    const { data: current } = await window.supabaseClient.from('about_section').select('id').limit(1).single();
    if (current) {
        await window.supabaseClient.from('about_section').update(updateData).eq('id', current.id);
    } else {
        await window.supabaseClient.from('about_section').insert([updateData]);
    }

    // 2. Salvar Imagem da Home se houver novo arquivo
    if (aboutHomeFile) {
        const fileName = `cms/about_home_${Date.now()}.jpg`;
        const { data: uploadData } = await window.supabaseClient.storage.from('products').upload(fileName, aboutHomeFile);
        if (uploadData) {
            const { data: { publicUrl } } = window.supabaseClient.storage.from('products').getPublicUrl(fileName);
            await window.supabaseClient.from('site_content').upsert({ key: 'about_img', value: publicUrl, description: 'Imagem Quem Somos (Home)' });
        }
    }

    alert('DADOS DA HISTÓRIA E IMAGEM SALVOS!');
    aboutHomeFile = null;
    loadAbout();
}
