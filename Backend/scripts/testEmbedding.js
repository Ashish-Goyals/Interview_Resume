require("dotenv").config();
const { embedText } = require("../src/services/embedding.service");

(async () => {
  const vector = await embedText(
    "What is the difference between let and var in JavaScript?",
  );
  console.log("Embedding length:", vector.length);
  console.log("First 5 values:", vector.slice(0, 5));
})().catch((err) => {
  console.error("Embedding test failed:", err.message);
});
