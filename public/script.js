let startTime;
let lastResetTime = 0;
let timerInterval;

function updateTimer() {
    const now = Date.now();
    const diff = now - (startTime || now);
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('timer').textContent = 
        `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

async function resetTimer() {
    const now = Date.now();
    const button = document.getElementById('resetButton');
    const message = document.getElementById('message');
    
    if (now - lastResetTime < 10000) {
        message.textContent = 'Please wait 10 seconds between resets';
        return;
    }
    
    button.disabled = true;
    
    try {
        const response = await fetch('/api/timer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to reset timer');
        }
        
        const data = await response.json();
        startTime = data.timestamp;
        lastResetTime = now;
        message.textContent = '';
        updateTimer();
    } catch (error) {
        console.error('Error resetting timer:', error);
        message.textContent = 'Error resetting timer. Please try again.';
    }
    
    setTimeout(() => {
        button.disabled = false;
    }, 10000);
}

async function fetchTimer() {
    try {
        const response = await fetch('/api/timer');
        
        if (!response.ok) {
            throw new Error('Failed to fetch timer');
        }
        
        const data = await response.json();
        startTime = data.timestamp;
        updateTimer();
        document.getElementById('message').textContent = '';
    } catch (error) {
        console.error('Error fetching timer:', error);
        document.getElementById('message').textContent = 
            'Error updating timer. Will retry...';
    }
}

// Initialize timer
function initTimer() {
    fetchTimer(); // Get initial time
    timerInterval = setInterval(updateTimer, 1000); // Update display every second
    setInterval(fetchTimer, 60000); // Poll for updates every minute
}

// Start the application when page loads
window.addEventListener('DOMContentLoaded', initTimer);
