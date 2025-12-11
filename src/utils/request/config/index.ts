let BASE_URL: string;

const TIME_OUT = window.TIME_OUT;
switch (import.meta.env.MODE) {
    case 'development':
        BASE_URL = window.BASE_URL.devUrl;
        break;
    case 'production':
        BASE_URL = window.BASE_URL.prodUrl;
        break;
    case 'test':
        BASE_URL = window.BASE_URL.testUrl;
        break;
    default:
        BASE_URL = '';
        break;
}
console.log(import.meta.env.MODE);

export { BASE_URL, TIME_OUT };
