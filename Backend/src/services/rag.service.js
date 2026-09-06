const KnowledgeChunk = require("../models/knowledgeChunk.model");
const { embedText } = require("./embedding.service");

const VECTOR_INDEX_NAME = "knowledge_vector_index";

async function retrieveRelevantContext(query, { topK = 6, types } = {}) {
  const queryEmbedding = await embedText(query);

  const pipeline = [
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: Math.max(topK * 15, 150),
        limit: topK,
        ...(types && types.length ? { filter: { type: { $in: types } } } : {}),
      },
    },
    {
      $project: {
        _id: 0,
        text: 1,
        type: 1,
        role: 1,
        topic: 1,
        source: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ];

  return KnowledgeChunk.aggregate(pipeline);
}

function formatContextForPrompt(chunks) {
  if (!chunks || !chunks.length) return "";

  return chunks
    .map((c, i) => {
      const label = c.type === "qa" ? "Sample Q&A" : "Prep Guide";
      return `[${i + 1}] (${label} | topic: ${c.topic} | role: ${c.role})\n${c.text}`;
    })
    .join("\n\n");
}

module.exports = {
  retrieveRelevantContext,
  formatContextForPrompt,
  VECTOR_INDEX_NAME,
};
