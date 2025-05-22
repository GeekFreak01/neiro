// pages/api/data.js
import axios from 'axios';
import { getTwitchToken } from '../../lib/twitchAuth';

export default async function handler(req, res) {
  try {
    // Получаем токены из переменных окружения
    const daToken = process.env.DA_ACCESS_TOKEN;
    const twitchUserId = process.env.TWITCH_USER_ID;
    const twitchClientId = process.env.TWITCH_CLIENT_ID;

    // Получаем актуальный токен Twitch
    const twitchToken = await getTwitchToken();

    // Параллельные запросы к API
    const [daRes, subsRes] = await Promise.all([
      // DonationAlerts - получаем последние донаты
      axios.get('https://www.donationalerts.com/api/v1/alerts/donations', {
        headers: { 
          Authorization: `Bearer ${daToken}` 
        },
        params: {
          page: 1,
          per_page: 50 // Получаем последние 50 донатов
        }
      }),
      // Twitch - получаем подписчиков
      axios.get(`https://api.twitch.tv/helix/subscriptions`, {
        headers: {
          'Client-ID': twitchClientId,
          Authorization: `Bearer ${twitchToken}`
        },
        params: {
          broadcaster_id: twitchUserId,
          first: 100 // Максимум 100 подписчиков
        }
      })
    ]);

    // Обрабатываем донаты за последнюю неделю
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Группируем донаты по пользователям
    const donorMap = {};
    daRes.data.data
      .filter(d => new Date(d.created_at).getTime() >= weekAgo)
      .forEach(donation => {
        const { username, amount, currency, message } = donation;
        if (!donorMap[username]) {
          donorMap[username] = {
            type: 'donation',
            username,
            total: 0,
            currency,
            lastMessage: message
          };
        }
        donorMap[username].total += parseFloat(amount);
      });

    // Преобразуем в массив и форматируем
    const donors = Object.values(donorMap)
      .map(donor => ({
        type: 'donation',
        username: donor.username,
        detail: `Донат: ${donor.total} ${donor.currency}`,
        amount: donor.total,
        sortOrder: 3
      }))
      .sort((a, b) => b.amount - a.amount);

    // Обрабатываем подписки
    const subs = subsRes.data.data || [];

    // Группируем подарочные подписки
    const giftedMap = {};
    subs
      .filter(s => s.is_gift)
      .forEach(sub => {
        const gifterName = sub.gifter_name || 'Anonymous';
        if (!giftedMap[gifterName]) {
          giftedMap[gifterName] = {
            type: 'gift',
            username: gifterName,
            count: 0
          };
        }
        giftedMap[gifterName].count += 1;
      });

    const gifted = Object.values(giftedMap)
      .map(gift => ({
        type: 'gift',
        username: gift.username,
        detail: `Подарил подписок: ${gift.count}`,
        count: gift.count,
        sortOrder: 1
      }))
      .sort((a, b) => b.count - a.count);

    // Обычные подписчики
    const regularSubs = subs
      .filter(s => !s.is_gift && s.user_id !== twitchUserId)
      .map(sub => {
        // Используем tier для определения количества месяцев, если cumulative_months недоступно
        const months = sub.cumulative_months || 
                      (sub.tier === '2000' ? 2 : sub.tier === '3000' ? 6 : 1);
        
        return {
          type: 'subscription',
          username: sub.user_name,
          detail: `Подписка: ${months} ${getMonthsText(months)}`,
          months: months,
          sortOrder: 2
        };
      })
      .sort((a, b) => b.months - a.months);

    // Объединяем все элементы
    const items = [...gifted, ...regularSubs, ...donors]
      .sort((a, b) => {
        // Сначала по типу (sortOrder), потом по значению
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return 0;
      });

    return res.status(200).json({ 
      items,
      stats: {
        totalDonors: donors.length,
        totalSubs: regularSubs.length,
        totalGifted: gifted.length
      }
    });

  } catch (error) {
    console.error('Error in /api/data:', error.response?.data || error.message);
    
    // Возвращаем тестовые данные в случае ошибки
    const testItems = [
      {
        type: 'donation',
        username: 'TestDonator',
        detail: 'Донат: 100 RUB'
      },
      {
        type: 'subscription',
        username: 'TestSubscriber',
        detail: 'Подписка: 3 месяца'
      },
      {
        type: 'gift',
        username: 'TestGifter',
        detail: 'Подарил подписок: 5'
      }
    ];

    return res.status(200).json({ 
      items: testItems,
      error: error.message,
      isTestData: true
    });
  }
}

// Вспомогательная функция для склонения слова "месяц"
function getMonthsText(months) {
  const lastDigit = months % 10;
  const lastTwoDigits = months % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'месяцев';
  }
  
  if (lastDigit === 1) {
    return 'месяц';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'месяца';
  } else {
    return 'месяцев';
  }
}
