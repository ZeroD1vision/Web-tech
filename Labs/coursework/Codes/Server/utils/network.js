const { exec } = require('child_process');
const os = require('os');

function getIp(callback) {
    let command;
    const platform = os.platform();

    if (platform === 'darwin') {
        command = 'ipconfig getifaddr en0';
    } else if (platform === 'win32') {
        command = 'ipconfig | findstr /i "IPv4"';
    } else if (platform === 'linux') {
        command = 'hostname -I | awk \'{print \\$1}\'';
    } else {
        console.error('Unknown platform: ' + platform);
        return;
    }

    exec(command, (error, stdout) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }

        // Используем регулярное выражение для извлечения IP-адреса
        let ipAddress;
        if (platform === 'win32') {
            const match = stdout.match(/(\d{1,3}\.){3}\d{1,3}/);
            ipAddress = match ? match[0] : null;
        } else {
            ipAddress = stdout.trim();
        }

        if (ipAddress) {
            console.log(`IP: ${ipAddress}`);
            callback(ipAddress);
        } else {
            console.error('Не удалось извлечь IP-адрес.');
        }
    });
}

module.exports = { getIp };
