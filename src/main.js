import { createApp } from 'vue'
import './style.css'
import { Amplify } from 'aws-amplify'
import { events } from 'aws-amplify/data'
import App from './App.vue'

// Configure Amplify
Amplify.configure({
  "API": {
    "Events": {
      "endpoint": "https://ws2ll764grdmbmlqpxzsnkvvfa.appsync-api.us-east-1.amazonaws.com/event",
      "region": "us-east-1",
      "defaultAuthMode": "apiKey",
      "apiKey": "da2-ovdidjfcd5e7xmqsnnimapmgce"
    }
  }
})

const app = createApp(App)
app.mount('#app')

// Create a component (App.vue) to handle the events: