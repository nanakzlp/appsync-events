<template>
  <!-- Registration/Login Screen -->
  <div v-if="!isAuthenticated" class="login-container">
    <div class="login-box">
      <h2>Welcome to AppSync Chat</h2>
      <input
        v-model="userName"
        placeholder="Enter your name"
        @keyup.enter="handleLogin"
      />
      <button @click="handleLogin" class="login-button">Join Chat</button>
    </div>
  </div>

  <!-- Chat Screen -->
  <div v-else class="chat-container">
    <div class="chat-header">
      <h1>AppSync Chat</h1>
      <div class="user-info">Welcome, {{ userName }}</div>
    </div>

    <div class="chat-messages" ref="messageContainer">
      <div v-for="(message, index) in messages"
           :key="index"
           :class="['message', message.sender === userName ? 'message-mine' : 'message-other']">
        <div class="message-sender">{{ message.sender }}</div>
        <div class="message-content">{{ message.text }}</div>
        <span class="message-time">{{ message.time }}</span>
      </div>
    </div>

    <div class="chat-input">
      <input
        type="text"
        v-model="message"
        placeholder="Type a message..."
        @keyup.enter="publishEvent"
      />
      <button @click="publishEvent" class="send-button">
        <span>Send</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { events } from 'aws-amplify/data'

export default {
  setup() {
    const message = ref('')
    const messages = ref([])
    const messageContainer = ref(null)
    const isAuthenticated = ref(false)
    const userName = ref('')
    let channel = null

    const handleLogin = async () => {
      if (userName.value.trim()) {
        isAuthenticated.value = true
        // Connect to chat after authentication
        channel = await events.connect('/default/test')
        channel.subscribe({
          next: (data) => {
            messages.value.push({
              sender: data.event.sender,
              text: data.event.message,
              time: new Date().toLocaleTimeString()
            })
          },
          error: (err) => console.error('error', err)
        })
      }
    }

    const publishEvent = () => {
      if (message.value.trim()) {
        events.post('/default/test', {
          message: message.value,
          sender: userName.value
        })
        message.value = ''
      }
    }

    watch(messages, () => {
      setTimeout(() => {
        if (messageContainer.value) {
          messageContainer.value.scrollTop = messageContainer.value.scrollHeight
        }
      }, 0)
    }, { deep: true })

    return {
      message,
      messages,
      publishEvent,
      messageContainer,
      isAuthenticated,
      userName,
      handleLogin
    }
  }
}
</script>


<style scoped>
/* Main container styles */
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  padding: 1rem;
  gap: 1rem;
}

/* Header styles */
.chat-header {
  background: #128C7E;
  padding: 1rem 2rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.chat-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

/* Messages container */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Message styles */
.message {
  margin-bottom: 1rem;
  max-width: 70%;
  padding: 0.8rem;
  border-radius: 12px;
  color: #000000; /* Adding black color for message text */
}

.message-mine {
  margin-left: auto;
  background-color: #DCF8C6;
  color: #000000; /* Ensuring sent messages are black */
}

.message-other {
  margin-right: auto;
  background-color: white;
  border: 1px solid #E2E8F0;
  color: #000000; /* Ensuring received messages are black */
}

.message-content {
  color: #000000; /* Making message content explicitly black */
  font-size: 1rem; /* Adding a good size for readability */
}

.message-sender {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #128C7E;
}

.message-time {
  font-size: 0.7rem;
  color: #666;
  display: block;
  margin-top: 0.3rem;
  text-align: right;
}

/* Input area styles */
.chat-input {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-input input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  font-size: 1rem;
}

.chat-input input:focus {
  outline: none;
  border-color: #128C7E;
}

.send-button {
  background-color: #128C7E;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 24px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #075E54;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>