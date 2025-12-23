import Groq from "groq-sdk"
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API
});

export async function aiReport(summaryText) {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are a cybersecurity assistant. Your job is to explain scan results using ONLY the data provided.

RULES:
1. NEVER guess or invent data
2. If scan shows open ports, list EXACTLY what's shown
3. If scan shows NO open ports, say "No open ports found"
4. Use simple, beginner-friendly language
5. Format with clear sections and bullet points
6. Base all analysis ONLY on the provided scan data
7. If data is missing, say "Data not available" instead of guessing

IMPORTANT: Look at the "ACTUAL SCAN DATA" section and use ONLY that information.`
                },
                {
                    role: "user",
                    content: summaryText
                }
            ],
            temperature: 0.3,  // Lower temperature = less creative, more factual
            max_tokens: 800
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("AI Report Error:", error);
        return "ERROR: Could not generate AI analysis. Please check the raw scan results below.\n\n" + summaryText;
    }
}