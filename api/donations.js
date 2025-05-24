// api/donations.js
import axios from 'axios';

export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const daToken = process.env.DA_ACCESS_TOKEN;
        
        if (!daToken) {
            return res.status(500).json({ 
                error: 'DA_ACCESS_TOKEN не найден в переменных окружения',
                items: [] 
            });
        }

        console.log('📡 Fetching donations from DonationAlerts...');
        
        const response = await axios.get('https://www.donationalerts.com/api/v1/alerts/donations', {
            headers: {
                'Authorization': `Bearer ${daToken}`,
                'Content-Type': 'application/json'
            }
        });

        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        // Обрабатываем данные как в вашем коде
        const donors = Object.values(
            response.data.data
                .filter(d => new Date(d.created_at).getTime() >= weekAgo)
                .reduce((acc, { username, amount, currency }) => {
                    const numAmount = parseFloat(amount) || 0;
                    if (!acc[username]) {
                        acc[username] = { 
                            icon: '💰', 
                            text: `${username} — ${numAmount.toFixed(0)} ${currency}`, 
                            total: numAmount 
                        };
                    } else {
                        acc[username].total += numAmount;
                        acc[username].text = `${username} — ${acc[username].total.toFixed(0)} ${currency}`;
                    }
                    return acc;
                }, {})
        ).sort((a, b) => b.total - a.total);

        console.log(`✅ Found ${donors.length} donors this week`);
        
        return res.status(200).json({ items: donors });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        return res.status(500).json({ 
            error: error.message,
            items: [
                { icon: '❌', text: 'Ошибка API DonationAlerts' },
                { icon: '🔧', text: 'Проверьте токен в настройках' }
            ]
        });
    }
}
