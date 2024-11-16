const GROQ_API_KEY = "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"; 
const MODEL_MAP = {
    grammar: "Gemma2-9b-It",
    dictionary: "Gemma2-9b-It",
    learning: "Gemma2-9b-It",
    "js-assistant": "Mixtral-8x7b-32768",
    "recipe-planner": "Gemma2-9b-It"
};

const botSelectionButtons = document.querySelectorAll('.bot-options button');
const chatInterface = document.getElementById('chat-interface');
const botName = document.getElementById('bot-name');
const responseContainer = document.getElementById('response-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let selectedBot = null;

botSelectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedBot = button.getAttribute('data-bot');
        console.log("Selected bot:", selectedBot); // Debugging
        botName.textContent = button.textContent;
        chatInterface.style.display = 'block';
    });
});


async function getResponse(query) {
    if (!selectedBot) {
        console.error("No bot selected.");
        return "Please select a chatbot.";
    }
    
    const model = MODEL_MAP[selectedBot];
    if (!model) {
        console.error("Model not found for selected bot:", selectedBot);
        return "The selected bot is not available at the moment.";
    }
    
    const payload = {
        model,
        messages: [{ role: "user", content: query }]
    };

    try {
        console.log("Payload sent to API:", JSON.stringify(payload, null, 2));
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}): ${errorText}`);
            throw new Error(errorText);
        }

        const data = await response.json();
        console.log("API Response:", data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error in getResponse:", error);
        return "Failed to fetch a response.";
    }
}


sendBtn.addEventListener('click', async () => {
    const query = userInput.value.trim();
    if (!query || !selectedBot) return;

    responseContainer.innerHTML += `<div class="user-msg">${query}</div>`;
    responseContainer.innerHTML += `<div class="bot-msg loading">Typing...</div>`;
    userInput.value = '';

    const botMsgs = responseContainer.querySelectorAll(".bot-msg");
    const lastBotMsg = botMsgs[botMsgs.length - 1];

    const response = await getResponse(query);
    lastBotMsg.classList.remove("loading");
    lastBotMsg.textContent = response || "Sorry, I couldn't fetch a response.";

    responseContainer.scrollTop = responseContainer.scrollHeight;
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        sendBtn.click(); 
    }
});


