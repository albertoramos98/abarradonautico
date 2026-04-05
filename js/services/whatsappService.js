const PHONE_NUMBER = "5581999999999"; 

export const whatsappService = {
    generateMessage(cartItems, total) {
        let message = "⚪🔴 *NOVO PEDIDO - OS CENTENÁRIOS* 🔴⚪\n\n";
        message += "Olá, gostaria de comprar os seguintes itens:\n\n";
        
        cartItems.forEach(item => {
            message += `🔹 *${item.name}*\n`;
            message += `   Qtd: ${item.quantity}x | Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
        });

        message += `--------------------------\n`;
        message += `💰 *TOTAL: R$ ${total.toFixed(2)}*\n`;
        message += `--------------------------\n\n`;
        message += "📍 *Me informe como posso finalizar a compra.*";

        return encodeURIComponent(message);
    },

    getLink(cartItems, total) {
        const message = this.generateMessage(cartItems, total);
        return `https://wa.me/${PHONE_NUMBER}?text=${message}`;
    }
};
