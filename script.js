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
