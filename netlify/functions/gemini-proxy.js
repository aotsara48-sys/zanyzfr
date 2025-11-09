// Importeo ny package an'i Google
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Raiso ny API Key avy amin'ny Netlify Environment Variables
// (Hojerentsika ny fomba famenoana azy any aoriana)
const apiKey = process.env.GEMINI_API_KEY;

// Raha tsy misy ny API Key dia avereno ny fahadisoana
if (!apiKey) {
  throw new Error("GEMINI_API_KEY dia tsy hita. Azafady ampidiro ao amin'ny Netlify.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Ity no "handler" function antsoin'i Netlify
exports.handler = async (event, context) => {
  
  // Hamarino fa POST request ihany no ekena
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Alao ny 'prompt' sy 'systemInstruction' avy amin'ny body
    const { prompt, systemInstruction } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Tsy misy 'prompt' nomena." }),
      };
    }

    // Fikirakirana ny modely (Ampiasao ny 1.5 Flash ho an'ny grounding)
    // Ny 'gemini-1.5-flash-latest' dia mahay mamoaka loharanom-baovao (grounding)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      // Ampio ny systemInstruction raha misy
      ...(systemInstruction && { systemInstruction: systemInstruction }),
    });

    // Fitaovana (Tools) ho an'ny fikarohana (Grounding)
    // Izany no ilaina mba hisy 'groundingMetadata' (loharanom-baovao)
    // araka ny andrasan'ny code HTML-nao
    const tools = [
      {
        "attentional_search": { "query": prompt }
      }
    ];

    // Ataovy ny antso any amin'ny Gemini API
    const result = await model.generateContent(prompt, { tools });
    
    // Ny 'result.response' no tena ahitana ny 'candidates'
    const response = result.response; 

    // Avereno ny valiny feno (JSON) mankany amin'ny frontend
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response), // Averina ilay object 'response'
    };

  } catch (error) {
    console.error("Nisy olana tamin'ny Gemini API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Nisy olana teo amin'ny server: ${error.message}` }),
    };
  }

};
