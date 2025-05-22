# OBS Donation & Subscription Widget

Виджет для OBS, отображающий донаты из DonationAlerts и подписки из Twitch.

## Установка на Vercel

### 1. Подготовка файлов

Создайте новую папку для проекта и добавьте следующие файлы:
- `index.html` - основной файл виджета
- `package.json` - конфигурация проекта
- `vercel.json` - настройки Vercel

### 2. Получение токенов

#### DonationAlerts:
1. Зайдите на https://www.donationalerts.com/application/clients
2. Создайте новое приложение
3. Скопируйте токен доступа

#### Twitch:
1. Зайдите на https://dev.twitch.tv/console
2. Создайте новое приложение
3. Скопируйте Client ID
4. Сгенерируйте Access Token через https://twitchtokengenerator.com/

### 3. Развертывание на Vercel

#### Способ 1: Через GitHub
1. Создайте репозиторий на GitHub
2. Загрузите файлы проекта
3. Подключите репозиторий к Vercel
4. Нажмите Deploy

#### Способ 2: Через Vercel CLI
```bash
# Установите Vercel CLI
npm i -g vercel

# В папке проекта выполните
vercel

# Следуйте инструкциям
```

### 4. Использование виджета

После развертывания у вас будет два способа использования:

#### Способ 1: Через интерфейс настройки
1. Откройте ваш URL на Vercel
2. Введите токены в форму
3. Нажмите "Сохранить и запустить"
4. Скопируйте полный URL с параметрами

#### Способ 2: Прямая ссылка с параметрами
```
https://your-app.vercel.app/?da_token=YOUR_DA_TOKEN&twitch_client_id=YOUR_CLIENT_ID&twitch_access_token=YOUR_ACCESS_TOKEN&twitch_channel=YOUR_CHANNEL
```

### 5. Добавление в OBS

1. Добавьте источник "Браузер" в OBS
2. Вставьте URL виджета с параметрами
3. Установите размеры:
   - Ширина: 400
   - Высота: 80
4. Включите галочку "Отключить источник, когда он не виден"

## Настройки

В коде можно изменить:
- `displayDuration` - время показа события (мс)
- `minDonationAmount` - минимальная сумма доната
- Цвета и размеры в CSS

## Безопасность

⚠️ **Важно**: Никогда не показывайте URL с токенами на стриме! Используйте OBS для скрытия адресной строки браузера.

## Поддержка

- DonationAlerts API: https://www.donationalerts.com/apidoc
- Twitch API: https://dev.twitch.tv/docs/api/

## Лицензия

MIT
