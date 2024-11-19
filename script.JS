let incomeData = JSON.parse(localStorage.getItem("incomeData")) || {};

function saveIncomeData() {
    localStorage.setItem("incomeData", JSON.stringify(incomeData));
}

function formatDateToLetterForm(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' }; 
    return date.toLocaleDateString('en-US', options);
}

function addIncome() {
    const date = document.getElementById("date").value;
    const formattedDate = formatDateToLetterForm(date); 
    const amount = parseFloat(document.getElementById("amount").value);
    
    if (!date || isNaN(amount) || amount <= 0) {
        alert("Please enter valid date and amount.");
        return;
    }

    if (incomeData[formattedDate]) {
        incomeData[formattedDate] += amount;
    } else {
        incomeData[formattedDate] = amount;
    }

    saveIncomeData();

    alert(`Added ₱${amount.toFixed(2)} income for ${formattedDate}`);
    document.getElementById("date").value = "";
    document.getElementById("amount").value = "";

    viewIncome();
}

function viewIncome() {
    const incomeList = document.getElementById("income-records");
    incomeList.innerHTML = "";

    if (Object.keys(incomeData).length === 0) {
        incomeList.innerHTML = "<li>No income data recorded yet.</li>";
        return;
    }

    for (const [date, amount] of Object.entries(incomeData)) {
        const li = document.createElement("li");
        li.textContent = `${date}: ₱${amount.toFixed(2)}`;
        incomeList.appendChild(li);
    }
}

function incomeSummary() {
    const totalIncome = Object.values(incomeData).reduce((sum, income) => sum + income, 0);
    const totalDays = Object.keys(incomeData).length;
    const averageIncome = totalDays > 0 ? totalIncome / totalDays : 0;

    const summarySection = document.getElementById("summary-section");
    summarySection.innerHTML = `
        Total Days Recorded: ${totalDays} <br>
        Total Income: ₱${totalIncome.toFixed(2)} <br>
        Average Daily Income: ₱${averageIncome.toFixed(2)}
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    viewIncome();
});
