import { buildApp } from './app.js';
import { HOST, PORT } from './config/env.js';

async function start() {
    const app = await buildApp();

    try {
        const port = PORT;
        const host = HOST;

        await app.listen({ port, host });

        console.log(`Server listening at ${host}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

void start();
