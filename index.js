// Variables
let timeSelected = 30;
let attempts = []

let currentlyPlaying = false;
let timer;

// Document Elements
const timer_label = document.getElementById("timer-label");
const timer_bar = document.getElementById("timer-bar");
// Event Listeners
document.getElementById("start").addEventListener("click", () => {
    currentlyPlaying = true;
    timer = timeSelected;
    const interval = setInterval(() => {
        timer--;
  
        if (timer <= 0) {
          clearInterval(interval);
          timer_label.textContent = "0s left";
          timer_bar.style.width = "0%";
          return;
        }
  
        // Update label and fill width
        timer_label.textContent = `${timer}s left`;
        const progress = (timer / timeSelected) * 100;
        timer_bar.style.width = `${progress}%`;
    }, 1000);

})