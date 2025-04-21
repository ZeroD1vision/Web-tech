document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalTrailer = document.getElementById('modal-trailer');

    // Получаем все карточки фильмов
    const movieCards = document.querySelectorAll('.movie-card');

    movieCards.forEach(card => {
        card.addEventListener('click', () => {
            const movieId = card.getAttribute('data-id');
            const movie = movies.find(m => m.id == movieId); // Найдите фильм по ID

            // Заполняем модальное окно данными о фильме
            modalTitle.textContent = movie.title;
            modalDescription.textContent = movie.description;
            modalTrailer.src = `https://www.youtube.com/embed/${movie.trailerId}`;

            modal.style.display = 'block'; // Показываем модальное окно
        });
    });

    closeModal.onclick = () => {
        modal.style.display = 'none'; // Закрываем модальное окно
        modalTrailer.src = ''; // Очищаем источник видео при закрытии
    };

    // Закрытие модального окна при клике вне его
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'; // Закрываем модальное окно
            modalTrailer.src = ''; // Очищаем источник видео при закрытии
        }
    };
});
