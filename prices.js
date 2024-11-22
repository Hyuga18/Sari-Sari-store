const PRODUCT_PRICES = {
    'Longganisa': 15.00,
    'Siomai': 20.00,
    'Coke': 15.00,
    'MT': 15.00,
    'Royal': 15.00,
    'Sprite': 15.00
};

function calculateTotal() {
    const product = document.getElementById('softdrinks').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    
    if (product && PRODUCT_PRICES[product]) {
        const total = PRODUCT_PRICES[product] * quantity;
        document.getElementById('amount').value = total.toFixed(2);
    } else {
        document.getElementById('amount').value = '';
    }
}