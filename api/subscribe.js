// api/subscribe.js
module.exports = async (req, res) => {
  // CORS (se chamar de outro domínio)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Sempre liberar CORS também no POST (útil p/ depurar)
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Em alguns projetos Vercel o req.body pode vir como string
    let body = req.body;
    if (!body || typeof body === 'string') {
      try { body = JSON.parse(body || '{}'); } catch { body = {}; }
    }

    const { email, listId, attributes } = body || {};
    if (!email || !listId) {
      return res.status(400).json({ message: 'email e listId são obrigatórios' });
    }

    // Usa fetch nativo do Node 18+/20+ (Vercel)
    const resp = await fetch('https://api.brevo.com/v3/contacts?updateEnabled=true', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY, // precisa estar definida no ambiente **Production**
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
        attributes: attributes || {}
      }),
    });

    // Alguns status de sucesso da Brevo: 201 (created) / 204 (ok sem body)
    if (resp.status === 201 || resp.status === 204) {
      return res.status(200).json({ ok: true });
    }

    // Tenta ler o body (pode não ser JSON em caso de erro infra)
    const text = await resp.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    if (json?.code === 'duplicate_parameter') {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    return res.status(resp.status).json({
      message: json?.message || text || 'Falha ao cadastrar',
      code: json?.code || null
    });
  } catch (err) {
    console.error('subscribe fatal error:', err);
    return res.status(500).json({ message: 'Erro interno' });
  }
};
