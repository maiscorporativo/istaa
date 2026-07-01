const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');

router.post('/generate', authenticateToken, async (req, res) => {
  const { 
    language, 
    contactName, 
    orgName,
    event, 
    dateFrom, 
    dateTo, 
    pax, 
    accommodation, 
    tickets, 
    transfer 
  } = req.body;

  if (!language || !orgName || !event) {
    return res.status(400).json({ error: 'Faltam parâmetros obrigatórios (Idioma, Organização, Evento).' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY não configurada no servidor.' });
  }

  const prompt = `
Write a highly professional B2B email requesting a quote from a sports travel agency/supplier.
The email must be clear, direct, and contain NO placeholders (do not include things like "[Your Name]" or "[Company]").
Generate ONLY the email body. Do not include a Subject line. End the email with a professional sign-off in the target language (e.g., "Best regards,") followed by a blank space.

CRITICAL INSTRUCTION: You MUST write the ENTIRE email in this exact language: ${language}.
Do NOT write in Portuguese unless Portuguese is the requested language.

EMAIL DATA TO INCLUDE:
- Recipient/Contact: ${contactName ? contactName : 'Team ' + orgName}
- Event/Sport of Interest: ${event}
- Number of Passengers (Pax): ${pax || 'To be defined'}
- Start Date: ${dateFrom ? new Date(dateFrom).toLocaleDateString('pt-BR') : 'To be defined'}
- End Date: ${dateTo ? new Date(dateTo).toLocaleDateString('pt-BR') : 'To be defined'}
- Accommodation Preference: ${accommodation && accommodation !== 'Nenhuma' ? accommodation : 'No accommodation needed'}
- Ticket Preference: ${tickets && tickets !== 'Nenhum' ? tickets : 'Tickets to be defined'}
- Transfer Needed: ${transfer ? 'Yes, we need airport/event transfers' : 'No transfers needed'}

Task: Write the fluent business email requesting availability and pricing for the package above in ${language}.
  `.trim();

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `You are a highly skilled professional B2B travel and sports agent. You MUST reply ONLY in ${language}.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return res.status(response.status).json({ error: 'Erro ao gerar cotação na IA.' });
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';

    res.json({ text: generatedText });
  } catch (err) {
    console.error('Groq Execution Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
