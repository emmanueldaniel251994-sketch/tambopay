import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { violetbrand: '#7900d9', orangebrand: '#ff9b22' } } }, plugins: [] };
export default config;
