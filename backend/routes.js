import {SignUpHandler, LoginHandler, GroqHandler, saveResultHandler, getScanHistoryHandler, getUserInformation} from './handler.js';

export const routes = [
    {
        method: 'POST',
        path: '/api/signup',
        handler: SignUpHandler,
        options: {
            cors: {
                origin: ['https://capstone-dbs-skinalyze.vercel.app'],
                credentials: true,
            }
        }
    },
    {
        method: 'POST',
        path: '/api/login',
        handler: LoginHandler,
    },
    {
        method: 'POST',
        path: '/api/get-groq-advice',
        handler: GroqHandler,
    },
    {
        method: 'POST',
        path: '/api/save-result',
        handler: saveResultHandler,
    },
    {
        method: 'GET',
        path: '/api/get-result',
        handler: getScanHistoryHandler,
    },
    {
        method: 'GET',
        path: '/api/get-profile',
        handler: getUserInformation,
    }
];