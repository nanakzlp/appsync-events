<template>
<!-- Registration/Login Screen -->
<div v-if="!isAuthenticated" class="login-container">
  <div class="login-box">
    <h2>Welcome to InsTAMt Chat</h2>
    <input
      v-model="userName"
      placeholder="Enter your name"
      @keyup.enter="handleLogin"
    />
    <button @click="handleLogin" class="login-button">Join Chat</button>
  </div>
</div>

<!-- Chat Screen -->
<div v-else class="app-container">
  <div class="chat-container">
    <div class="main-content">
      <div class="chat-header">
        <h1>InsTAMt</h1>
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

    <div class="side-panel">
      <qrcode-vue
        :value="currentPageUrl"
        :size="200"
        level="H"
      />
    </div>
  </div>
</div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { events } from 'aws-amplify/data'
import QrcodeVue from 'qrcode.vue'

export default {
  setup() {
    const message = ref('')
    const messages = ref([])
    const messageContainer = ref(null)
    const isAuthenticated = ref(false)
    const userName = ref('')
    const currentPageUrl = ref(window.location.href)
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
      handleLogin,
      currentPageUrl
    }
  },
  components: {
    QrcodeVue
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.chat-container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.side-panel {
  width: 250px;
  align-self: flex-start;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 1rem;
}

/* Login styles */

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #333; /* or any dark color you prefer */
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.login-box h2 {
  margin-bottom: 1.5rem;
  color: #128C7E;
}

.login-box input {
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #333;
  color: white;
}

.login-button {
  width: 100%;
  background-color: #128C7E;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
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
  min-height: 400px;
  max-height: calc(100vh - 200px);
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
  color: #000000;
}

.message-mine {
  margin-left: auto;
  background-color: #DCF8C6;
  color: #000000;
}

.message-other {
  margin-right: auto;
  background-color: white;
  border: 1px solid #E2E8F0;
  color: #000000;
}

.message-content {
  color: #000000;
  font-size: 1rem;
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
