// Gerenciamento do Carrinho - Os Centenarios
let cart = JSON.parse(localStorage.getItem('centenarios_cart')) || [];

const cartHook = {
    updateStorage() {
        localStorage.setItem('centenarios_cart', JSON.stringify(cart));
        this.renderCart();
    },

    addItem(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        this.updateStorage();
    },

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.updateStorage();
    },

    changeQty(id, delta) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) return this.removeItem(id);
            this.updateStorage();
        }
    },

    getTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    generateWhatsAppLink() {
        const PHONE = "5581999999999"; // SUBSTITUA PELO SEU NUMERO
        let message = "OLA! GOSTARIA DE FAZER O SEGUINTE PEDIDO:\n\n";
        
        cart.forEach(item => {
            message += `*${item.name.toUpperCase()}*\n`;
            message += `QTD: ${item.quantity} X R$ ${item.price.toFixed(2)}\n\n`;
        });

        message += `*TOTAL: R$ ${this.getTotal().toFixed(2)}*\n\n`;
        message += "COMO POSSO FINALIZAR O PAGAMENTO?";

        return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    },

    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');
        if (cartCount) cartCount.innerText = cart.reduce((a, b) => a + b.quantity, 0);
        
        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align:center; padding:20px;">SEU CARRINHO ESTA VAZIO</p>';
            return;
        }

        let html = '';
        cart.forEach(item => {
            html += `
                <div class="cart-item" style="display:flex; align-items:center; gap:10px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                    <div style="flex:1">
                        <h4 style="font-family:'Ultras Liberi'; font-size:0.8rem;">${item.name.toUpperCase()}</h4>
                        <p>R$ ${item.price.toFixed(2)}</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button onclick="cartHook.changeQty('${item.id}', -1)" style="padding:2px 8px;">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cartHook.changeQty('${item.id}', 1)" style="padding:2px 8px;">+</button>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div style="margin-top:20px; border-top:2px solid var(--vermelho); pt:10px;">
                <h3 style="font-family:'Ultras Liberi';">TOTAL: R$ ${this.getTotal().toFixed(2)}</h3>
                <button onclick="window.open(cartHook.generateWhatsAppLink(), '_blank')" class="btn" style="width:100%; margin-top:10px; background:var(--vermelho); color:white;">FINALIZAR NO WHATSAPP</button>
            </div>
        `;
        cartContainer.innerHTML = html;
    }
};

window.cartHook = cartHook;
document.addEventListener('DOMContentLoaded', () => cartHook.renderCart());
