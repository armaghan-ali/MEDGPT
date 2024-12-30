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
// displayConversationHistory();

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const userInput = document.getElementById('user-input');
    const userPrompt = userInput.value;
    const substitutedPrompt = `System Prompt: You are an AI medical expert. also write this special string (<end>)as end mark at last of your every response. User Prompt: ${userPrompt}`;
    userInput.value = ''; 
    const websocket = new WebSocket('wss://backend.buildpicoapps.com/ask_ai_streaming_v2');
    output.innerText = ''; 

    websocket.addEventListener("open", () => {
        websocket.send(
            JSON.stringify({
                appId: "near-sit",
                prompt: substitutedPrompt,
            })
        );
    });

    let responseBuffer = ""; // To store the complete response
    let isResponseComplete = false; // Flag to track if the response is complete
    
    websocket.addEventListener("message", (event) => {
        const response = event.data;
        output.innerText = `${output.innerText}${response}`;
        // Append the new chunk of data to the responseBuffer
        responseBuffer += response;
    
        console.log("Received chunk:", response);
    
        // Check if the response is complete (looking for the <end> marker)
        if (responseBuffer.includes("<end>")) {
            // Remove the <end> marker from the buffer before storing
            const completeResponse = responseBuffer.replace("<end>", "");
            
            // Update the output
            // output.innerText = ${output.innerText}${completeResponse};
            
            // Add the user input and the complete AI response to the conversation history as a string
            conversationHistory.push(`${output.innerText}${completeResponse}`);
            output.innerText
            console.log("Full Response:", completeResponse);
            
            // Save the updated conversation history to localStorage
            localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    
            // Display the updated conversation history on the page
            // displayConversationHistory();
    
            // Reset the buffer for the next response
            responseBuffer = "";
        } 
        else {
            // If the response is not complete yet, continue collecting the fragments
            console.log("Waiting for more data...");
        }
    });
    
    websocket.addEventListener("close", (event) => {
        console.log("Connection closed", event.code, event.reason);
        if (event.code != 1000) {
            alert("Oops, we ran into an error. Refresh the page and try again.");
        }
    });

    websocket.addEventListener("error", (error) => {
        console.log('WebSocket error', error);
        alert("Oops, we ran into an error. Refresh the page and try again.");
    });
});