const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    console.log('🤖 Testing Gemini API...\n');
    console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing');
    console.log('');

    // Try different models
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-2.0-flash'];
    
    for (const modelName of models) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hi Gemini! Say hi back briefly.');
        const response = result.response.text();
        
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ GEMINI RESPONSE (${modelName}):`);
        console.log('═══════════════════════════════════════════════════════');
        console.log(response);
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log(`🎉 Model "${modelName}" is working!`);
        return;
      } catch (err) {
        console.log(`❌ ${modelName}: ${err.message.split('\n')[0]}\n`);
      }
    }
    
    console.log('⚠️ No models available with your current API key');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testGemini();
