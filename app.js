const API_URL = 'https://script.google.com/macros/s/AKfycbwJ9BZc2oHQi62ZkI752h9mL5K6eorE52tsLmFqySj5J0KGcoetePbVeLWPWWNBlyag/exec';


const drinks = [
{ id: 1, name: 'Original Coco', price: 5.00 },
{ id: 2, name: 'Coco Passion', price: 6.00 },
{ id: 3, name: 'Coco Melon', price: 6.00 },
{ id: 4, name: 'Coco Kiwi', price: 6.00 },
{ id: 5, name: 'Coco Berry', price: 6.00 },
{ id: 6, name: 'Coco Mango', price: 6.00 }

];


const drinksDiv = document.getElementById('drinks');
const summary = document.getElementById('summary');


// 1. GENERATE MENU BUTTONS
drinks.forEach(d => {
    const btn = document.createElement('button');
    btn.className = "drink-btn";
    btn.innerHTML = `${d.name}<br><strong>$${d.price.toFixed(2)}</strong>`;
    btn.onclick = () => addSale(d);
    drinksDiv.appendChild(btn);
});


// 2. SAVE SALE (ASYNC/AWAIT)
async function addSale(drink) {
    const qty = parseInt(document.getElementById('qty').value);
    const payment = document.getElementById('paymentMethod').value;
    const total = drink.price * qty;

    summary.innerHTML = `⏳ Saving ${drink.name}...`;
    summary.style.color = "orange";

    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                drink_name: drink.name,
                price: drink.price,
                quantity: qty,
                total: total,
                payment_method: payment
            })
        });

        summary.innerHTML = `✅ ${qty}x ${drink.name} Saved!`;
        summary.style.color = "green";
        document.getElementById('qty').value = 1;
    } catch (error) {
        summary.innerHTML = "❌ Error! Check Connection.";
        summary.style.color = "red";
    }
}