const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const accessToken = process.env.DONATIONALERTS_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({ error: 'Access token is not defined in environment variables' });
  }

  try {
    const response = await fetch('https://www.donationalerts.com/api/v1/alerts/donations', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'DonationAlerts API request failed',
        details: text
      });
    }

    // Если ответ валиден — распарси JSON
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected server error',
      message: err.message
    });
  }
};
