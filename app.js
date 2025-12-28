const API_URL = 'https://script.google.com/macros/s/AKfycbypvM0KpK_xG2obNRN1VbBOqTC4sZpuvziHb9DeHM11Kp6Ryo9QsEh5fC04Ur-szFn7CA/exec';


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

// 3. FETCH REPORT BY DATE
async function fetchReport() {
    const selectedDate = new Date(document.getElementById('reportDate').value).toLocaleDateString();
    summary.innerHTML = "⏳ Loading report...";
    
    try {
        const response = await fetch(API_URL);
        const allSales = await response.json();

        let dailyTotal = 0;
        let itemCounts = {};

        allSales.forEach(row => {
            const saleDate = new Date(row[0]).toLocaleDateString();
            if (saleDate === selectedDate) {
                dailyTotal += row[4];
                itemCounts[row[1]] = (itemCounts[row[1]] || 0) + row[3];
            }
        });

        const topProduct = Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b, "None");

        document.getElementById('dayTotal').innerText = `$${dailyTotal.toFixed(2)}`;
        document.getElementById('bestSeller').innerText = topProduct;
        summary.innerHTML = "Report Updated.";
    } catch (e) {
        summary.innerHTML = "Failed to load data.";
    }
}