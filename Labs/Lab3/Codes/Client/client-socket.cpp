#include <iostream>
#include <fstream>
#include <cstring>
#include <sstream>
#include <ctime>
#ifdef __GNUC__
    #define _WIN32_WINNT 0x0501
#endif
#include <winsock2.h>
#include <ws2tcpip.h>

#pragma comment(lib, "ws2_32.lib") // Подключение библиотеки Winsock

/****************************************************************************
 * Функция для записи события в лог-файл.
 *
 * @param message Сообщение, которое будет записано в лог.
 ***************************************************************************/
void logEvent(const std::string& message) {
    std::ofstream logFile("client_log.txt", std::ios_base::app);
    if (logFile.is_open()) {
        time_t now = time(0);
        char* dt = ctime(&now);
        dt[strlen(dt) - 1] = '\0'; // Удаляем символ новой строки
        logFile << dt << " - " << message << std::endl;
        logFile.close();
    }
}

/**************************************************************************
 * Основная функция клиента.
 *
 * Эта функция отвечает за инициализацию Winsock, создание сокета,
 * подключение к серверу, отправку сообщения и получение ответа.
 *
 * @return Код завершения программы.
 **************************************************************************/
int main() {
    // Инициализация Winsock
    WSADATA wsaData;                                 // Структура для хранения версии Winsock и используемых протоколах
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) { // Используем версию 2.2 Winsock 
        logEvent("Ошибка инициализации Winsock");
        return 1;
    }

    // Загрузка конфигурации
    std::string serverAddress = "127.0.0.1"; // IP-адрес умолчанию
    int serverPort = 2371;                  // Порт по умолчанию

    // Чтение конфигурации из файла
    std::ifstream configFile("config.txt");
    if (configFile.is_open()) {
        std::string line;
        while (std::getline(configFile, line)) {
            std::istringstream configStream(line);
            std::string key;
            if (configStream >> key) {
                if (key == "ip_address") {
                    configStream >> serverAddress; // Чтение IP-адреса
                } else if (key == "port") {
                    configStream >> serverPort; // Чтение порта
                }
            }
        }
        configFile.close();
    } else {
        logEvent("Не удалось открыть файл конфигурации. Используются настройки по умолчанию.");
    }

    // Создание сокета
    SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == INVALID_SOCKET) {
        logEvent("Ошибка создания сокета: " + 
            std::to_string(WSAGetLastError()));
        WSACleanup();
        return 1;
    }

    sockaddr_in server;                                          // Структура, содержит информацию о сервере, к которому присоединяемся    
    server.sin_family = AF_INET;                                 // Указываем, что используем IPv4
    server.sin_port = htons(serverPort);                         // Преобразуем порт в сетевой порядок байтов
    server.sin_addr.s_addr = inet_addr(serverAddress.c_str());   // Преобразуем строку IP-адреса в формат, используемый в sockaddr_in
    //inet_pton(AF_INET, serverAddress.c_str(), &server.sin_addr);

    if (server.sin_addr.s_addr == INADDR_NONE) {
        logEvent("Некорректный IP-адрес: " + serverAddress);
        closesocket(sock);
        WSACleanup();
        return 1;
    }
    /**
    * Подключение к серверу.
    *  
    * Программа пытается установить соединение с сервером с помощью функции connect(). Если подключение не удалось, 
    * записывается сообщение об ошибке, сокет закрывается, и программа завершает выполнение.
    */
    if (connect(sock, (struct sockaddr*)&server, sizeof(server)) == SOCKET_ERROR) {
        logEvent("Ошибка подключения к серверу " + serverAddress + ":" + 
            std::to_string(serverPort) + " - " + std::to_string(WSAGetLastError()));
        closesocket(sock);
        WSACleanup();
        return 1;
    }
    logEvent("Подключение к серверу " + serverAddress + ":" + std::to_string(serverPort));

    // Формирование сообщения
    std::string fio = "Нарзиев Артемий Тимурович";
    std::string group = "М3О-119БВ-24";
    std::string message = fio + ", " + group;

    // Задержка перед отправкой
    Sleep(2000);

    // Отправка сообщения
    logEvent("Отправка сообщения: " + message);
    int bytesSent = send(sock, message.c_str(), message.length(), 0);
    if (bytesSent == SOCKET_ERROR) {
        logEvent("Ошибка отправки сообщения: " + std::to_string(WSAGetLastError()));
        closesocket(sock);
        WSACleanup();
        return 1;
    }

    /**
    * Ожидание ответа от сервера и обработка полученных данных.
    * 
    * Если данные получены, они записываются в лог. Если произошла ошибка,
    * записывается сообщение об ошибке. Если сервер закрыл соединение,
    * также записывается соответствующее сообщение.
    */
    char buffer[1024] = {0};
    int bytesReceived = recv(sock, buffer, sizeof(buffer) - 1, 0);
    
    if (bytesReceived > 0) {
        buffer[bytesReceived] = '\0';
        logEvent("Получено сообщение от сервера: " + std::string(buffer));
    } else if (bytesReceived == SOCKET_ERROR) {
        logEvent("Ошибка получения сообщения от сервера: " + std::to_string(WSAGetLastError()));
    } else {
        logEvent("Соединение закрыто сервером");
    }

    // Закрытие соединения
    closesocket(sock);

    //std::cout << "Vse OK" << std::endl; // Проверка компиляции
    WSACleanup(); // Освобождение ресурсов Winsock
    logEvent("Соединение закрыто");

    return 0;
}
