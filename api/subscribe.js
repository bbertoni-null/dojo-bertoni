import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoListId = 4; 

    if (!email) {
      return res.status(400).json({ message: 'O e-mail é obrigatório.' });
    }

    const resp = await fetch('https://api.brevo.com/v3/contacts?updateEnabled=true', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey, 
      },
      body: JSON.stringify({
        email,
        listIds: [brevoListId],
      }),
    });

    if (resp.status === 201 || resp.status === 204) {
      return res.status(200).json({ ok: true });
    }

    const json = await resp.json().catch(() => ({}));
    if (json?.code === 'duplicate_parameter') {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    console.error('Brevo API Error:', json);
    return res.status(resp.status).json({ message: json?.message || 'Falha ao cadastrar. Verifique a chave da API.', code: json?.code || null });
  } catch (err) {
    console.error('Erro na requisição:', err);
    return res.status(500).json({ message: 'Erro interno. Verifique a BREVO_API_KEY.', code: null });
  }
}