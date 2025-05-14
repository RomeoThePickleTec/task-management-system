// encrypt-env.js
require('dotenv').config(); // Cargar variables de entorno desde .env
const fs = require('fs');
const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.SECRET_KEY; // Leer clave desde .env

if (!SECRET_KEY) {
    console.error("❌ Error: SECRET_KEY no está definida. Verifica el archivo .env");
    process.exit(1);
}

const envData = {
    CYPRESS_API_KEY: process.env.CYPRESS_API_KEY,
};

const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(envData), SECRET_KEY).toString();
fs.writeFileSync('./cypress.env.enc', encryptedData, 'utf-8');

console.log("✅ Archivo cypress.env.enc generado exitosamente.");
