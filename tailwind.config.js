export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                navy: {
                    DEFAULT: '#0A1628',
                    50: '#0D1E38',
                    100: '#112648',
                    200: '#152E58',
                    300: '#1A3668',
                    400: '#1E3E78',
                },
                cream: {
                    DEFAULT: '#F5F0E8',
                    50: '#FAF8F4',
                    100: '#F5F0E8',
                    200: '#E8DFD0',
                    300: '#DBCEB8',
                },
                lego: {
                    yellow: '#FFD700',
                    red: '#E3000B',
                },
                status: {
                    success: '#22C55E',
                    warning: '#F59E0B',
                    error: '#EF4444',
                },
            },
            fontFamily: {
                display: ['"Outfit"', 'system-ui', 'sans-serif'],
                body: ['"Outfit"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            fontSize: {
                hero: ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
                section: ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
            },
            boxShadow: {
                brick: '0 4px 0 0 rgba(0, 0, 0, 0.25), 0 8px 24px -4px rgba(0, 0, 0, 0.3)',
                'brick-hover': '0 6px 0 0 rgba(0, 0, 0, 0.25), 0 12px 32px -4px rgba(0, 0, 0, 0.35)',
                'glow-yellow': '0 0 20px rgba(255, 215, 0, 0.3)',
                'glow-yellow-sm': '0 0 10px rgba(255, 215, 0, 0.2)',
            },
            borderRadius: {
                brick: '6px',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
        },
    },
    plugins: [],
};
