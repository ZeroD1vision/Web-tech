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


class Log {
    public:
        std::string timeConn;
        std::string timeRecv;
        std::string timeSend;
        std::string timeClose;
        std::string addr;
        std::string dataRecv;
        std::string dataSend;
    
        void PrintLog() const {
            std::ofstream logFile("client_log.txt", std::ios_base::app);
            if (logFile.is_open()) {
                logFile << "Адрес сервера:       "      << addr     << '\n';
                logFile << "Подключение к серверу: "    << timeConn << '\n';
                logFile << "Отправлено сообщение: "     << timeSend << '\n';
                logFile << "Отправленное сообщение:\n " << dataSend << '\n';
                logFile << "Получение ответа:    "      << timeRecv << '\n';
                logFile << "Полученное сообщение:\n"    << dataRecv << '\n';
                logFile << "Завершение сеанса:   "      << timeClose << "\n\n\n\n";
                logFile.close();
            }
        }
    };


std::string getCurrentTime() {
    time_t now = time(0);
    std::string timeStr = ctime(&now);
    return timeStr.substr(0, timeStr.length() - 1); // Удаляем символ новой строки
}


/**
 * Функция для записи события в лог-файл.
 *
 * @param message Сообщение, которое будет записано в лог.
 */
/***************************************************************
void logEvent(const std::string& message) {
    std::ofstream logFile("client_log.txt", std::ios_base::app);
    if (logFile.is_open()) {
        time_t now = time(0);
        char* dt = ctime(&now);
        dt[strlen(dt) - 1] = '\0'; // Удаляем символ новой строки
        logFile << dt << " - " << message << std::endl;
        logFile.close();
    }
}**************************************************************/

void logEvent(Log& log, const std::string& message, const std::string& time) {
    log.dataSend = message; // Устанавливаем отправляемое сообщение
    log.timeSend = time;    // Устанавливаем время отправки
}

/**
 * Основная функция клиента.
 *
 * Эта функция отвечает за инициализацию Winsock, создание сокета,
 * подключение к серверу, отправку сообщения и получение ответа.
 *
 * @return Код завершения программы.
 */
int main() {
    WSADATA wsaData;                                 // Структура для хранения версии Winsock и используемых протоколах
    Log myLog;                                       // Создаем объект класса Log

    // Инициализация Winsock
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) { // Используем версию 2.2 Winsock 
        logEvent(myLog, "Ошибка инициализации Winsock", getCurrentTime());
        return 1;
    }

    // Загрузка конфигурации
    std::string serverAddress = "127.0.0.1"; // IP-адрес умолчанию
    int serverPort = 65432;                  // Порт по умолчанию

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
        logEvent(myLog, "Не удалось открыть файл конфигурации. Используются настройки по умолчанию.", getCurrentTime());
    }//куда мы запишем это. Как происходит запись в функцию

    myLog.addr = serverAddress; // Устанавливаем адрес для лога

    // Создание сокета
    SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == INVALID_SOCKET) {
        logEvent(myLog, "Ошибка создания сокета: " + std::to_string(WSAGetLastError()), getCurrentTime());
        WSACleanup();
        return 1;
    }

    sockaddr_in server;                                          // Структура, содержит информацию о сервере, к которому присоединяемся    
    server.sin_family = AF_INET;                                 // Указываем, что используем IPv4
    server.sin_port = htons(serverPort);                         // Преобразуем порт в сетевой порядок байтов
    server.sin_addr.s_addr = inet_addr(serverAddress.c_str());   // Преобразуем строку IP-адреса в формат, используемый в sockaddr_in
    //inet_pton(AF_INET, serverAddress.c_str(), &server.sin_addr);

    if (server.sin_addr.s_addr == INADDR_NONE) {
        logEvent(myLog, "Некорректный IP-адрес: " + serverAddress, getCurrentTime());
        closesocket(sock);
        WSACleanup();
        return 1;
    }

    // Устанавливаем время подключения
    myLog.timeConn = getCurrentTime();

    /**
    * Подключение к серверу.
    *  
    * Программа пытается установить соединение с сервером с помощью функции connect(). Если подключение не удалось, 
    * записывается сообщение об ошибке, сокет закрывается, и программа завершает выполнение.
    */
    if (connect(sock, (struct sockaddr*)&server, sizeof(server)) == SOCKET_ERROR) {
        logEvent(myLog, "Ошибка подключения к серверу: " + 
                 std::to_string(WSAGetLastError()), getCurrentTime());
        closesocket(sock);
        WSACleanup();
        return 1;
    }

    // Логируем успешное подключение
    logEvent(myLog, "Подключение к серверу " + serverAddress + ":" + std::to_string(serverPort), getCurrentTime());
    
    // Формирование сообщения
    std::string fio = "Нарзиев Артемий Тимурович";
    std::string group = "М3О-119БВ-24";
    std::string message = fio + ", " + group;

    // Задержка перед отправкой
    Sleep(2000);

    // Устанавливаем время отправки и сохраняем сообщение
    myLog.timeSend = getCurrentTime();
    myLog.dataSend = message;

    // Отправка сообщения
    logEvent(myLog, "Отправка сообщения: " + message, getCurrentTime());
    int bytesSent = send(sock, message.c_str(), message.length(), 0);
    if (bytesSent == SOCKET_ERROR) {
        logEvent("Ошибка отправки сообщения: " + std::to_string(WSAGetLastError()));
        closesocket(sock);
        WSACleanup();
        return 1;
    }

    // Выводим время отправки и сообщение
    logEvent(myLog, "Сообщение отправлено: " + message, myLog.timeSend);

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
        myLog.dataRecv = std::string(buffer, bytesReceived);
        myLog.timeRecv = getCurrentTime(); // Устанавливаем время получения
        logEvent(myLog, "Сообщение получено: " + myLog.dataRecv, myLog.timeRecv);
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
