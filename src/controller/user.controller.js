import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import asyncHandler from "../.utils/asyncHandler.js";
import ApiRespose from "../.utils/apiRespose.js";
import ApiError from "../.utils/apiError.js";

import fs from "fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

  const chunks = text.split("\n\n");
  const question = req.body.question;
  const mathcedChunk =chunks.find((chunk)=> chunk.toLowerCase().includes('streamo'))
  const respose = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: `Anser the question using the context: ${mathcedChunk} and Questions is : ${question}`,
  });

  res
    .status(201)
    .json(
      new ApiRespose(
        201,
        [{ totalChunks: chunks.length,mathcedChunk, response: respose.text }],
        "file uploaded successfully",
      ),
    );
});
