require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/database");
const KnowledgeChunk = require("../src/models/knowledgeChunk.model");
const { embedBatch } = require("../src/services/embedding.service");

const interviewQA = require("../src/data/knowledge/interviewQA.json");
const prepDocs = require("../src/data/knowledge/prepDocs.json");

const MAX_CHUNK_CHARS = 800;

function chunkText(text, maxChars = MAX_CHUNK_CHARS) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > maxChars && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

function buildQaRecords() {
  return interviewQA.map((item) => ({
    text: `Q: ${item.question}\nA: ${item.answer}`,
    type: "qa",
    role: item.role,
    topic: item.topic,
    source: "interviewQA.json",
  }));
}

function buildPrepDocRecords() {
  const records = [];
  for (const doc of prepDocs) {
    const chunks = chunkText(doc.content);
    chunks.forEach((chunk, i) => {
      records.push({
        text: `${doc.title} (part ${i + 1}/${chunks.length}):\n${chunk}`,
        type: "prep_doc",
        role: doc.role,
        topic: doc.topic,
        source: doc.title,
      });
    });
  }
  return records;
}

async function run() {
  const shouldReset = process.argv.includes("--reset");

  await connectDB();

  if (shouldReset) {
    const { deletedCount } = await KnowledgeChunk.deleteMany({});
    console.log(`Cleared ${deletedCount} existing knowledge chunks.`);
  }

  const records = [...buildQaRecords(), ...buildPrepDocRecords()];
  console.log(`Embedding ${records.length} chunks...`);

  const embeddings = await embedBatch(records.map((r) => r.text));

  const docsToInsert = records.map((record, i) => ({
    ...record,
    embedding: embeddings[i],
  }));

  await KnowledgeChunk.insertMany(docsToInsert);

  console.log(`Inserted ${docsToInsert.length} knowledge chunks.`);
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
