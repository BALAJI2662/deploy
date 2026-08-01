/**
 * Theme tokens are full oklch colors (see src/index.css), not channel triplets.
 * Wrapping them in color-mix keeps Tailwind's `/<opacity>` modifiers working —
 * without it Tailwind cannot parse the value and silently drops utilities like
 * `bg-primary/10`.
 */
const token = (name) =>
    `color-mix(in oklab, var(${name}) calc(<alpha-value> * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            boxShadow: {
                input: '0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                background: token('--background'),
                foreground: token('--foreground'),
                card: {
                    DEFAULT: token('--card'),
                    foreground: token('--card-foreground')
                },
                popover: {
                    DEFAULT: token('--popover'),
                    foreground: token('--popover-foreground')
                },
                primary: {
                    DEFAULT: token('--primary'),
                    foreground: token('--primary-foreground')
                },
                secondary: {
                    DEFAULT: token('--secondary'),
                    foreground: token('--secondary-foreground')
                },
                muted: {
                    DEFAULT: token('--muted'),
                    foreground: token('--muted-foreground')
                },
                accent: {
                    DEFAULT: token('--accent'),
                    foreground: token('--accent-foreground')
                },
                destructive: {
                    DEFAULT: token('--destructive'),
                    foreground: token('--destructive-foreground')
                },
                border: token('--border'),
                input: token('--input'),
                ring: token('--ring'),
                sidebar: {
                    DEFAULT: token('--sidebar'),
                    foreground: token('--sidebar-foreground'),
                    primary: token('--sidebar-primary'),
                    'primary-foreground': token('--sidebar-primary-foreground'),
                    accent: token('--sidebar-accent'),
                    'accent-foreground': token('--sidebar-accent-foreground'),
                    border: token('--sidebar-border'),
                    ring: token('--sidebar-ring'),
                    muted: token('--sidebar-muted')
                },
                success: {
                    DEFAULT: token('--success'),
                    foreground: token('--success-foreground')
                },
                warning: {
                    DEFAULT: token('--warning'),
                    foreground: token('--warning-foreground')
                },
                info: {
                    DEFAULT: token('--info'),
                    foreground: token('--info-foreground')
                },
                chart: {
                    '1': token('--chart-1'),
                    '2': token('--chart-2'),
                    '3': token('--chart-3'),
                    '4': token('--chart-4'),
                    '5': token('--chart-5')
                }
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.no-scrollbar': {
                    '::-webkit-scrollbar': { display: 'none' },
                    '-ms-overflow-style': 'none', // IE and Edge
                    'scrollbar-width': 'none',    // Firefox
                },
            });
        },
    ],
};
