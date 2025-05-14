import { defineConfig } from 'cypress';
import * as fs from 'fs';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables del archivo .env

const SECRET_KEY = process.env.SECRET_KEY; // Usar la variable desde el archivo .env

if (!SECRET_KEY) {
  throw new Error("❌ Error: SECRET_KEY no está definida. Verifica tu archivo .env");
}

function decryptEnvVariables() {
  const envPath = './cypress.env.enc';
  if (fs.existsSync(envPath)) {
    const encryptedData = fs.readFileSync(envPath, 'utf-8');
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  }
  return {};
}

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const decryptedEnv = decryptEnvVariables();
      config.env = { ...config.env, ...decryptedEnv };
      return config;
    },
    experimentalStudio: true,
    baseUrl: 'http://localhost:3000',
  },
});
