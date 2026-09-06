const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

async function embedText(text) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });

  const values = response?.embeddings?.[0]?.values;

  if (!values) {
    throw new Error("embedText: unexpected response shape from embedding API");
  }

  return values;
}

async function embedBatch(texts) {
  const embeddings = [];
  for (const text of texts) {
    embeddings.push(await embedText(text));
  }
  return embeddings;
}

module.exports = {
  embedText,
  embedBatch,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
};
