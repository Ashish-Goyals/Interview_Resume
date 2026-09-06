require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/database");
const {
  retrieveRelevantContext,
  formatContextForPrompt,
} = require("../src/services/rag.service");

(async () => {
  await connectDB();

  const query = `Job Title: Junior MERN Stack Developer
  We need someone strong in React, Node.js, Express, and MongoDB, with REST API experience.`;

  const results = await retrieveRelevantContext(query, { topK: 5 });

  console.log(`Got ${results.length} results:\n`);
  results.forEach((r) =>
    console.log(
      `- [score ${r.score.toFixed(3)}] (${r.type}/${r.topic}) ${r.text.slice(0, 80)}...`,
    ),
  );

  console.log("\n--- Formatted for prompt ---\n");
  console.log(formatContextForPrompt(results));

  await mongoose.connection.close();
})().catch((err) => {
  console.error("Retrieval test failed:", err.message);
  process.exit(1);
});
