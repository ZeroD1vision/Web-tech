import socket
import time
import logging
import threading
import os
from datetime import datetime

# Настройка логирования, чтобы записывать события в файл
#logging.basicConfig(filename='server_log.txt', level=logging.INFO, format='%(asctime)s - %(message)s')
logging.basicConfig(filename='server_log.txt', 
            level=logging.INFO, 
            format='%(asctime)s - %(message)s', 
            datefmt='%Y-%m-%d %H:%M:%S',
            encoding='utf-8'
            )


def log_event(message):
    logging.info(message)


def client_processing(client_socket, addr):
    with client_socket:
        log_event("Подключен клиент: {}".format(addr))

        # Получаем сообщение от клиента
        data = client_socket.recv(1024)  # Получаем данные размером до 1024 байт
        if not data:
            return 
        message = data.decode("utf-8")  # Декодируем байты в строку в утф8
        log_event("Получено сообщение от {}: {}".format(addr, message))
        
        time.sleep(2)  # Задержка в 2 секунды

        reversed_message = message[::-1]  # Зеркалим полученную строку
        response_message = "{}. Сервер написан Нарзиевым А.Т. М3О-119БВ-24".format(reversed_message)

        client_socket.sendall(response_message.encode('utf-8'))

        log_event("Отправлено сообщение клиенту: {}".format(response_message))


def start_server(host='192.168.107.193', port=2371):
    # Создаем сокет для сервера
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind(('192.168.107.193', 2371))  # Привязываем сокет к хосту и порту
        server_socket.listen()  # Начинаем слушать входящие соединения
        log_event("Сервер запущен на {}: {}".format(host, port))
        
        while True:
            client_socket, addr = server_socket.accept()  # Принимаем подключение клиента
            
            # Создаем новый поток для обработки клиента
            client_thread = threading.Thread(target=client_processing, args=(client_socket, addr))
            client_thread.start()  # Запускаем поток
            

if __name__ == "__main__":
    start_server()  # Запускаем сервер
