// api/donations.js
export default async function handler(req, res) {
    // Настройка CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('🔄 API endpoint called');
        console.log('Environment variables check:');
        console.log('DA_ACCESS_TOKEN exists:', !!process.env.DA_ACCESS_TOKEN);
        
        const daToken = process.env.DA_ACCESS_TOKEN;
        
        if (!daToken) {
            console.error('❌ DA_ACCESS_TOKEN не найден');
            return res.status(500).json({ 
                error: 'DA_ACCESS_TOKEN не найден в переменных окружения. Добавьте его в настройках Vercel.',
                items: [
                    { icon: '⚠️', text: 'Токен не настроен' },
                    { icon: '🔧', text: 'Добавьте DA_ACCESS_TOKEN в Vercel' }
                ]
            });
        }

        console.log('📡 Fetching donations from DonationAlerts...');
        console.log('Token length:', daToken.length);
        
        // Используем fetch вместо axios (встроен в Node.js 18+)
        const response = await fetch('https://www.donationalerts.com/api/v1/alerts/donations?limit=20', {
            headers: {
                'Authorization': `Bearer ${daToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ DonationAlerts API error:', response.status, errorText);
            
            return res.status(500).json({
                error: `DonationAlerts API ошибка: ${response.status}`,
                items: [
                    { icon: '❌', text: `API ошибка ${response.status}` },
                    { icon: '🔑', text: 'Проверьте токен доступа' }
                ]
            });
        }

        const data = await response.json();
        console.log('✅ API data received, donations count:', data.data?.length || 0);

        if (!data.data || !Array.isArray(data.data)) {
            console.error('❌ Unexpected API response format:', data);
            return res.status(500).json({
                error: 'Неожиданный формат ответа API',
                items: [
                    { icon: '📊', text: 'Неверный формат данных' }
                ]
            });
        }

        // Фильтруем донаты за последнюю неделю
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        const donors = Object.values(
            data.data
                .filter(d => {
                    const donationDate = new Date(d.created_at);
                    return donationDate.getTime() >= weekAgo;
                })
                .reduce((acc, { username, amount, currency }) => {
                    const numAmount = parseFloat(amount) || 0;
                    const cleanUsername = username || 'Аноним';
                    
                    if (!acc[cleanUsername]) {
                        acc[cleanUsername] = { 
                            icon: '💰', 
                            text: `${cleanUsername} — ${numAmount.toFixed(0)} ${currency}`, 
                            total: numAmount 
                        };
                    } else {
                        acc[cleanUsername].total += numAmount;
                        acc[cleanUsername].text = `${cleanUsername} — ${acc[cleanUsername].total.toFixed(0)} ${currency}`;
                    }
                    return acc;
                }, {})
        ).sort((a, b) => b.total - a.total);

        console.log(`✅ Processed ${donors.length} unique donors this week`);
        
        // Если нет донатов, возвращаем информативное сообщение
        if (donors.length === 0) {
            return res.status(200).json({ 
                items: [
                    { icon: '⏳', text: 'Нет донатов за неделю' },
                    { icon: '💫', text: 'Ожидание новых донатов...' }
                ]
            });
        }
        
        return res.status(200).json({ items: donors });
        
    } catch (error) {
        console.error('❌ Server error:', error);
        return res.status(500).json({ 
            error: error.message,
            items: [
                { icon: '🚨', text: 'Ошибка сервера' },
                { icon: '🔧', text: 'Проверьте логи Vercel' }
            ]
        });
    }
}
