const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/donations', async (req, res) => {
    try {
        const { access_token } = req.body;
        
        console.log('📡 Fetching donations from DonationAlerts...');
        
        const response = await axios.get('https://www.donationalerts.com/api/v1/alerts/donations', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        // Обрабатываем данные как в вашем коде
        const donors = Object.values(
            response.data.data
                .filter(d => new Date(d.created_at).getTime() >= weekAgo)
                .reduce((acc, { username, amount, currency }) => {
                    if (!acc[username]) {
                        acc[username] = { 
                            icon: '💰', 
                            text: `${username} — ${amount} ${currency}`, 
                            total: parseFloat(amount) 
                        };
                    } else {
                        acc[username].total += parseFloat(amount);
                        acc[username].text = `${username} — ${acc[username].total} ${currency}`;
                    }
                    return acc;
                }, {})
        ).sort((a, b) => b.total - a.total);

        console.log(`✅ Found ${donors.length} donors this week`);
        
        res.json({ items: donors });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message, items: [] });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});
