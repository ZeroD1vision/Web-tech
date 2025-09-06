import { useRef, useEffect } from 'react';

const CinemaMap = () => {
  const mapRef = useRef(null);
  
  useEffect(() => {
		// Функция для загрузки скрипта
		const loadYandexMaps = () => {
			const apiKey = process.env.REACT_APP_YANDEX_API_KEY;

			if (!apiKey) {
				console.error('API ключ не найден');
    	  return;
			}

			// Проверяем, загружен ли уже скрипт
			if (window.ymaps) {
				console.log('ymaps уже загружен');
				initMaps();
				return;
			}

			// Создаём и добавляем скрипт динамически
			const script = document.createElement('script');
			script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
			script.onload = () => {
				console.log('Скрипт Яндекс.Карт загружен');
				initMaps();
			};
			script.onerror = () => console.error('Ошибка загрузки скрипта Яндекс.Карт');
			
			document.head.appendChild(script);
		};

		const initMaps = () => {
			if (window.ymaps && mapRef.current) {
				window.ymaps.ready(() => {
					// Создаём карту с гибридным типом и ночной темой
          const map = new window.ymaps.Map(mapRef.current, {
            center: [55.812580, 37.497845], // Широта, долгота (обратите внимание на порядок в Яндекс.Картах)
            zoom: 16, // Увеличил zoom для детализации
            type: 'yandex#map',
            controls: ['zoomControl', 'fullscreenControl', 'typeSelector'], // typeSelector для переключения типов
          }, {
            // Опции стилизации (ночная тема)
            suppressMapOpenBlock: true, // Убирает блок "Открыть в Яндекс.Картах"
            yandexMapDisablePoiInteractivity: false, // Включает интерактивность POI
            yandexMapAutoSwitch: false, // Отключает авто-переключение тем
            theme: 'night', // Ночная тема (доступны: 'day', 'night', 'contrast')
          });

          // Добавляем маркер с кастомной иконкой для кинотеатра
          const placemark = new window.ymaps.Placemark([55.812580, 37.497845], {
            hintContent: 'Celeston Theatre',
            balloonContent: 'Мы здесь!',
          }, {
            iconLayout: 'default#image', // Кастомная иконка
            iconImageHref: 'http://localhost:8080/favicon.ico',
            iconImageSize: [52, 48],
            iconImageOffset: [-24, -48], // Смещение для центрирования
          });
          map.geoObjects.add(placemark);
				});
			}
		};

		loadYandexMaps();
  }, []);

    
  return (
    <div 
    style={{ 
      maxWidth: '1000px',
      margin: '20px auto',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      position: 'relative',
      paddingBottom: '56.25%', // 16:9
      height: 0,
    }}
  >
    <div
      ref={mapRef}
      style={{ 
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: '10px',
      }}
    />
  </div>
  ); 
};

export default CinemaMap;