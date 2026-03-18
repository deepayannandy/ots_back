const mqtt = require("mqtt");

class MqttService {
  constructor() {
    this.client = null;
    this.options = {
      protocol: "wss",
      path: "/mqtt",
      clientId: `iiotcore_backend_${Math.random().toString(16).slice(3)}`,
      username: "dnymqUser",
      password: "DNY@10Mil",
      connectTimeout: 4000,
      reconnectPeriod: 5000,
      // Set to true once your Let's Encrypt SSL is fully verified
      rejectUnauthorized: false,
    };
  }

  connect(brokerUrl) {
    // e.g., 'wss://mqtt.iiotcore.com:443'
    this.client = mqtt.connect(brokerUrl, this.options);

    this.client.on("connect", () => {
      console.log("✅ MQTT Service: Connected to WSS Broker");
      this.subscribe("iiotcore/commands");
    });

    this.client.on("error", (err) => {
      console.error("❌ MQTT Error:", err.message);
    });

    this.client.on("message", (topic, message) => {
      console.log(`📩 Received on ${topic}: ${message.toString()}`);
      // You can trigger your Arduino USB function here
    });
  }

  subscribe(topic) {
    this.client.subscribe(topic, (err) => {
      if (err) console.error(`Subscription error for ${topic}`);
    });
  }

  publish(topic, message) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, JSON.stringify(message), { qos: 1 });
    } else {
      console.error("⚠️ Cannot publish: MQTT not connected");
    }
  }
}

// Export as a Singleton
module.exports = new MqttService();
