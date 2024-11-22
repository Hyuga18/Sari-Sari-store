function updateCurrentTime() {
    const timeDisplay = document.getElementById('current-time');
    if (timeDisplay) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        timeDisplay.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Update time every second
setInterval(updateCurrentTime, 1000);

// Initial update
document.addEventListener('DOMContentLoaded', updateCurrentTime);
