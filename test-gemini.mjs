import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  const apiKey = "INVALID_API_KEY_123456";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" }); // or gemini-1.5-flash
  
  const geminiHistory = [
    { role: "user", parts: [{ text: "Hello" }] },
    { role: "model", parts: [{ text: "Hi" }] }
  ];
  
  try {
    const chat = model.startChat({ history: geminiHistory });
    console.log("Sending message...");
    const result = await chat.sendMessage("Testing again");
    console.log("Success! Response:");
    console.log(result.response.text());
  } catch (err) {
    console.error("Failed with error:");
    console.error(err);
  }
}

test();
