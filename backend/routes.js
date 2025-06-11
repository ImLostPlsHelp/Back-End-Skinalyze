import {SignUpHandler, LoginHandler, GroqHandler, saveResultHandler, getScanHistoryHandler} from './handler.js';

export const routes = [
    {
        method: 'POST',
        path: '/api/signup',
        handler: SignUpHandler,
    },
    {
        method: 'POST',
        path: '/api/login',
        handler: LoginHandler,
    },
    {
        method: 'POST',
        path: '/get-groq-advice',
        handler: GroqHandler,
    },
    {
        method: 'POST',
        path: '/save-result',
        handler: saveResultHandler,
    },
    {
        method: 'GET',
        path: '/get-result',
        handler: getScanHistoryHandler,
    }
];