require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

// New Code
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { loadQAChain } = require("langchain/chains");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/generate-quiz", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const pdfPath = path.join(__dirname, req.file.path);
    const pdfBuffer = fs.readFileSync(pdfPath);

    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    const prompt = `Generate a multiple-choice quiz based on the following text (exact 15 with realistic difficulty and no markdown formatting):
        ${pdfText}. const prompt = Extract key concepts from this text and create a multiple-choice quiz with four options per question. Format the output as:
1. Question?
a. Option 1
b. Option 2
c. Option 3
d. Option 4
Answer: a`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAMfaTCNwuctebCUR6fPJJNOR74F4_pWLs`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const generatedText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const questions = extractMCQs(generatedText);

    res.json({ questions });

    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});
function extractMCQs(responseText) {
  const questions = [];
  const regex =
    /(\d+\..*?)\n(a\..*?)\n(b\..*?)\n(c\..*?)\n(d\..*?)\nAnswer:\s*(\w)/gs;

  let match;
  while ((match = regex.exec(responseText)) !== null) {
    questions.push({
      question: match[1],
      options: [match[2], match[3], match[4], match[5]],
      correctAnswer: match[6],
    });
  }
  return questions;
}

app.post("/generate-notes", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const pdfPath = path.join(__dirname, req.file.path);
    const pdfBuffer = fs.readFileSync(pdfPath);

    pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    const prompt = `Extract key points and generate concise notes in plain text format (no markdown formatting) from the following text:\n${pdfText}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAMfaTCNwuctebCUR6fPJJNOR74F4_pWLs`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    let generatedNotes =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No notes generated";

    generatedNotes = generatedNotes
      .replace(/^\s*##\s+/gm, "\n") 
      .replace(/^\s*#\s+/gm, "\n") 
      .replace(/\*\*\s+/g, "\n") 
      .replace(/\*\s+/g, "\n") 
      .trim(); 

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]); 
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;
    const maxWidth = 500; 

    const lines = wrapText(generatedNotes, font, fontSize, maxWidth);
    let y = 750;

    lines.forEach((line) => {
      if (y < margin) {
        page = pdfDoc.addPage([600, 800]);
        y = 750;
      }
      page.drawText("    " + line, { x: margin, y, size: fontSize, font });
      y -= fontSize + 5; 
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    res.json({ notes: pdfBase64 });

    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error("Error generating notes:", error);
    res.status(500).json({ error: "Failed to generate notes" });
  }
});

function wrapText(text, font, fontSize, maxWidth) {
  const lines = [];
  let currentLine = "";

  const textLines = text.split("\n");

  textLines.forEach((paragraph) => {
    const words = paragraph.split(" "); 
    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth) {
        lines.push(currentLine); 
        currentLine = word; 
      } else {
        currentLine = testLine; 
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    lines.push("");
    currentLine = ""; 
  });

  return lines;
}


// New Code
app.post("/process-pdfs", upload.array("pdfs"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No PDF files uploaded" });
    }

    let rawText = "";
    for (const file of req.files) {
      const pdfPath = path.join(__dirname, file.path);
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(pdfBuffer);
      rawText += pdfData.text;
      fs.unlinkSync(pdfPath);
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 10000,
      chunkOverlap: 1000,
    });
    const textChunks = await textSplitter.splitText(rawText);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "models/embedding-001",
      apiKey:process.env.GEMINI_API_KEY
    });
    
    const vectorStore = await HNSWLib.fromTexts(
      textChunks,
      {},
      embeddings
    );
    
    const directory = path.join(__dirname, "vector_store");
    if (!fs.existsSync(directory)){
      fs.mkdirSync(directory);
    }
    
    await vectorStore.save(directory);

    res.json({ message: "PDFs processed successfully" });
  } catch (error) {
    console.error("Error processing PDFs:", error);
    res.status(500).json({ error: "Failed to process PDFs" });
  }
});

app.post("/ask-question", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "models/embedding-001",
      apiKey:process.env.GEMINI_API_KEY,
    });
    
    const directory = path.join(__dirname, "vector_store");
    const vectorStore = await HNSWLib.load(
      directory,
      embeddings
    );
    
    const docs = await vectorStore.similaritySearch(question, 3);

    const promptTemplate = new PromptTemplate({
      template: `Answer the question as detailed as possible from the provided context. Answer in plain text format (no markdown formatting). If the answer isn't in the context, say "answer is not available in the context".\n
      Context:\n{context}\n
      Question: {question}\n
      Answer:`,
      inputVariables: ["context", "question"],
    });

    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      temperature: 0.3,
      apiKey:process.env.GEMINI_API_KEY,
      streaming:true
    });

    const chain = loadQAChain(model, {
      type: "stuff",
      prompt: promptTemplate,
    });

    const response = await chain.call({
      input_documents: docs,
      question: question,
    });

    res.json({ answer: response.text });
  } catch (error) {
    console.error("Error answering question:", error);
    res.status(500).json({ error: "Failed to answer question" });
  }
});


const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
