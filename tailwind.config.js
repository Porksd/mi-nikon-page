/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                nikon: {
                    yellow: "#f2c10d",
                    black: "#181611",
                    dark: "#221e10",
                    surface: "#27251b",
                    text: "#bab39c",
                    border: "#393528"
                }
            },
            fontFamily: {
                sans: ["Open Sans", "sans-serif"],
                display: ["Space Grotesk", "sans-serif"],
                serif: ["Newsreader", "serif"],
            }
        }
    },
    plugins: [],
}
