export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, name, userId, mpToken, customAmount } = req.body;
    const accessToken = process.env.MP_ACCESS_TOKEN || mpToken;

    if (!accessToken) {
      return res.status(400).json({
        error: 'Configure seu Access Token do Mercado Pago no Painel do ADM.'
      });
    }

    const finalPrice = Number(customAmount) > 0 ? Number(customAmount) : 9.90;

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `dup_${userId}_${Date.now()}`
      },
      body: JSON.stringify({
        transaction_amount: finalPrice,
        description: `Assinatura VIP 30 Dias - Da Um Play IA`,
        payment_method_id: 'pix',
        payer: {
          email: email || 'assinante@daumplayia.com.br',
          first_name: name || 'Cliente'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: 'Erro no Mercado Pago', details: data });
    }

    return res.status(200).json({
      paymentId: data.id,
      status: data.status,
      amount: finalPrice,
      qrCode: data.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64
    });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao gerar PIX', message: err.message });
  }
}
