// Variables
let timeSelected = 30;
let attempts = []

let currentlyPlaying = false;
let timer;
// Generated using ChatGPT
const typingTexts = [
    `It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness. It was the epoch of belief, it was the epoch of incredulity. We had everything before us, we had nothing before us.
  
  The time was so much like the present that some of its noisiest authorities insisted on it being received, for good or for evil, in the superlative degree of comparison only.`,
  
    `There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning, but since dinner the cold winter wind had brought with it clouds so somber and a rain so penetrating that further outdoor exercise was now out of the question.
  
  I was glad of it. I never liked long walks, especially on chilly afternoons. Dull and drizzling weather made my thoughts more vivid.`,
  
    `He was an old man who fished alone in a skiff in the Gulf Stream, and he had gone eighty-four days now without taking a fish. In the first forty days a boy had been with him. But after forty days without a fish, the boy's parents had told him the old man was definitely and finally unlucky.
  
  So the boy had gone at their orders in another boat which caught three good fish the first week. It made the boy sad to see the old man come in each day with his skiff empty.`,
  
    `There is no charm equal to tenderness of heart. Some people think it is weak to be kind, to show care or softness. But kindness is not weakness. It is strength wrapped in gentleness.
  
  When someone is gentle with another, especially when it is undeserved, it reveals character. In silence and restraint there is a kind of nobility.`,
  
    `I am no bird, and no net ensnares me. I am a free human being with an independent will. That will is as strong as yours, and it shall not be bent or broken by the expectations of others.
  
  You think I have no feelings because I am quiet. But I do feel, and deeply. I keep them beneath the surface, because I choose reason over chaos.`,
  
    `Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, I thought I would sail about a little and see the watery part of the world.
  
  Whenever I find myself growing grim about the mouth, whenever it is a damp, drizzly November in my soul, then I account it high time to get to sea as soon as I can.`  
  ];
  
// Document Elements
const timer_label = document.getElementById("timer-label");
const timer_bar = document.getElementById("timer-bar");
const typewriter = document.getElementById("typewriter");
// Event Listeners
document.getElementById("start").addEventListener("click", start);

// Functions
function start(){
    // Load
    
    currentlyPlaying = true;
    timer = timeSelected;
    typewriter.textContent = "";
    const {words, characterTree} = loadText();
    const wordAmount = words.length;
    for(let w = 0;w<words.length;w++){
        typewriter.innerHTML += "" + `<span id="typewriter-word-${w}">${words[w]}</span>`;
    }
    // Timer
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
    // Typewriter

}
function loadText(){
    // Pick text
    const pickedText = typingTexts[Math.floor(Math.random() * typingTexts.length)];
    // Extract words
    const words = pickedText.split(" ");
    let characterTree = []
    words.forEach(word => {
        characterTree.push(word.split(""));    
    });
    return {words, characterTree}

}