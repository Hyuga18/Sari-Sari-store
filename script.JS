// Store all our income records
let incomeData = JSON.parse(localStorage.getItem("incomeData")) || {};

// Save data to browser storage
function saveIncomeData() {
    localStorage.setItem("incomeData", JSON.stringify(incomeData));
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

function addIncome() {
    const date = document.getElementById("date").value;
    const niceDate = makeNiceDate(date); 
    const amount = parseFloat(document.getElementById("amount").value);
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    
    if (!date || isNaN(amount) || amount <= 0) {
        alert("Please enter valid date and amount.");
        return;
    }

    // Calculate total
    const total = amount * quantity;

    if (!incomeData[niceDate]) {
        incomeData[niceDate] = {
            amount: 0,
            quantity: 0
        };
    }
    incomeData[niceDate].amount += total;
    incomeData[niceDate].quantity += quantity;

    saveIncomeData();

    // Save and show success message
    alert(`Added ₱${total.toFixed(2)} (${quantity} × ₱${amount.toFixed(2)}) for ${niceDate}`);
    
    // Clear form
    document.getElementById("date").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("quantity").value = "1";

    viewIncome();
}

function viewIncome() {
    const incomeList = document.getElementById("income-records");
    incomeList.innerHTML = "";

    if (Object.keys(incomeData).length === 0) {
        incomeList.innerHTML = "<li>No income data recorded yet.</li>";
        return;
    }

    for (const [date, data] of Object.entries(incomeData)) {
        const li = document.createElement("li");
        const amount = typeof data === 'number' ? data : data.amount;
        const quantity = typeof data === 'number' ? '?' : data.quantity;
        li.textContent = `${date}: ₱${amount.toFixed(2)} (Quantity: ${quantity})`;
        incomeList.appendChild(li);
    }
}

function incomeSummary() {
    const totalIncome = Object.values(incomeData).reduce((sum, data) => {
        return sum + (typeof data === 'number' ? data : data.amount);
    }, 0);
    const totalQuantity = Object.values(incomeData).reduce((sum, data) => {
        return sum + (typeof data === 'number' ? 1 : data.quantity);
    }, 0);
    const totalDays = Object.keys(incomeData).length;
    const averageIncome = totalDays > 0 ? totalIncome / totalDays : 0;
    // Show summary
    const summarySection = document.getElementById("summary-section");
    summarySection.innerHTML = `
        Total Days Recorded: ${totalDays} <br>
        Total Income: ₱${totalIncome.toFixed(2)} <br>
        Total Quantity Sold: ${totalQuantity} <br>
        Average Daily Income: ₱${averageIncome.toFixed(2)} <br>
        Total Quantity Sold: ${totalQuantity}
    `;
}



document.addEventListener("DOMContentLoaded", () => {
    viewIncome();
});