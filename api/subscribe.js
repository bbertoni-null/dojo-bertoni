import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoListId = 4; // Valor fixo

  const brevoData = {
    email,
    listIds: [brevoListId],
    updateEnabled: true,
  };

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(brevoData)
    });

    if (brevoResponse.ok) {
      return res.status(200).json({ ok: true, duplicate: brevoResponse.status === 201 });
    } else {
      const errorData = await brevoResponse.json().catch(() => ({}));
      return res.status(brevoResponse.status).json({ ok: false, message: errorData.message || 'Erro desconhecido da API do Brevo' });
    }
  } catch (err) {
    console.error('Erro na requisição da API do Brevo:', err);
    return res.status(500).json({ ok: false, message: 'Erro de conexão ou requisição. Verifique a BREVO_API_KEY.' });
  }
};