document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const themeToggle = document.getElementById("theme-toggle");
    const welcomeAnimation = document.getElementById("welcome-animation");
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-message");
    const ttsToggle = document.getElementById("tts-toggle");
    const menuItems = document.querySelectorAll(".sidebar-menu-item");
    const newChatButton = document.getElementById("new-chat");
    const chatHistoryList = document.getElementById("chat-history-list");
    const serviceIcons = document.querySelectorAll(".service-icon");
  
    // Configuration
    const GROQ_API_KEY = "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"; // Add your Groq API key here
    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    const GROQ_MODEL = "llama3-70b-8192"; // You can also use "mixtral-8x7b-32768" or other models
  
    // State
    let ttsEnabled = localStorage.getItem("ttsEnabled") === "true" || false;
    let currentAudio = null;
    let messages = [];
    let isLoading = false;
    let currentChatId = generateId();
    let chatHistory = [];
    let activeService = "chat"; // Default service
  
    // Initialize
    init();
  
    function init() {
      // Check for saved theme
      const savedTheme = localStorage.getItem("theme") || "dark";
      document.body.className = savedTheme + "-theme";
      updateThemeToggleButton();
  
      // Setup event listeners
      setupEventListeners();
  
      // Auto-hide welcome animation after 5 seconds
      setTimeout(() => {
        if (welcomeAnimation) {
          welcomeAnimation.style.display = "none";
        }
      }, 5000);
  
      // Check if mobile and collapse sidebar
      checkMobileView();
      window.addEventListener("resize", checkMobileView);
  
      // Load saved chat history or start new chat
      loadChatHistory();
  
      // Initialize TTS state
      updateTtsToggleButton();
  
      // Check if Groq API key is set
      if (!GROQ_API_KEY) {
        showToast("Please set your Groq API key in the script.js file", 5000);
      }
    }
  
    function setupEventListeners() {
      // Sidebar toggle
      if (sidebarToggle) {
        sidebarToggle.addEventListener("click", toggleSidebar);
      }
  
      // Theme toggle
      if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
      }
  
      // Menu items
      menuItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          
          // Skip if it's the new chat button
          if (item.id === "new-chat") return;
          
          // Set active menu item
          setActiveMenuItem(item);
          
          // Set active service if it's a service menu item
          const serviceId = item.getAttribute("data-id");
          if (serviceId) {
            activeService = serviceId;
            // Update the service icons
            updateServiceIcons(serviceId);
          }
  
          // On mobile, close sidebar after selection
          if (window.innerWidth <= 768) {
            sidebar.classList.remove("mobile-open");
          }
        });
      });
  
      // Service icons if they exist
      if (serviceIcons) {
        serviceIcons.forEach((icon) => {
          icon.addEventListener("click", (e) => {
            e.preventDefault();
            const serviceId = icon.getAttribute("data-id");
            if (serviceId) {
              activeService = serviceId;
              updateServiceIcons(serviceId);
              // Also update the sidebar menu item
              const menuItem = document.querySelector(`.sidebar-menu-item[data-id="${serviceId}"]`);
              if (menuItem) {
                setActiveMenuItem(menuItem);
              }
            }
          });
        });
      }
  
      // Message input
      if (messageInput) {
        messageInput.addEventListener("input", () => {
          sendButton.disabled = messageInput.value.trim() === "" || isLoading;
  
          // Auto-resize textarea
          messageInput.style.height = "auto";
          messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + "px";
        });
  
        messageInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) {
              sendMessage();
            }
          }
        });
      }
  
      // Send button
      if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
      }
  
      // TTS toggle
      if (ttsToggle) {
        ttsToggle.addEventListener("click", toggleTts);
      }
  
      // New chat button
      if (newChatButton) {
        newChatButton.addEventListener("click", (e) => {
          e.preventDefault();
          startNewChat();
        });
      }
    }
  
    function updateServiceIcons(activeServiceId) {
      const serviceIcons = document.querySelectorAll(".service-icon");
      if (serviceIcons) {
        serviceIcons.forEach((icon) => {
          const serviceId = icon.getAttribute("data-id");
          if (serviceId === activeServiceId) {
            icon.classList.add("active");
          } else {
            icon.classList.remove("active");
          }
        });
      }
    }
  
    function toggleSidebar() {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle("mobile-open");
      } else {
        sidebar.classList.toggle("collapsed");
      }
    }
  
    function toggleTheme() {
      const currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
  
      document.body.className = newTheme + "-theme";
      localStorage.setItem("theme", newTheme);
  
      updateThemeToggleButton();
    }
  
    function updateThemeToggleButton() {
      const isDark = document.body.classList.contains("dark-theme");
  
      if (themeToggle) {
        const icon = themeToggle.querySelector("i");
        const text = themeToggle.querySelector("span");
  
        if (isDark) {
          icon.className = "fas fa-sun";
          if (text) text.textContent = "Light Mode";
        } else {
          icon.className = "fas fa-moon";
          if (text) text.textContent = "Dark Mode";
        }
      }
    }
  
    function setActiveMenuItem(item) {
      menuItems.forEach((menuItem) => {
        menuItem.classList.remove("active");
      });
  
      item.classList.add("active");
    }
  
    function checkMobileView() {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("collapsed");
        sidebar.classList.remove("mobile-open");
      }
    }
  
    function toggleTts() {
      ttsEnabled = !ttsEnabled;
      localStorage.setItem("ttsEnabled", ttsEnabled);
      updateTtsToggleButton();
  
      // Stop any playing audio if TTS is disabled
      if (!ttsEnabled && currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    }
  
    function updateTtsToggleButton() {
      if (ttsToggle) {
        const icon = ttsToggle.querySelector("i");
  
        if (ttsEnabled) {
          ttsToggle.classList.add("active");
          icon.className = "fas fa-volume-up";
        } else {
          ttsToggle.classList.remove("active");
          icon.className = "fas fa-volume-mute";
        }
      }
    }
  
    function displayMessage(message) {
      const messageElement = document.createElement("div");
      messageElement.className = `message ${message.role === "assistant" ? "ai" : message.role}`;
      messageElement.setAttribute("data-message-id", message.id);
  
      const avatarElement = document.createElement("div");
      avatarElement.className = "message-avatar";
      
      if (message.role === "user") {
        avatarElement.innerHTML = '<i class="fas fa-user"></i>';
      } else {
        // Updated gradient fox avatar for AI
        avatarElement.innerHTML = `
          <div class="fox-avatar">
            <img src="vexai.png" alt="VEX AI Fox Logo" class="fox-logo">
          </div>
        `;
      }
  
      const contentElement = document.createElement("div");
      contentElement.className = "message-content";
      
      // Support markdown rendering if needed
      if (message.isMarkdown) {
        // Simple code block formatting
        contentElement.innerHTML = formatCodeBlocks(message.content);
      } else {
        contentElement.textContent = message.content;
      }
  
      messageElement.appendChild(avatarElement);
      messageElement.appendChild(contentElement);
  
      // Add actions for messages
      const actionsElement = document.createElement("div");
      actionsElement.className = "message-actions";
  
      // Copy button for all messages
      const copyButton = document.createElement("button");
      copyButton.className = "message-action-btn";
      copyButton.innerHTML = '<i class="fas fa-copy"></i>';
      copyButton.title = "Copy to clipboard";
      copyButton.addEventListener("click", () => {
        copyToClipboard(message.content);
        showToast("Message copied to clipboard");
      });
      actionsElement.appendChild(copyButton);
  
      // TTS button for AI messages only
      if (message.role === "assistant") {
        const ttsButton = document.createElement("button");
        ttsButton.className = "message-action-btn";
        ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        ttsButton.title = "Read aloud";
        ttsButton.addEventListener("click", () => {
          speakText(message.content);
        });
        actionsElement.appendChild(ttsButton);
  
        // Auto-speak if TTS is enabled
        if (ttsEnabled) {
          setTimeout(() => {
            speakText(message.content);
          }, 500);
        }
      }
  
      contentElement.appendChild(actionsElement);
      chatMessages.appendChild(messageElement);
      scrollToBottom();
    }
  
    function addMessage(message) {
      messages.push(message);
      saveMessages();
      displayMessage(message);
    }
  
    function formatCodeBlocks(text) {
      // Simple regex to handle code blocks with ```
      return text.replace(/\`\`\`([^`]+)\`\`\`/g, '<pre class="code-block">$1</pre>');
    }
  
    async function sendMessage() {
      const messageText = messageInput.value.trim();
      if (messageText === "" || isLoading) return;
  
      // Add user message
      const userMessage = {
        id: generateId(),
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);
  
      // Clear input
      messageInput.value = "";
      messageInput.style.height = "auto";
      sendButton.disabled = true;
  
      // Show loading
      isLoading = true;
      const loadingElement = document.createElement("div");
      loadingElement.className = "message ai loading";
  
      const avatarElement = document.createElement("div");
      avatarElement.className = "message-avatar";
      avatarElement.innerHTML = `
        <div class="fox-avatar">
          <img src="vexai.png" alt="VEX AI Fox Logo" class="fox-logo">
        </div>
      `;
  
      const contentElement = document.createElement("div");
      contentElement.className = "message-content";
      contentElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  
      loadingElement.appendChild(avatarElement);
      loadingElement.appendChild(contentElement);
      chatMessages.appendChild(loadingElement);
      scrollToBottom();
  
      try {
        // Get AI response using Groq API
        const response = await getGroqResponse(messageText, activeService);
        
        // Remove loading message
        chatMessages.removeChild(loadingElement);
        
        // Add AI response
        const aiMessage = {
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
          isMarkdown: true // Enable markdown rendering for AI responses
        };
        addMessage(aiMessage);
        
        // Update chat title in history
        updateChatTitle(userMessage.content);
        
      } catch (error) {
        console.error("Error getting AI response:", error);
        
        // Remove loading message
        chatMessages.removeChild(loadingElement);
        
        // Add error message
        const errorMessage = {
          id: generateId(),
          role: "assistant",
          content: `Sorry, I encountered an error while processing your request: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        addMessage(errorMessage);
      } finally {
        isLoading = false;
      }
    }
  
    async function getGroqResponse(message, service) {
      // If no API key is set, use the fallback response
      if (!GROQ_API_KEY) {
        return simulateAiResponse(message, service);
      }
  
      // Prepare system message based on active service
      let systemMessage = "";
      switch (service) {
        case "images":
          systemMessage = "You are an AI assistant specialized in describing images in detail. When the user asks for an image, describe what the image would look like if you could generate it.";
          break;
        case "documents":
          systemMessage = "You are an AI assistant specialized in document analysis. Provide detailed summaries and insights from documents.";
          break;
        case "code":
          systemMessage = "You are an AI assistant specialized in programming. Provide code examples, explanations, and solutions to coding problems. Always format code with appropriate markdown using triple backticks.";
          break;
        default:
          systemMessage = "You are VEX AI, a helpful and friendly AI assistant with a fox avatar. You provide concise, accurate, and helpful responses.";
      }
  
      // Prepare conversation history for the API
      const conversationHistory = [
        { role: "system", content: systemMessage }
      ];
  
      // Add previous messages (limit to last 10 for context)
      const relevantMessages = messages.slice(-10);
      relevantMessages.forEach(msg => {
        // Map 'ai' role to 'assistant' for Groq API compatibility
        const apiRole = msg.role === "ai" ? "assistant" : msg.role;
        conversationHistory.push({
          role: apiRole,
          content: msg.content
        });
      });
  
      // Add current user message
      conversationHistory.push({
        role: "user",
        content: message
      });
  
      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: conversationHistory,
            temperature: 0.7,
            max_tokens: 1024
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to get response from Groq API");
        }
  
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error("Error calling Groq API:", error);
        throw error;
      }
    }
  
    async function simulateAiResponse(message, service) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Different responses based on active service
      switch (service) {
        case "images":
          return "I've generated an image based on your request. In a real implementation with the Groq API, this would display the generated image here.\n\nYour prompt: \"" + message + "\"";
        case "documents":
          return "I've analyzed your document. Here's a summary of the key points:\n\n• The document contains important information\n• There are several sections that need attention\n• The conclusion summarizes the main findings\n\nWould you like me to extract specific information from the document?";
        case "code":
          return "```javascript\n// Here's the code you requested based on: \"" + message + "\"\nfunction greetUser(name) {\n  return `Hello, ${name}! Welcome to VEX AI.`;\n}\n\n// Example usage\nconst greeting = greetUser('User');\nconsole.log(greeting);\n```\n\nYou can copy this code and use it in your project. Would you like me to explain how it works?";
        default:
          return `I understand you're asking about "${message}". As VEX AI, I'm here to help with any questions you might have. What specific information would you like to know?`;
      }
    }
  
    function speakText(text) {
      // Stop any current audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
  
      // Remove markdown code blocks and formatting for better TTS
      const cleanText = text.replace(/\`\`\`[\s\S]*?\`\`\`/g, "Code block omitted for speech.")
                           .replace(/`([^`]+)`/g, "$1")
                           .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
                           .replace(/\*([^*]+)\*/g, "$1")     // Italic
                           .replace(/#+ (.+)/g, "$1");        // Headers
  
      // Use the browser's built-in speech synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
  
        // Try to use a better voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes("Google") || voice.name.includes("Natural") || 
          voice.name.includes("Female") || voice.name.includes("Microsoft")
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
  
        window.speechSynthesis.speak(utterance);
  
        // Store reference to current audio
        currentAudio = {
          pause: () => window.speechSynthesis.cancel(),
        };
      }
    }
  
    function scrollToBottom() {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  
    function showToast(message, duration = 3000) {
      // Create toast if it doesn't exist
      let toast = document.getElementById("toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
      }
  
      // Show toast with message
      toast.textContent = message;
      toast.className = "toast show";
  
      // Hide toast after specified duration
      setTimeout(() => {
        toast.className = toast.className.replace("show", "");
      }, duration);
    }
  
    function generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
  
    function saveMessages() {
      try {
        // Create chat object
        const chat = {
          id: currentChatId,
          title: getChatTitle(),
          lastUpdated: new Date().toISOString(),
          messages: messages
        };
        
        // Save to localStorage
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chat));
        
        // Update chat history
        updateChatHistory();
      } catch (error) {
        console.error("Error saving chat:", error);
        showToast("Error saving chat: Storage may be full");
      }
    }
  
    function getChatTitle() {
      // Get title from first user message or use default
      if (messages.length > 0) {
        const userMessage = messages.find(msg => msg.role === "user");
        if (userMessage) {
          return userMessage.content.substring(0, 30) + (userMessage.content.length > 30 ? "..." : "");
        }
      }
      return "New Chat";
    }
  
    function updateChatTitle(userMessage) {
      // Update chat title based on first user message
      const title = userMessage.substring(0, 30) + (userMessage.length > 30 ? "..." : "");
      
      // Update chat history display
      updateChatHistory();
    }
  
    function loadChatHistory() {
      try {
        // Check if there's a selected chat in localStorage
        const selectedChatId = localStorage.getItem("selectedChatId");
        
        // Get all chats from localStorage
        chatHistory = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("chat_")) {
            const chatId = key.replace("chat_", "");
            const savedChat = localStorage.getItem(key);
            
            if (savedChat) {
              const parsedChat = JSON.parse(savedChat);
              chatHistory.push(parsedChat);
            }
          }
        }
        
        // Sort chats by last updated (newest first)
        chatHistory.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        
        // Update chat history display
        updateChatHistory();
        
        if (selectedChatId && chatHistory.find(chat => chat.id === selectedChatId)) {
          // Load selected chat
          currentChatId = selectedChatId;
          const currentChat = chatHistory.find(chat => chat.id === selectedChatId);
          if (currentChat) {
            messages = currentChat.messages;
            renderMessages();
          }
        } else if (chatHistory.length > 0) {
          // Load most recent chat
          currentChatId = chatHistory[0].id;
          messages = chatHistory[0].messages;
          renderMessages();
        } else {
          // Start a new chat
          startNewChat();
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        startNewChat();
      }
    }
  
    function updateChatHistory() {
      // Clear the chat history list
      chatHistoryList.innerHTML = "";
      
      // Add each chat to the list
      chatHistory.forEach(chat => {
        const chatItem = document.createElement("div");
        chatItem.className = `chat-history-item ${chat.id === currentChatId ? "active" : ""}`;
        chatItem.setAttribute("data-chat-id", chat.id);
        
        chatItem.innerHTML = `
          <div class="chat-history-item-title">${chat.title}</div>
          <div class="chat-history-item-actions">
            <button class="chat-history-delete-btn" title="Delete chat"><i class="fas fa-trash"></i></button>
          </div>
        `;
        
        // Add event listeners
        chatItem.addEventListener("click", () => {
          switchToChat(chat.id);
        });
        
        chatItem.querySelector(".chat-history-delete-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          deleteChat(chat.id);
        });
        
        chatHistoryList.appendChild(chatItem);
      });
    }
  
    function renderMessages() {
      // Clear chat container
      chatMessages.innerHTML = "";
      
      // Add each message to the UI
      messages.forEach(message => {
        displayMessage(message);
      });
      
      // If empty, add welcome message
      if (messages.length === 0) {
        const welcomeMessage = {
          id: generateId(),
          role: "assistant",
          content: "Hello! I'm VEX AI, powered by advanced AI technology. How can I assist you today?",
          timestamp: new Date().toISOString(),
        };
        displayMessage(welcomeMessage);
        // Add it to messages array but don't save it yet
        messages.push(welcomeMessage);
      }
    }
  
    function startNewChat() {
      const newChatId = generateId();
      currentChatId = newChatId;
      localStorage.setItem("selectedChatId", newChatId);
  
      // Reset messages
      messages = [];
      
      // Add welcome message
      const welcomeMessage = {
        id: generateId(),
        role: "assistant",
        content: "Hello! I'm VEX AI, powered by advanced AI technology. How can I assist you today?",
        timestamp: new Date().toISOString(),
      };
      
      // Add to messages array
      messages.push(welcomeMessage);
      
      // Save new chat
      saveMessages();
      
      // Render messages
      renderMessages();
      
      // Update active state in chat history
      updateChatHistory();
    }
  
    function switchToChat(chatId) {
      const chat = chatHistory.find(c => c.id === chatId);
      if (chat) {
        currentChatId = chatId;
        messages = chat.messages;
        localStorage.setItem("selectedChatId", chatId);
        
        // Render messages
        renderMessages();
        
        // Update active state in chat history
        updateChatHistory();
      }
    }
  
    function deleteChat(chatId) {
      if (confirm("Are you sure you want to delete this chat?")) {
        localStorage.removeItem(`chat_${chatId}`);
        
        // If we're deleting the current chat, start a new one
        if (chatId === currentChatId) {
          startNewChat();
        } else {
          updateChatHistory();
        }
      }
    }
  });