const chatForm = document.getElementById("chatForm");

const messageInput = document.getElementById("messageInput");

const chatMessages = document.getElementById("chatMessages");

const typingIndicator = document.getElementById("typingIndicator");

const sendButton = document.getElementById("sendButton");

const clearChatBtn = document.getElementById("clearChatBtn");

const quickQuestions = document.querySelectorAll(".quick-question");

// ========================================
// STORAGE KEY
// ========================================

const CHAT_STORAGE_KEY = "engineerAIChatHistory";

// ========================================
// ADD MESSAGE
// ========================================

function addMessage(message, sender, save = true) {
  const wrapper = document.createElement("div");

  wrapper.className = `message ${sender}`;

  const avatar = document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent = sender === "bot" ? "AI" : "You";

  const content = document.createElement("div");

  content.className = "message-content";

  const bubble = document.createElement("div");

  bubble.className = "bubble";

  bubble.textContent = message;

  const time = document.createElement("span");

  time.className = "message-time";

  time.textContent = sender === "bot" ? "AI Assistant" : "You";

  content.appendChild(bubble);

  content.appendChild(time);

  wrapper.appendChild(avatar);

  wrapper.appendChild(content);

  chatMessages.appendChild(wrapper);

  if (save) {
    saveMessage(message, sender);
  }

  scrollToBottom();
}

// ========================================
// SAVE MESSAGE
// ========================================

function saveMessage(message, sender) {
  const history = JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY) || "[]");

  history.push({
    message,
    sender,
  });

  sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));
}

// ========================================
// LOAD CHAT
// ========================================

function loadChat() {
  const history = JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY) || "[]");

  if (history.length === 0) {
    return;
  }

  chatMessages.innerHTML = "";

  history.forEach((item) => {
    addMessage(item.message, item.sender, false);
  });
}

// ========================================
// SCROLL
// ========================================

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========================================
// TYPING
// ========================================

function showTyping() {
  typingIndicator.classList.remove("hidden");

  scrollToBottom();
}

function hideTyping() {
  typingIndicator.classList.add("hidden");
}

// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage(message) {
  if (!message || !message.trim()) {
    return;
  }

  message = message.trim();

  addMessage(message, "user");

  messageInput.value = "";

  messageInput.disabled = true;

  sendButton.disabled = true;

  showTyping();

  try {
    const response = await fetch("https://engineer-ai-dss.vercel.app/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,
      }),
    });

    const data = await response.json();

    hideTyping();

    if (!response.ok) {
      throw new Error(
        data.error || data.message || "Unable to process request.",
      );
    }

    if (!data.success) {
      throw new Error(
        data.error || data.message || "The AI could not process your question.",
      );
    }

    addMessage(data.reply, "bot");
  } catch (error) {
    console.error("Chat Error:", error);

    hideTyping();

    addMessage(error.message || "Unable to process your request.", "bot");
  } finally {
    messageInput.disabled = false;

    sendButton.disabled = false;

    messageInput.focus();
  }
}

// ========================================
// FORM
// ========================================

chatForm.addEventListener("submit", function (event) {
  event.preventDefault();

  sendMessage(messageInput.value);
});

// ========================================
// QUICK QUESTIONS
// ========================================

quickQuestions.forEach((button) => {
  button.addEventListener("click", function () {
    const question = button.dataset.question;

    sendMessage(question);
  });
});

// ========================================
// CLEAR CHAT
// ========================================

clearChatBtn.addEventListener("click", function () {
  const confirmed = confirm("Clear the conversation?");

  if (!confirmed) {
    return;
  }

  sessionStorage.removeItem(CHAT_STORAGE_KEY);

  chatMessages.innerHTML = "";

  addMessage(
    "Hello! I'm your Engineering Decision Support Assistant. Run a decision analysis first, then ask me about the AHP weights, TOPSIS ranking, or recommendation.",
    "bot",
  );

  messageInput.focus();
});

// ========================================
// ENTER KEY
// ========================================

messageInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    chatForm.requestSubmit();
  }
});

// ========================================
// INITIALIZE
// ========================================

loadChat();

messageInput.focus();
