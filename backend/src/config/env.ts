import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = fs.existsSync(path.resolve(process.cwd(), '.env'))
    ? path.resolve(process.cwd(), '.env')
    : path.resolve(process.cwd(), '.env.local');

dotenv.config({ path: envPath });

function requireEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined || value === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function getEnv(name: string, defaultValue: string = ''): string {
    return process.env[name] ?? defaultValue;
}

// CORS
export const FRONTEND_URL = requireEnv('FRONTEND_URL');

// Server
export const PORT = Number(getEnv('PORT', '3000'));
export const HOST = getEnv('HOST', '0.0.0.0');
export const LOG_LEVEL = getEnv('LOG_LEVEL', 'info');

// EDC Configuration
export const CONSUMER_CATALOG_QUERY_URL = requireEnv('CONSUMER_CATALOG_QUERY_URL');
export const CONSUMER_MANAGEMENT_URL = requireEnv('CONSUMER_MANAGEMENT_URL');
export const PROVIDER_ID = getEnv('PROVIDER_ID', '');
export const PROVIDER_QNA_DSP_URL = getEnv('PROVIDER_QNA_DSP_URL', '');
export const PROVIDER_QNA_PUBLIC_API = requireEnv('PROVIDER_QNA_PUBLIC_API');
export const API_KEY = requireEnv('API_KEY');
