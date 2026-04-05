export const useCart = () => {
    let cart = JSON.parse(localStorage.getItem('os_centenarios_cart')) || [];

    const save = () => {
        localStorage.setItem('os_centenarios_cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
    };

    return {
        getItems: () => cart,
        addItem: (product) => {
            const index = cart.findIndex(item => item.id === product.id);
            if (index >= 0) {
                cart[index].quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            save();
        },
        removeItem: (productId) => {
            cart = cart.filter(item => item.id !== productId);
            save();
        },
        getTotal: () => cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        clearCart: () => { cart = []; save(); }
    };
};
