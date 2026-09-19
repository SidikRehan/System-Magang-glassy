import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                utb: {
                    green: '#70b03c',
                    'green-hover': '#5e9632',
                    blue: '#1b68b0',
                    'blue-hover': '#15528c',
                    black: '#242222',
                    white: '#ffffff',
                    surface: '#f8fafc',
                    border: '#e2e8f0',
                },
                navy: '#0F172A',
                deepblue: '#1E3A8A',
                pblue: '#2563EB',
                lblue: '#60A5FA',
                appbg: '#F8FAFC',
            }
        },
    },

    plugins: [forms],
};
