// Initialize income data
let incomeData = {};

// Load data from localStorage
function loadIncomeData() {
    const savedData = localStorage.getItem('incomeData');
    if (savedData) {
        incomeData = JSON.parse(savedData);
        viewIncome();
        if (document.getElementById("summary-section")) {
            incomeSummary();
        }
    }
}

// Save data to localStorage
function saveIncomeData() {
    try {
        localStorage.setItem('incomeData', JSON.stringify(incomeData));
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
    }
}

// Makes dates look nice and readable
function makeNiceDate(date) {
    // Ensure we have a valid Date object
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        // Return today's date if invalid date is provided
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Function to get product price
function getProductPrice(product) {
    const prices = {
        // Food Items
        'Longganisa': 75,
        'Siomai': 80,
        
        // Soft Drinks
        'Coke': 25,
        'MT': 25,
        'Royal': 25,
        'Sprite': 25,
        
        // Snacks
        'Chippy': 15,
        'Nova': 15,
        'Piattos': 15,
        'V-Cut': 15,
        'Clover': 15,
        
        // Instant Noodles
        'Lucky Me Pancit Canton': 20,
        'Lucky Me Beef': 18,
        'Lucky Me Chicken': 18,
        'Payless': 15,
        'Cup Noodles': 25
    };
    return prices[product] || 0;
}

function updateAmount() {
    const productSelect = document.getElementById("softdrinks");
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const product = productSelect.value;
    const price = getProductPrice(product);
    const total = price * quantity;
    document.getElementById("amount").value = total.toFixed(2);
}

function updateTodaysSummary() {
    const today = makeNiceDate(new Date().toISOString());
    const todayData = incomeData[today] || { entries: [] };
    
    // Update transaction count
    const transactionCount = todayData.entries.length;
    const todayTransactionsElement = document.getElementById("todayTransactions");
    if (todayTransactionsElement) {
        todayTransactionsElement.textContent = transactionCount;
    }

    // Update total sales
    const todayTotal = todayData.entries.reduce((sum, entry) => sum + entry.amount, 0);
    const todayTotalElement = document.getElementById("todayTotal");
    if (todayTotalElement) {
        todayTotalElement.textContent = `₱${todayTotal.toFixed(2)}`;
    }
}

function addIncome() {
    const productSelect = document.getElementById("softdrinks");
    const selectedIndex = productSelect.selectedIndex;

    if (selectedIndex < 0) {
        alert("Please select a product.");
        return;
    }

    const product = productSelect.value;
    const currentDate = new Date();
    const niceDate = makeNiceDate(currentDate);
    const currentTime = currentDate.toLocaleTimeString();
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const price = getProductPrice(product);
    const amount = price * quantity;
    
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter valid amount.");
        return;
    }

    if (!incomeData[niceDate]) {
        incomeData[niceDate] = {
            entries: [] // Store multiple entries for the same date
        };
    }
    
    // Add the new entry
    incomeData[niceDate].entries.push({
        product: product,
        amount: amount,  // This is already the total (price * quantity) 
        quantity: quantity,
        time: currentTime,
        time: currentTime,
        customerName: document.getElementById("customerName").value || 'Anonymous',
        paymentMethod: document.getElementById("paymentMethod").value,
        notes: document.getElementById("notes").value || ''
    });

    saveIncomeData();
    updateTodaysSummary();

    // Save and show success message
    alert(`Added ₱${amount.toFixed(2)} (${quantity} × ₱${price.toFixed(2)}) for ${product} on ${niceDate}`);
    
    // Clear form
    productSelect.selectedIndex = 0; // Reset the product selection
    
    document.getElementById("amount").value = "";
    document.getElementById("quantity").value = "1";

    viewIncome();
}

let recordsWindow = null;

function openRecordsWindow() {
    // Close existing window if open
    if (recordsWindow && !recordsWindow.closed) {
        recordsWindow.focus();
        return;
    }
    
    // Open new window
    recordsWindow = window.open('records.html', 'RecordsWindow', 
        'width=800,height=600,resizable=yes,scrollbars=yes');
}

function viewIncome() {
    const incomeList = document.getElementById("income-records");
    if (!incomeList) return; // Exit if element not found
    incomeList.innerHTML = "";

    if (Object.keys(incomeData).length === 0) {
        incomeList.innerHTML = "<li>No income data recorded yet.</li>";
        return;
    }

    for (const [date, data] of Object.entries(incomeData)) {
        data.entries.forEach((entry, index) => {
            const li = document.createElement("li");
            
            // Create the display content
            const contentSpan = document.createElement("span");
            contentSpan.innerHTML = `
                <strong>${date}</strong> ${entry.time || ''}: ${entry.product} - ₱${entry.amount.toFixed(2)} (Quantity: ${entry.quantity})<br>
                <span class="record-details">
                    <i class="fas fa-user"></i> ${entry.customerName || 'Anonymous'} | 
                    <i class="fas fa-credit-card"></i> ${entry.paymentMethod || 'Cash'} 
                    ${entry.notes ? `<br><i class="fas fa-sticky-note"></i> ${entry.notes}` : ''}
                </span>`;
            
            // Create edit button
            const editBtn = document.createElement("button");
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.className = "edit-btn";
            editBtn.onclick = () => editRecord(date, index);
            
            // Create delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.className = "delete-btn";
            deleteBtn.onclick = () => deleteRecord(date, index);
            
            // Add elements to li
            li.appendChild(contentSpan);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            
            incomeList.appendChild(li);
        });
    }
}

function editRecord(date, index) {
    const record = incomeData[date].entries[index];
    
    // Store the current record details for later reference
    sessionStorage.setItem('editingRecord', JSON.stringify({
        date: date,
        index: index
    }));
    
    // If we're on the records page, redirect to the main page for editing
    if (window.location.pathname.includes('records.html')) {
        window.location.href = 'index.html?edit=true';
        return;
    }
    
    // Populate form with existing data
    const softdrinksSelect = document.getElementById("softdrinks");
    const quantityInput = document.getElementById("quantity");
    const customerNameInput = document.getElementById("customerName");
    const paymentMethodSelect = document.getElementById("paymentMethod");
    const notesInput = document.getElementById("notes");
    
    if (softdrinksSelect) softdrinksSelect.value = record.product;
    if (quantityInput) quantityInput.value = record.quantity;
    if (customerNameInput) customerNameInput.value = record.customerName || '';
    if (paymentMethodSelect) paymentMethodSelect.value = record.paymentMethod || 'cash';
    if (notesInput) notesInput.value = record.notes || '';
    
    updateAmount(); // Update the amount based on product and quantity
    
    // Change the Add Transaction button to Update
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Transaction';
        submitBtn.onclick = () => updateRecord(date, index);
    }
}

function updateRecord(date, index) {
    const record = incomeData[date].entries[index];
    
    // Get updated values
    const product = document.getElementById("softdrinks").value;
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const amount = parseFloat(document.getElementById("amount").value);
    const customerName = document.getElementById("customerName").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const notes = document.getElementById("notes").value;
    
    // Update the record
    record.product = product;
    record.quantity = quantity;
    record.amount = amount;
    record.customerName = customerName || 'Anonymous';
    record.paymentMethod = paymentMethod;
    record.notes = notes;
    
    saveIncomeData();
    viewIncome();
    
    // Reset form and button
    const form = document.querySelector('.form-section');
    if (form) form.reset();
    
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Transaction';
        submitBtn.onclick = addIncome;
    }
    
    alert('Record updated successfully!');
}

// Add this to your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
    // ... existing code ...
    
    // Check if we're editing a record
    if (window.location.search.includes('edit=true')) {
        const editingRecord = JSON.parse(sessionStorage.getItem('editingRecord'));
        if (editingRecord) {
            editRecord(editingRecord.date, editingRecord.index);
            sessionStorage.removeItem('editingRecord');
        }
    }
});

function deleteRecord(date, index) {
    if (confirm("Are you sure you want to delete this record?")) {
        incomeData[date].entries.splice(index, 1);
        if (incomeData[date].entries.length === 0) {
            delete incomeData[date];
        }
        saveIncomeData();
        viewIncome();
        incomeSummary();
        updateTodaysSummary();
    }
}

// Sorting function
function handleSort(sortType) {
    const entries = [];
    // Flatten the data structure for easier sorting
    for (const [date, data] of Object.entries(incomeData)) {
        data.entries.forEach(entry => {
            entries.push({
                date: date,
                ...entry
            });
        });
    }

    // Sort based on selected criteria
    switch (sortType) {
        case 'date-desc':
            entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            entries.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            entries.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-asc':
            entries.sort((a, b) => a.amount - b.amount);
            break;
    }

    // Display sorted entries
    displaySortedEntries(entries);
}

// Filtering function
function handleFilter(product) {
    const incomeList = document.getElementById("income-records");
    incomeList.innerHTML = "";

    const entries = [];
    for (const [date, data] of Object.entries(incomeData)) {
        data.entries.forEach(entry => {
            if (!product || entry.product === product) {
                entries.push({
                    date: date,
                    ...entry
                });
            }
        });
    }

    if (entries.length === 0) {
        incomeList.innerHTML = "<li>No records found.</li>";
        return;
    }

    displaySortedEntries(entries);
}

// Helper function to display entries
function displaySortedEntries(entries) {
    const incomeList = document.getElementById("income-records");
    incomeList.innerHTML = "";

    entries.forEach((entry, index) => {
        const li = document.createElement("li");
        
        // Create the display content
        const contentSpan = document.createElement("span");
        contentSpan.textContent = `${entry.date}: ${entry.product} - ₱${entry.amount.toFixed(2)} (Quantity: ${entry.quantity})`;
        
        // Create edit button
        const editBtn = document.createElement("button");
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.className = "edit-btn";
        editBtn.onclick = () => editRecord(entry.date, index);
        
        // Create delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = () => deleteRecord(entry.date, index);
        
        // Add elements to li
        li.appendChild(contentSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        
        incomeList.appendChild(li);
    });
}

function incomeSummary() {
    const summarySection = document.getElementById("summary-section");
    if (!summarySection) return;
    
    const today = makeNiceDate(new Date());
    
    // Calculate total summary
    const totalIncome = Object.values(incomeData).reduce((sum, data) => {
        return sum + data.entries.reduce((daySum, entry) => daySum + entry.amount, 0);
    }, 0);
    
    const totalQuantity = Object.values(incomeData).reduce((sum, data) => {
        return sum + data.entries.reduce((daySum, entry) => daySum + entry.quantity, 0);
    }, 0);
    
    // Calculate product-wise stats
    const productStats = {};
    Object.values(incomeData).forEach(data => {
        data.entries.forEach(entry => {
            if (!productStats[entry.product]) {
                productStats[entry.product] = {
                    quantity: 0,
                    amount: 0
                };
            }
            productStats[entry.product].quantity += entry.quantity;
            productStats[entry.product].amount += entry.amount;
        });
    });

    // Find best selling product
    let bestSeller = {product: '', quantity: 0};
    let topRevenue = {product: '', amount: 0};
    
    Object.entries(productStats).forEach(([product, stats]) => {
        if (stats.quantity > bestSeller.quantity) {
            bestSeller = {product, quantity: stats.quantity};
        }
        if (stats.amount > topRevenue.amount) {
            topRevenue = {product, amount: stats.amount};
        }
    });
    
    const totalDays = Object.keys(incomeData).length;
    const averageIncome = totalDays > 0 ? totalIncome / totalDays : 0;
    
    // Calculate today's summary
    const todayData = incomeData[today] || { entries: [] };
    const todayIncome = todayData.entries.reduce((sum, entry) => sum + entry.amount, 0);
    const todayQuantity = todayData.entries.reduce((sum, entry) => sum + entry.quantity, 0);
    
    // Show enhanced summary with quick stats
    summarySection.innerHTML = `
        <div class="summary-total">
            <h3>Quick Stats</h3>
            <div class="stats-grid">
                <div class="stat-box">
                    <h4>Overall Performance</h4>
                    <p>Total Revenue: ₱${totalIncome.toFixed(2)}</p>
                    <p>Total Items Sold: ${totalQuantity}</p>
                    <p>Average Daily Income: ₱${averageIncome.toFixed(2)}</p>
                    <p>Total Days: ${totalDays}</p>
                </div>
                <div class="stat-box">
                    <h4>Today's Performance</h4>
                    <p>Today's Revenue: ₱${todayIncome.toFixed(2)}</p>
                    <p>Items Sold Today: ${todayQuantity}</p>
                </div>
                <div class="stat-box">
                    <h4>Top Performers</h4>
                    <p>Best Seller: ${bestSeller.product} (${bestSeller.quantity} units)</p>
                    <p>Highest Revenue: ${topRevenue.product} (₱${topRevenue.amount.toFixed(2)})</p>
                </div>
            </div>
        </div>
    `;
}



// Export to CSV function
function exportToCSV() {
    const entries = [];
    for (const [date, data] of Object.entries(incomeData)) {
        data.entries.forEach(entry => {
            entries.push({
                date: date,
                product: entry.product,
                quantity: entry.quantity,
                amount: entry.amount
            });
        });
    }

    if (entries.length === 0) {
        alert("No data to export!");
        return;
    }

    const csvContent = "Date,Time,Product,Quantity,Amount,Customer,Payment Method,Notes\n" + 
        entries.map(entry => 
            `${entry.date},${entry.time || ''},${entry.product},${entry.quantity},${entry.amount},${entry.customerName || 'Anonymous'},${entry.paymentMethod || 'Cash'},${entry.notes || ''}`
        ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "income_records.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Update time display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    const timeDisplays = document.querySelectorAll('#current-time');
    timeDisplays.forEach(display => {
        display.textContent = `${dateString} ${timeString}`;
    });
}

// Update time every second
setInterval(updateTime, 1000);
updateTime(); // Initial call


function resetAll() {
    if (confirm("Are you sure you want to reset all data? This cannot be undone!")) {
        try {
            // Clear all data
            incomeData = {};
            localStorage.removeItem("incomeData");
            
            // Reset form fields if they exist
            const form = document.querySelector('.form-section');
            if (form) {
                const softdrinksSelect = document.getElementById("softdrinks");
                const quantityInput = document.getElementById("quantity");
                const amountInput = document.getElementById("amount");
                
                if (softdrinksSelect) softdrinksSelect.selectedIndex = 0;
                if (quantityInput) quantityInput.value = "1";
                if (amountInput) amountInput.value = "";
            }
            
            // Clear income records if they exist
            const incomeRecords = document.getElementById("income-records");
            if (incomeRecords) {
                incomeRecords.innerHTML = "<li>No income data recorded yet.</li>";
            }
            
            // Update summary if it exists
            if (document.getElementById("summary-section")) {
                incomeSummary();
            }
            
            // Update today's summary if elements exist
            updateTodaysSummary();
            
            // Show success message
            alert('All data has been reset successfully!');
            
            // Refresh the view
            viewIncome();
            
        } catch (error) {
            console.error('Error during reset:', error);
            alert('There was an error resetting the data. Please try again.');
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadIncomeData(); // Load saved data when page loads
    updateTodaysSummary(); // Initialize today's summary
    
    // Add event listeners for automatic price updates only if elements exist
    const softdrinksSelect = document.getElementById("softdrinks");
    const quantityInput = document.getElementById("quantity");
    
    if (softdrinksSelect) {
        softdrinksSelect.addEventListener("change", updateAmount);
    }
    if (quantityInput) {
        quantityInput.addEventListener("change", updateAmount);
    }
});