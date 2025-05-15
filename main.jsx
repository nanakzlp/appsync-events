import { Amplify } from 'aws-amplify';
import { events } from 'aws-amplify/data';


Amplify.configure({
  "API": {
    "Events": {
      "endpoint": "https://ws2ll764grdmbmlqpxzsnkvvfa.appsync-api.us-east-1.amazonaws.com/event",
      "region": "us-east-1",
      "defaultAuthMode": "apiKey",
      "apiKey": "da2-ovdidjfcd5e7xmqsnnimapmgce"
    }
  }
});

const channel = await events.connect('/default/test');
channel.subscribe({
    next: (data) => {
        document.getElementById("eventsLog").insertAdjacentText("beforeend", data.event.message + '\n');
    },
    error: (err) => console.error('error', err),
});

window.publishEvent = () => {
    const message = document.getElementById('messageId');
    events.post('/default/test', { message: message.value });
    message.value = "";
}
