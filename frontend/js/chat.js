// ========================================
// ENGINEERAI CHAT
// ========================================

// ========================================
// ELEMENTS
// ========================================

const chatForm = document.getElementById("chatForm");

const messageInput = document.getElementById("messageInput");

const chatMessages = document.getElementById("chatMessages");

const typingIndicator = document.getElementById("typingIndicator");

const sendButton = document.getElementById("sendButton");

const clearChatBtn = document.getElementById("clearChatBtn");

// ========================================
// API BASE URL
// ========================================

// Your Express backend is running on port 5000.
const API_BASE_URL = "https://engineerai-dss-production.up.railway.app";

// ========================================
// GET DSS RESULT
// ========================================

function getDSSResult() {
  const storedResult = sessionStorage.getItem("dssResult");

  if (!storedResult) {
    return null;
  }

  try {
    return JSON.parse(storedResult);
  } catch (error) {
    console.error("DSS result parsing error:", error);

    return null;
  }
}

// ========================================
// ADD MESSAGE
// ========================================

function addMessage(message, sender) {
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

  scrollToBottom();
}

// ========================================
// SCROLL TO BOTTOM
// ========================================

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========================================
// SHOW TYPING
// ========================================

function showTyping() {
  typingIndicator.classList.remove("hidden");

  scrollToBottom();
}

// ========================================
// HIDE TYPING
// ========================================

function hideTyping() {
  typingIndicator.classList.add("hidden");
}

// ========================================
// SEND MESSAGE
// ========================================

chatForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message) {
    return;
  }

  // ========================================
  // GET CURRENT DSS RESULT
  // ========================================

  const dssResult = getDSSResult();

  // ========================================
  // CHECK DSS RESULT
  // ========================================

  if (!dssResult) {
    addMessage(
      "Please run a decision analysis first. Once the analysis is completed, I can explain the calculated AHP and TOPSIS results.",

      "bot",
    );

    return;
  }

  // ========================================
  // SHOW USER MESSAGE
  // ========================================

  addMessage(message, "user");

  messageInput.value = "";

  // ========================================
  // DISABLE INPUT
  // ========================================

  messageInput.disabled = true;

  sendButton.disabled = true;

  // ========================================
  // SHOW TYPING
  // ========================================

  showTyping();

  try {
    // ========================================
    // API URL
    // ========================================

    const apiURL = `${API_BASE_URL}/api/chat`;

    console.log("Sending chat request to:", apiURL);

    console.log("DSS result being sent:", dssResult);

    // ========================================
    // SEND REQUEST TO EXPRESS
    // ========================================

    const response = await fetch(apiURL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,

        dssResult,
      }),
    });

    // ========================================
    // READ RAW RESPONSE
    // ========================================

    const rawResponse = await response.text();

    console.log("HTTP status:", response.status);

    console.log("Raw server response:", rawResponse);

    // ========================================
    // CHECK EMPTY RESPONSE
    // ========================================

    if (!rawResponse.trim()) {
      throw new Error(
        `Server returned an empty response. HTTP status: ${response.status}`,
      );
    }

    // ========================================
    // CONVERT RESPONSE TO JSON
    // ========================================

    let data;

    try {
      data = JSON.parse(rawResponse);
    } catch (error) {
      console.error("JSON parsing failed:", error);

      throw new Error(
        `Server returned non-JSON data. HTTP ${response.status}: ${rawResponse.substring(0, 300)}`,
      );
    }

    hideTyping();

    // ========================================
    // SERVER ERROR
    // ========================================

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `Server error: ${response.status}`,
      );
    }

    // ========================================
    // AI RESPONSE
    // ========================================

    if (data.success && data.reply) {
      addMessage(data.reply, "bot");
    } else {
      addMessage(
        data.error ||
          data.message ||
          "The server did not return an AI response.",

        "bot",
      );
    }
  } catch (error) {
    console.error("CHAT REQUEST ERROR:", error);

    hideTyping();

    addMessage(
      error.message || "Unable to communicate with the backend.",

      "bot",
    );
  } finally {
    // ========================================
    // ENABLE INPUT AGAIN
    // ========================================

    messageInput.disabled = false;

    sendButton.disabled = false;

    messageInput.focus();
  }
});

// ========================================
// CLEAR CHAT
// ========================================

clearChatBtn.addEventListener("click", function () {
  const confirmed = confirm("Clear the conversation?");

  if (!confirmed) {
    return;
  }

  chatMessages.innerHTML = "";

  addMessage(
    "Hello! I'm your Engineering Decision Support Assistant. Ask me about your DSS results, AHP weights, TOPSIS rankings, or engineering decision analysis.",

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
// INITIAL FOCUS
// ========================================

messageInput.focus();
