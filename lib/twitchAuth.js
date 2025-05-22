// lib/twitchAuth.js
import axios from 'axios';

let cache = {
  access: process.env.TWITCH_ACCESS_TOKEN,
  refresh: process.env.TWITCH_REFRESH_TOKEN,
  expires: 0 // Заставляем проверить токен при первом использовании
};

/**
 * Возвращает валидный токен Twitch.
 * Если истёк — обновляет через refresh_token и кэширует.
 */
export async function getTwitchToken() {
  // Если токен ещё действителен (с запасом 60 секунд)
  if (Date.now() < cache.expires - 60000) {
    return cache.access;
  }

  try {
    // Обновляем токен
    const params = new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: cache.refresh
    });

    const { data } = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      params
    );

    // Twitch возвращает новый refresh_token при каждом обновлении
    cache = {
      access: data.access_token,
      refresh: data.refresh_token || cache.refresh,
      expires: Date.now() + (data.expires_in * 1000)
    };

    return cache.access;
  } catch (error) {
    console.error('Error refreshing Twitch token:', error.response?.data || error.message);
    
    // Если обновление не удалось, пробуем использовать существующий токен
    return cache.access;
  }
}
