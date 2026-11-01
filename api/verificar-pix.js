export default async function handler(req, res) {
  const { paymentId, mpToken } = req.query;
  const accessToken = process.env.MP_ACCESS_TOKEN || mpToken;

  if (!paymentId || !accessToken) {
    return res.status(400).json({ status: 'pending' });
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    // Só retorna 'approved' quando o dinheiro realmente caiu na sua conta!
    return res.status(200).json({
      status: data.status || 'pending'
    });
  } catch (err) {
    return res.status(500).json({ status: 'pending' });
  }
}
