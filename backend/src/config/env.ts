import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined || value === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

// Server
export const PORT = Number(process.env.PORT ?? 3001);
export const HOST = process.env.HOST ?? '0.0.0.0';
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';

// EDC Configuration
export const CONSUMER_CATALOG_QUERY_URL = requireEnv('CONSUMER_CATALOG_QUERY_URL');
export const PROVIDER_ID = requireEnv('PROVIDER_ID');
export const PROVIDER_QNA_DSP_URL = requireEnv('PROVIDER_QNA_DSP_URL');
export const API_KEY = requireEnv('API_KEY');

// CORS
export const FRONTEND_URL = requireEnv('FRONTEND_URL');
