/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                background: '#FAFAFA',
                kanban: {
                    todo: {
                        DEFAULT: 'rgb(148 163 184)',
                        light: 'rgb(226 232 240)',
                    },
                    doing: {
                        DEFAULT: 'rgb(59 130 246)',
                        light: 'rgb(219 234 254)',
                    },
                    impediment: {
                        DEFAULT: 'rgb(244 63 94)',
                        light: 'rgb(255 228 230)',
                    },
                    awaiting_tests: {
                        DEFAULT: 'rgb(245 158 11)',
                        light: 'rgb(254 243 199)',
                    },
                    done: {
                        DEFAULT: 'rgb(16 185 129)',
                        light: 'rgb(209 250 229)',
                    },
                },
            },
        },
    },
    plugins: [],
}
