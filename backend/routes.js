import {SignUpHandler, LoginHandler, GroqHandler} from './handler.js';

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
];