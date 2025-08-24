#include <iostream>
#include <fstream>
#include <cstring>
#include <sstream>
#include <ctime>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cerrno> // Добавляем для errno
#include <netdb.h> // Добавляем для gethostbyname

using namespace std;

/****************************************************************************
 * Функция для записи события в лог-файл.
 *
 * @param message Сообщение, которое будет записано в лог.
 ***************************************************************************/
void logEvent(const std::string& message) {
    // Создаем директорию, если её нет
    system("mkdir -p /logs");
    
    std::ofstream logFile("/logs/client_log.txt", std::ios_base::app);
    if (logFile.is_open()) {
        time_t now = time(0);
        char* dt = ctime(&now);
        dt[strlen(dt) - 1] = '\0';
        logFile << dt << " - " << message << std::endl;
        logFile.close();
    } else {
        // Добавляем вывод ошибки в консоль
        std::cerr << "Ошибка открытия файла логов!" << std::endl;
    }
}

/**************************************************************************
 * Основная функция клиента.
 *
 * Эта функция отвечает за создание сокета,
 * подключение к серверу, отправку сообщения и получение ответа.
 *
 * @return Код завершения программы.
 **************************************************************************/
int main() {
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
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        logEvent("Ошибка создания сокета: " + string(strerror(errno)));
        return 1;
    }

    sockaddr_in server;                                          // Структура, содержит информацию о сервере, к которому присоединяемся    
    memset(&server, 0, sizeof(server)); // Обнуляем структуру
    server.sin_family = AF_INET;
    server.sin_port = htons(serverPort);

    // DNS-разрешение имени
    logEvent("Разрешение имени: " + serverAddress);
    struct hostent *he = gethostbyname(serverAddress.c_str());
    if (he == NULL) {
        logEvent("Ошибка разрешения имени: " + string(hstrerror(h_errno)));
        close(sock);
        return 1;
    }
    
    memcpy(&server.sin_addr, he->h_addr_list[0], he->h_length);
    char ip[INET_ADDRSTRLEN];
    inet_ntop(AF_INET, &server.sin_addr, ip, INET_ADDRSTRLEN);
    logEvent("Преобразованное имя: " + serverAddress + " -> " + ip);


    logEvent("Попытка подключения к " + serverAddress + ":" + std::to_string(serverPort));

    // Подключение к серверу
    if (connect(sock, (struct sockaddr*)&server, sizeof(server)) < 0) {
        logEvent("Ошибка подключения: " + string(strerror(errno)));
        close(sock);
        return 1;
    }
    logEvent("Подключение к серверу " + serverAddress + ":" + std::to_string(serverPort));

    // Формирование сообщения
    std::string fio = "Нарзиев Артемий Тимурович";
    std::string group = "М3О-119БВ-24";
    std::string message = fio + ", " + group;

    // Задержка перед отправкой
    sleep(2); // Заменяем Sleep на sleep для Linux

    // Отправка сообщения
    logEvent("Отправка сообщения: " + message);
    int bytesSent = send(sock, message.c_str(), message.length(), 0);
    if (bytesSent < 0) {
        logEvent("Ошибка отправки сообщения: " + std::to_string(errno));
        close(sock);
        return 1;
    }

    // Ожидание ответа от сервера и обработка полученных данных.
    char buffer[1024] = {0}; // Буфер для хранения сообщения
    int bytesReceived = recv(sock, buffer, sizeof(buffer) - 1, 0);
    
    if (bytesReceived > 0) {
        buffer[bytesReceived] = '\0';
        logEvent("Получено сообщение от сервера: " + std::string(buffer));
    } else if (bytesReceived < 0) {
        logEvent("Ошибка получения сообщения от сервера: " + std::to_string(errno));
    } else {
        logEvent("Соединение закрыто сервером");
    }

    // Закрытие соединения
    close(sock);
    logEvent("Соединение закрыто");

    return 0;
}
