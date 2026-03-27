const LOADING_TIME = 5 *1000;
const preloader = 
document.getElementById("preloader");

setTimeout(()=>{
    preloader.style.display= "none";
}, LOADING_TIME)

// 1. CONFIGURATION - Put your key between the quotes
const API_KEY = "AIzaSyChhKZFpZv8ZPZAgB4ync3QTdm43Prmw-o"; 

// 2. ELEMENT SELECTORS
const mascotImg = document.getElementById('mascot-img');
const speechBubble = document.getElementById('speech-bubble');
const chatWindow = document.getElementById('chat-window');
const chatLogs = document.getElementById('chat-logs');
const userInput = document.getElementById('user-input');

// 3. ANIMATION LOGIC
function triggerWave() {
    // Remove classes to reset animation
    mascotImg.classList.remove('mascot-idle', 'mascot-wave');
    
    // Force a reflow (this makes the animation restart)
    void mascotImg.offsetWidth; 
    
    mascotImg.classList.add('mascot-wave');
    
    // After 1.5 seconds, go back to floating (idle)
    setTimeout(() => {
        mascotImg.classList.remove('mascot-wave');
        mascotImg.classList.add('mascot-idle');
    }, 1500);
}

function updateSpeech(text) {
    speechBubble.innerText = text;
}

// 4. OPEN/CLOSE CHAT
function toggleChat() {
    const isVisible = (chatWindow.style.display === 'flex');
    
    if (isVisible) {
        chatWindow.style.display = 'none';
    } else {
        chatWindow.style.display = 'flex';
        updateSpeech("Yay! You clicked me! 🍰");
        triggerWave();
    }
}

// 5. THE AI BRAIN (The "Fetch" Request)
async function sendMessage() {
    const message = userInput.value.trim();
    
    // Don't send empty messages
    if (!message) return;

    // Display user message in chat
    appendMessage('user', message);
    userInput.value = '';
    updateSpeech("Let me think... 🤔");

    try {
        // We use the 'v1beta' endpoint which is most reliable for Gemini Flash
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "You are a cute, helpful pink cake mascot. Keep your answer under 20 words. Answer this: " + message
                    }]
                }]
            })
        });

        const data = await response.json();

        // CHECK FOR ERRORS IN THE RESPONSE
        if (data.error) {
            console.error("API Error:", data.error.message);
            appendMessage('bot', "Error: " + data.error.message);
            updateSpeech("Oh no! Check console.");
            return;
        }

        // EXTRACT THE TEXT SAFELY
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const aiText = data.candidates[0].content.parts[0].text;
            appendMessage('bot', aiText);
            updateSpeech("Sweet! ✨");
            triggerWave();
        } else {
            throw new Error("Invalid response format");
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        appendMessage('bot', "I can't reach my brain! Check your API key or internet.");
        updateSpeech("Oops! 😵‍💫");
    }
}

// 6. UI HELPERS
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-msg' : 'bot-msg';
    msgDiv.innerText = text;
    chatLogs.appendChild(msgDiv);
    
    // Scroll to the bottom so you see the newest message
    chatLogs.scrollTop = chatLogs.scrollHeight;
}

// Allow "Enter" key to send messages
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});



