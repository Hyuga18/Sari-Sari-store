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
function makeNiceDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

// Function to get product price
function getProductPrice(product) {
    const prices = {
        'Longganisa': 75,
        'Siomai': 80,
        'Coke': 25,
        'MT': 25,
        'Royal': 25,
        'Sprite': 25
    };
    return prices[product] || 0;
}

// Function to update amount based on product and quantity
function updateAmount() {
    const productSelect = document.getElementById("softdrinks");
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const product = productSelect.value;
    const price = getProductPrice(product);
    const total = price * quantity;
    document.getElementById("amount").value = total.toFixed(2);
}

function addIncome() {
    const productSelect = document.getElementById("softdrinks");
    const selectedIndex = productSelect.selectedIndex;

    if (selectedIndex < 0) {
        alert("Please select a product.");
        return;
    }

    const product = productSelect.value;
    const date = document.getElementById("date").value;
    const niceDate = makeNiceDate(date);
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const price = getProductPrice(product);
    const amount = price * quantity;
    
    if (!date || isNaN(amount) || amount <= 0) {
        alert("Please enter valid date and amount.");
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
        quantity: quantity
    });

    saveIncomeData();

    // Save and show success message
    alert(`Added ₱${amount.toFixed(2)} (${quantity} × ₱${price.toFixed(2)}) for ${product} on ${niceDate}`);
    
    // Clear form
    productSelect.selectedIndex = 0; // Reset the product selection
    document.getElementById("date").value = "";
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
            contentSpan.textContent = `${date}: ${entry.product} - ₱${entry.amount.toFixed(2)} (Quantity: ${entry.quantity})`;
            
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
    
    // Populate form with existing data
    document.getElementById("softdrinks").value = record.product;
    document.getElementById("date").value = new Date(date).toISOString().split('T')[0];
    document.getElementById("quantity").value = record.quantity;
    updateAmount(); // Update the amount based on product and quantity
    
    // Remove the old record
    incomeData[date].entries.splice(index, 1);
    if (incomeData[date].entries.length === 0) {
        delete incomeData[date];
    }
    
    saveIncomeData();
    viewIncome();
}

function deleteRecord(date, index) {
    if (confirm("Are you sure you want to delete this record?")) {
        incomeData[date].entries.splice(index, 1);
        if (incomeData[date].entries.length === 0) {
            delete incomeData[date];
        }
        saveIncomeData();
        viewIncome();
        incomeSummary();
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
    if (!summarySection) return; // Exit if summary section doesn't exist on this page
    
    const totalIncome = Object.values(incomeData).reduce((sum, data) => {
        return sum + data.entries.reduce((daySum, entry) => daySum + entry.amount, 0);
    }, 0);
    
    const totalQuantity = Object.values(incomeData).reduce((sum, data) => {
        return sum + data.entries.reduce((daySum, entry) => daySum + entry.quantity, 0);
    }, 0);
    
    const totalDays = Object.keys(incomeData).length;
    const averageIncome = totalDays > 0 ? totalIncome / totalDays : 0;
    
    // Show summary
    summarySection.innerHTML = `
        Total Days Recorded: ${totalDays} <br>
        Total Income: ₱${totalIncome.toFixed(2)} <br>
        Total Quantity Sold: ${totalQuantity} <br>
        Average Daily Income: ₱${averageIncome.toFixed(2)}
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

    const csvContent = "Date,Product,Quantity,Amount\n" + 
        entries.map(entry => 
            `${entry.date},${entry.product},${entry.quantity},${entry.amount}`
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

function resetAll() {
    if (confirm("Are you sure you want to reset all data? This cannot be undone!")) {
        try {
            // Clear all data
            incomeData = {};
            localStorage.removeItem("incomeData");
            
            // Reset form fields
            const form = document.querySelector('.form-section');
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.type === 'number') {
                    input.value = input.id === 'quantity' ? '1' : '';
                } else if (input.type === 'date') {
                    input.value = '';
                } else if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                }
            });
            
            // Clear displays with animation
            const incomeRecords = document.getElementById("income-records");
            incomeRecords.style.opacity = '0';
            setTimeout(() => {
                incomeRecords.innerHTML = "<li>No income data recorded yet.</li>";
                incomeRecords.style.opacity = '1';
            }, 300);
            
            // Reset summary with animation
            const summarySection = document.getElementById("summary-section");
            summarySection.style.opacity = '0';
            setTimeout(() => {
                summarySection.innerHTML = `
                    Total Days Recorded: 0 <br>
                    Total Income: ₱0.00 <br>
                    Total Quantity Sold: 0 <br>
                    Average Daily Income: ₱0.00
                `;
                summarySection.style.opacity = '1';
            }, 300);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'All data has been reset successfully!';
            document.querySelector('.container').appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
            
        } catch (error) {
            console.error('Error during reset:', error);
            alert('There was an error resetting the data. Please try again.');
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadIncomeData(); // Load saved data when page loads
    
    // Add event listeners for automatic price updates
    document.getElementById("softdrinks").addEventListener("change", updateAmount);
    document.getElementById("quantity").addEventListener("change", updateAmount);
});