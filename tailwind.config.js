const colors = require('tailwindcss/colors');

const gray = {
    50: 'rgb(186, 186, 227)',
    100: 'rgb(169, 169, 209)',
    200: 'rgb(163, 163, 204)',
    300: 'rgb(145, 145, 184)',
    400: 'rgb(105, 105, 145)',
    500: 'rgb(91, 91, 128)',
    600: 'rgb(54, 54, 84)',
    700: 'rgb(31, 32, 51)',
    800: 'rgb(23, 23, 37)',
    900: 'rgb(14, 14, 23)',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#0E0E17',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                blue: colors.orange,
                primary: colors.orange,
                gray: gray,
                neutral: gray,
                cyan: colors.amber,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
