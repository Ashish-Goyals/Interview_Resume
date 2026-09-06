const mongoose = require("mongoose");

const knowledgeChunkSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["qa", "prep_doc"],
      required: true,
    },
    role: {
      type: String,
      default: "general",
    },
    topic: {
      type: String,
      default: "general",
    },
    source: {
      type: String,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
