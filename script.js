const messageQueue = []; // Queue holds the user messages
let isProcessing = false; // Flag to indicate if a message is being processed

function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim() === '') return;

    // Add the message to the queue
    messageQueue.push(userInput);
    processQueue();
}

function processQueue() {
    if (isProcessing || messageQueue.length === 0) return;

    isProcessing = true; // it means processing is in progress
    const currentMessage = messageQueue.shift(); // Get the next message in the queue

    
    const messagesDiv = document.querySelector('.messages');
    const userMessage = document.createElement('div');
    userMessage.textContent = `User: ${currentMessage}`;
    messagesDiv.appendChild(userMessage);

    const botMessage = document.createElement('div');
    botMessage.textContent = `Bot:  ${currentMessage}`;
    setTimeout(() => {
        messagesDiv.appendChild(botMessage);
        isProcessing = false; 
        processQueue(); 
    }, 500);// response recieve in 5seconds

    document.getElementById('userInput').value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

const form = document.getElementById('userForm');
const output = document.getElementById('output');

// Retrieve conversation history from localStorage if it exists
let conversationHistory = JSON.parse(localStorage.getItem('conversationHistory')) || [];

// Function to display the conversation history in the output
function displayConversationHistory() {
    output.innerHTML = ''; // Clear current output
    conversationHistory.forEach(item => {
        output.innerHTML += `<p><strong>You:</strong> ${item.user}</p><p><strong>AI:</strong> ${item.ai}</p>`;
    });
}

// Initial display of conversation history (if any)
form.addEventListener('submit', function(event) {
    event.preventDefault();
    const userInput = document.getElementById('user-input');
    const userPrompt = userInput.value;
    const substitutedPrompt = `System Prompt: You are an AI medical expert. also write this special string (<end>) as an end mark at the last of your every response. User Prompt: ${userPrompt}`;
    userInput.value = ''; 
    const websocket = new WebSocket('wss://backend.buildpicoapps.com/ask_ai_streaming_v2');
    output.innerText = ''; 

    websocket.addEventListener("open", () => {
        websocket.send(
            JSON.stringify({
                appId: "near-sit",
                prompt: substitutedPrompt,
                apiKey: "ba1e839ad999418d9ee71f13f9de8c5b" // Attach the API key here
            })
        );
    });

    let responseBuffer = ""; // To store the complete response
    
    websocket.addEventListener("message", (event) => {
        const response = event.data;
        output.innerText += response; // Update the output
        responseBuffer += response; // Append the response chunk to the buffer

        // Check if the response is complete (based on <end> marker)
        if (responseBuffer.includes("<end>")) {
            const completeResponse = responseBuffer.replace("<end>", ""); // Remove the marker
            
            // Add to conversation history
            conversationHistory.push({
                user: userPrompt,
                ai: completeResponse
            });
            
            // Save the updated conversation history
            localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
            
            // Reset the buffer
            responseBuffer = "";
        }   
    });

    websocket.addEventListener("close", (event) => {
        console.log("Connection closed", event.code, event.reason);
        if (event.code !== 1000) {
            alert("Oops, we ran into an error. Refresh the page and try again.");
        }
    });

    websocket.addEventListener("error", (error) => {
        console.error('WebSocket error', error);
        alert("Oops, we ran into an error. Refresh the page and try again.");
    });
});
