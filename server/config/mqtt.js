const mqtt = require("mqtt");

const brokerUrl = "mqtt://broker.hivemq.com:1883";

const client = mqtt.connect(brokerUrl);

client.on("connect", () => {
  console.log("✅ Connected to MQTT Broker");
  client.subscribe("drone/data", (err) => {
    if (!err) {
      console.log("📡 Subscribed to drone/data");
    }
  });
});

client.on("message", (topic, message) => {
  console.log("🔥 MESSAGE RECEIVED 🔥");
  console.log("Topic:", topic);
  console.log("Data:", message.toString());
});

client.on("error", (err) => {
  console.error("MQTT Error:", err);
});

module.exports = client;

