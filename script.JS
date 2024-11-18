let incomeData = {};

function addIncome() {
    const date = document.getElementById("date").value;
    const amount = parseFloat(document.getElementById("amount").value);
    
    if (!date || isNaN(amount) || amount <= 0) {
        alert("Please enter valid date and amount.");
        return;
    }

    if (incomeData[date]) {
        incomeData[date] += amount;
    } else {
        incomeData[date] = amount;
    }

    alert(`Added ₱${amount.toFixed(2)} income for ${date}`);
    document.getElementById("date").value = "";
    document.getElementById("amount").value = "";
}

function viewIncome() {
    const incomeList = document.getElementById("income-records");
    incomeList.innerHTML = ""; // Clear previous records

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
    const averageIncome = totalIncome / totalDays;

    const summarySection = document.getElementById("summary-section");
    summarySection.innerHTML = `
        Total Days Recorded: ${totalDays} <br>
        Total Income: ₱${totalIncome.toFixed(2)} <br>
        Average Daily Income: ₱${averageIncome.toFixed(2)}
    `;
}
