import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Preflight CORS (se acessar de outro domain)
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
    const { email, listId } = req.body || {};
    if (!email || !listId) {
      return res.status(400).json({ message: 'email e listId são obrigatórios' });
    }

    const resp = await fetch('https://api.brevo.com/v3/contacts?updateEnabled=true', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY, // variável de ambiente na Vercel
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
      }),
    });

    if (resp.status === 201 || resp.status === 204) {
      return res.status(200).json({ ok: true });
    }

    const json = await resp.json().catch(() => ({}));
    if (json?.code === 'duplicate_parameter') {
      // Já existe — tratamos como sucesso
      return res.status(200).json({ ok: true, duplicate: true });
    }

    return res.status(resp.status).json({ message: json?.message || 'Falha ao cadastrar', code: json?.code || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno' });
  }
}