const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

client.on("connect", () => {
  console.log("Connected to broker");

const droneData = {
  "altitude": 72,
  "speed": 38,
  "heading": "NE",
  "temp": 49,
  "wind": "Light",
  "battery": 71,
  "signal": "Strong",
  "status": "En Route",
  "lat": 19.092,
  "lng": 72.831,
  "victim": {
    "detected": true,
    "bodyTemp": 36.9,
    "confidence": 94,
    "lat": 19.0758,
    "lng": 72.8772
  }

};

client.publish("drone/data", JSON.stringify(droneData));
  console.log("JSON data sent");
});




