// Admin Dashboard Logic
let selectedFiles = [];
let currentProductImages = [];

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
            document.getElementById(tab.dataset.tab).classList.add('active');
            
            if (tab.dataset.tab === 'products') loadProducts();
            if (tab.dataset.tab === 'cms') loadCMS();
        });
    });

    // Initial Load
    loadProducts();

    // 3. Product Form Submission
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
});

async function logout() {
    await window.supabaseClient.auth.signOut();
    window.location.href = 'index.html';
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
            <td>${product.category}</td>
            <td><span style="color: ${product.status === 'active' ? 'green' : 'red'}">${product.status}</span></td>
            <td>
                <button onclick="editProduct('${product.id}')" class="btn" style="padding: 2px 8px; font-size: 0.8rem;">Editar</button>
                <button onclick="deleteProduct('${product.id}')" class="btn" style="padding: 2px 8px; font-size: 0.8rem; background: red;">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('preview-container').innerHTML = '';
    selectedFiles = [];
    currentProductImages = [];

    if (product) {
        title.textContent = 'Editar Produto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-desc').value = product.description;
        document.getElementById('prod-price').value = product.price;
        document.getElementById('prod-category').value = product.category;
        document.getElementById('prod-status').value = product.status;
        
        if (product.inventory[0]) {
            document.getElementById('prod-stock').value = product.inventory[0].quantity;
            document.getElementById('prod-hide-out').checked = product.inventory[0].hide_if_out_of_stock;
        }

        currentProductImages = product.product_images || [];
        renderImagePreviews();
    } else {
        title.textContent = 'Novo Produto';
    }

    modal.style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

async function editProduct(id) {
    const { data, error } = await window.supabaseClient
        .from('products')
        .select('*, inventory(quantity, hide_if_out_of_stock), product_images(*)')
        .eq('id', id)
        .single();
    
    if (data) openProductModal(data);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('prod-name').value;
    const description = document.getElementById('prod-desc').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const category = document.getElementById('prod-category').value;
    const status = document.getElementById('prod-status').value;
    const quantity = parseInt(document.getElementById('prod-stock').value);
    const hideIfOut = document.getElementById('prod-hide-out').checked;

    let productId = id;

    // 1. Save Product
    if (id) {
        const { error } = await window.supabaseClient.from('products').update({
            name, description, price, category, status
        }).eq('id', id);
        if (error) return alert(error.message);
    } else {
        const { data, error } = await window.supabaseClient.from('products').insert([{
            name, description, price, category, status
        }]).select().single();
        if (error) return alert(error.message);
        productId = data.id;
    }

    // 2. Save Inventory
    await window.supabaseClient.from('inventory').upsert({
        product_id: productId,
        quantity: quantity,
        hide_if_out_of_stock: hideIfOut
    });

    // 3. Upload New Images
    for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await window.supabaseClient.storage
            .from('products')
            .upload(filePath, file);

        if (!uploadError) {
            const { data: { publicUrl } } = window.supabaseClient.storage
                .from('products')
                .getPublicUrl(filePath);

            await window.supabaseClient.from('product_images').insert({
                product_id: productId,
                url: publicUrl,
                is_main: false
            });
        }
    }

    alert('Produto salvo com sucesso!');
    closeProductModal();
    loadProducts();
}

// --- IMAGE VALIDATION & PREVIEW ---

function validateAndPreviewImages(input) {
    const files = Array.from(input.files);
    
    files.forEach(file => {
        // Size check (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert(`Imagem ${file.name} excede 2MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Dimension check
                if (img.width < 500 || img.height < 500) {
                    alert(`Imagem ${file.name} muito pequena (mínimo 500x500px).`);
                    return;
                }
                
                // Ratio check (with some tolerance)
                const ratio = img.width / img.height;
                if (ratio < 0.9 || ratio > 1.1) {
                    alert(`Imagem ${file.name} não está na proporção 1:1.`);
                }

                selectedFiles.push(file);
                renderImagePreviews();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function renderImagePreviews() {
    const container = document.getElementById('preview-container');
    container.innerHTML = '';

    // Existing Images
    currentProductImages.forEach(img => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.innerHTML = `
            <img src="${img.url}">
            <button type="button" class="btn-delete-img" onclick="removeExistingImage('${img.id}')">&times;</button>
        `;
        container.appendChild(div);
    });

    // New Selected Files
    selectedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        const url = URL.createObjectURL(file);
        div.innerHTML = `
            <img src="${url}">
            <button type="button" class="btn-delete-img" onclick="removeSelectedFile(${index})">&times;</button>
        `;
        container.appendChild(div);
    });
}

async function removeExistingImage(id) {
    if (confirm('Excluir esta imagem?')) {
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
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        await window.supabaseClient.from('products').delete().eq('id', id);
        loadProducts();
    }
}

// --- CMS MANAGEMENT ---

async function loadCMS() {
    const { data, error } = await window.supabaseClient.from('site_content').select('*');
    if (error) return;

    const container = document.getElementById('cms-list');
    container.innerHTML = '';

    data.forEach(item => {
        const div = document.createElement('div');
        div.style.marginBottom = '15px';
        div.style.padding = '15px';
        div.style.background = '#eee';
        div.innerHTML = `
            <label style="font-weight:bold; display:block;">${item.description || item.key}</label>
            <textarea style="width:100%; padding:8px; margin-top:5px;" id="cms-${item.id}">${item.value}</textarea>
            <button onclick="saveCMS('${item.id}')" class="btn" style="margin-top:5px;">Salvar</button>
        `;
        container.appendChild(div);
    });
}

async function saveCMS(id) {
    const val = document.getElementById(`cms-${id}`).value;
    const { error } = await window.supabaseClient.from('site_content').update({ value: val }).eq('id', id);
    if (error) alert(error.message);
    else alert('Conteúdo atualizado!');
}
