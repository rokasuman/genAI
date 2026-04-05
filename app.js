import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers";

let classifier;

// Sentiment tracking
let positive = 0;
let negative = 0;

// Chart
let chart;

// Load model
async function loadModel() {
  classifier = await pipeline(
    "sentiment-analysis",
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
  );
}

// Preprocess
function preprocess(text) {
  return text.toLowerCase().replace(/<.*?>/g, "").trim();
}

// Chatbot logic
async function getResponse(text) {
  const result = await classifier(preprocess(text));

  const sentiment = result[0].label;
  const confidence = result[0].score.toFixed(4);

  // Update chart data
  if (sentiment === "POSITIVE") positive++;
  else negative++;

  updateChart();

  let reply =
    sentiment === "POSITIVE"
      ? "😊 That’s great!"
      : "😟 Sorry to hear that.";

  return { reply, sentiment, confidence };
}

// UI update
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value;

  if (!text) return;

  const chatBox = document.getElementById("chatBox");

  // User message
  chatBox.innerHTML += `<div class="message user">You: ${text}</div>`;

  // Get bot response
  const { reply, sentiment, confidence } = await getResponse(text);

  chatBox.innerHTML += `
    <div class="message bot">
      Bot: ${reply} <br>
      <small>${sentiment} (${confidence})</small>
    </div>
  `;

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Chart setup
function initChart() {
  const ctx = document.getElementById("sentimentChart");

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Positive", "Negative"],
      datasets: [{
        label: "Sentiment Count",
        data: [0, 0]
      }]
    }
  });
}

// Update chart
function updateChart() {
  chart.data.datasets[0].data = [positive, negative];
  chart.update();
}

// Event listener
document.getElementById("chatBtn").addEventListener("click", sendMessage);

// Initialize
initChart();
loadModel();