// pages/index.js
import { useEffect, useState } from 'react';

export default function Widget() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Обновляем данные каждые 30 секунд
    const dataInterval = setInterval(fetchData, 30000);
    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(i => (i + 1) % items.length);
      }, 6000); // Меняем каждые 6 секунд
      return () => clearInterval(interval);
    }
  }, [items]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setItems(data.items);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="widget-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="widget-container">
        <div className="no-data">Нет данных</div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <>
      <div className="widget-container">
        <div className="event-item">
          <div className="icon-container">
            {currentItem.type === 'donation' ? (
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.66 1.64 2.08 1.64 1.51 0 1.86-.79 1.86-1.28 0-.54-.2-1.13-1.64-1.45-2.06-.45-3.45-1.17-3.45-3.05 0-1.64 1.28-2.94 3.11-3.28V6h2.67v1.26c1.65.38 2.81 1.53 2.94 3.14h-1.96c-.13-.87-.57-1.46-1.68-1.46-1.17 0-1.64.64-1.64 1.17 0 .58.35.98 1.53 1.23 2.08.47 3.57 1.22 3.57 3.16 0 1.7-1.17 3.05-3.35 3.41z"/>
              </svg>
            ) : currentItem.type === 'gift' ? (
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
              </svg>
            ) : (
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                <path d="M16 1l1.26 2.75L20 5l-2 2.29L18 10l-2.74-1.25L13 10l.29-2.71L11 5l2.76-1.25z" fill="#fbbf24"/>
              </svg>
            )}
          </div>
          <div className="event-info">
            <div className="event-name">{currentItem.username}</div>
            <div className="event-detail">{currentItem.detail}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .widget-container {
          width: 400px;
          height: 80px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 15px;
          display: flex;
          align-items: center;
          padding: 15px 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .event-item {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
          animation: fadeInOut 6s ease-in-out infinite;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }

        .icon-container {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon {
          width: 30px;
          height: 30px;
          fill: #ffffff;
        }

        .event-info {
          flex: 1;
          color: #ffffff;
        }

        .event-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .event-detail {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }

        .loading, .no-data {
          color: #ffffff;
          font-size: 16px;
        }
      `}</style>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: transparent;
        }
      `}</style>
    </>
  );
}
