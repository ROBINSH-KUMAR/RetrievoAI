import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import asyncHandler from "../.utils/asyncHandler.js";
import ApiRespose from "../.utils/apiRespose.js";
import ApiError from "../.utils/apiError.js";

import fs from "fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function createEmabedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
  });

  return response.embeddings[0].values;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

export const ingestDocument = asyncHandler(async (req, res) => {
  console.log("file", req.file);

  if (!req.file || !req.file.path) {
    throw new ApiError(400, "file is required");
  }

  const dataBuffer = fs.readFileSync(req.file.path);
  const parser = new PDFParse({ data: dataBuffer });

  const pdfData = await parser.getText();
  await parser.destroy();
  const text = pdfData.text;

  const chunks = text.split("\n\n").filter((chunk) => chunk.trim() != "");
  
  const chunkEmbeddings = [];
  for (const chunk of chunks) {
    const embedding = await createEmabedding(chunk);
    chunkEmbeddings.push({
      text: chunk,
      embedding,
    });
  }

  const question = req.body.question;
  const questionEmbedding = await createEmabedding(question);
  let bestChunk = null;
  let bestScore = -Infinity;

  for (const items of chunkEmbeddings) {
    const score = cosineSimilarity(questionEmbedding, items.embedding);
    if (score > bestScore) {
      bestChunk = items.text;
      bestScore = score;
    }
  }

  console.log(bestScore)

  const respose = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: `Anser the question using the context: ${bestChunk} and Questions is : ${question}`,
  });

  res
    .status(201)
    .json(
      new ApiRespose(
        201,
        [{ totalChunks: chunks.length,  response: respose.text }],
        "file uploaded successfully",
      ),
    );
});
