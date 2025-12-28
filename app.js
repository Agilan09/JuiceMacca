const API_URL = 'https://script.google.com/macros/s/AKfycbwFtl7SeEic924SWdUKhhS-cLS4bt4A-CZ9yneWqZxQsWTCDJ2YztUEw6zew7GJ24cW4A/exec';


const drinks = [
{ id: 1, name: 'Original Coco', price: 5.00 },
{ id: 2, name: 'Coco Passion', price: 6.00 },
{ id: 3, name: 'Coco Melon', price: 6.00 },
{ id: 4, name: 'Coco Kiwi', price: 6.00 },
{ id: 5, name: 'Coco Berry', price: 6.00 },
{ id: 6, name: 'Coco Mango', price: 6.00 }

];

let basket = []; // This holds the items for the current customer

const drinksDiv = document.getElementById('drinks');
//const summary = document.getElementById('summary');




// 1. GENERATE MENU BUTTONS
/*drinks.forEach(d => {
    const btn = document.createElement('button');
    btn.className = "drink-btn";
    btn.innerHTML = `${d.name}<br><strong>$${d.price.toFixed(2)}</strong>`;
    btn.onclick = () => addSale(d);
    drinksDiv.appendChild(btn);
});
*/

drinks.forEach(d => {
    const btn = document.createElement('button');
    btn.className = "drink-btn";
    btn.innerHTML = `${d.name}<br><strong>$${d.price.toFixed(2)}</strong>`;
    btn.onclick = () => addToBasket(d); // Changed from addSale to addToBasket
    drinksDiv.appendChild(btn);
});


// 2. ADD TO BASKET (Local only, doesn't send to Google yet)
function addToBasket(drink) {
    const qtyInput = document.getElementById('qty').value;
    const qty = parseInt(qtyInput) || 1;
    
    // Add the item to our list
    basket.push({
        id: drink.id,
        name: drink.name,
        price: drink.price,
        quantity: qty,
        total: drink.price * qty
    });

    renderBasket();
    //document.getElementById('qty').value = 1; // Reset quantity box to 1
    qtyInput.value = 1; // Reset to 1
}

// 3. SHOW BASKET ON SCREEN
function renderBasket() {
    const list = document.getElementById('basketList');
    const totalDisplay = document.getElementById('basketTotal');
    list.innerHTML = ""; // Clear current display
    
    let grandTotal = 0;

    if (basket.length === 0) {
        list.innerHTML = '<li style="color: gray;">Basket is empty</li>';
    } else {
        basket.forEach((item, index) => {
            grandTotal += item.total;
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.quantity}x ${item.name} - RM${item.total.toFixed(2)}
                <button onclick="removeFromBasket(${index})">❌</button>`;
            list.appendChild(li);
        });
    }
    
    totalDisplay.innerText = `RM${grandTotal.toFixed(2)}`;
}

// 4. REMOVE ITEM (If you make a mistake)
function removeFromBasket(index) {
    basket.splice(index, 1);
    renderBasket();
}


// 2. SAVE SALE (ASYNC/AWAIT)
/*async function addSale(drink) {
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
}*/

// 5. SUBMIT ORDER TO GOOGLE SHEETS
/*async function submitOrder() {
    if (basket.length === 0) {
        alert("Please add drinks to the basket first!");
        return;
    }

    const payment = document.getElementById('paymentMethod').value;
    const summary = document.getElementById('summary');
    const submitBtn = document.getElementById('submitBtn');

    summary.innerHTML = "⏳ Sending Order...";
    submitBtn.disabled = true; // Prevent double clicking

    try {
        // We send each item in the basket to your Google Sheet
        for (const item of basket) {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    drink_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.total,
                    payment: payment
                })
            });
        }

        summary.innerHTML = `✅ Order Confirmed! Total: $${document.getElementById('basketTotal').innerText}`;
        summary.style.color = "green";
        
        // Clear basket for next customer
        basket = [];
        renderBasket();
    } catch (error) {
        summary.innerHTML = "❌ Error! Check connection.";
        summary.style.color = "red";
    } finally {
        submitBtn.disabled = false;
    }
}
    */

async function submitOrder() {
    if (basket.length === 0) return;
    
    const summary = document.getElementById('summary');
    summary.innerText = "⏳ Sending Order...";

    try {
        // ONE fetch for the WHOLE basket
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                items: basket, // Send the full list
                payment: document.getElementById('paymentMethod').value
            })
        });

        basket = [];
        renderBasket();
        summary.innerText = "✅ Order Saved !";
    } catch (e) {
        summary.innerText = "❌ Error! Try again.";
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
                dailyTotal += row[5];
                itemCounts[row[2]] = (itemCounts[row[2]] || 0) + row[4];
            }
        });

        const topProduct = Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b, "None");

        document.getElementById('dayTotal').innerText = `RM${dailyTotal.toFixed(2)}`;
        document.getElementById('bestSeller').innerText = topProduct;
        summary.innerHTML = "Report Updated.";
    } catch (e) {
        summary.innerHTML = "Failed to load data.";
    }
}