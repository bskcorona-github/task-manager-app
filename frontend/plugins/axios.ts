// frontend/plugins/axios.ts
import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:3001/api', // APIのベースURL
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // プロパティを提供
    nuxtApp.provide('axios', axiosInstance);
});
