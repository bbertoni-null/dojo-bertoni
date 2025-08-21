import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, listId } = req.body;

  // Adicionar e-mail ao Brevo
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoListId = process.env.BREVO_LIST_ID;
  const brevoData = {
    email,
    listIds: [Number(brevoListId)],
    updateEnabled: true,
  };

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
    const errorData = await brevoResponse.json();
    return res.status(brevoResponse.status).json({ ok: false, message: errorData.message });
  }
};