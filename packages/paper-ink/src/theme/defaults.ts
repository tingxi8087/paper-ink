import type { ThemeToken, Tone } from './types.js';
const tone = (solid: string, solidHover: string, solidActive: string, subtle: string, onSubtle: string, border: string): Tone => ({ solid, solidHover, solidActive, subtle, onSubtle, border, onSolid: '#ffffff' });
export const defaultToken: ThemeToken = {
  color: {
    text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3' },
    surface: { page: '#ffffff', container: '#ffffff', elevated: '#ffffff', muted: '#f5f5f5' },
    border: { default: '#d4d4d4', subtle: '#e5e5e5' },
    primary: tone('#171717', '#404040', '#262626', '#f5f5f5', '#171717', '#a3a3a3'),
    success: tone('#52c41a', '#73d13d', '#389e0d', '#f6ffed', '#237804', '#b7eb8f'),
    warning: tone('#faad14', '#ffc53d', '#d48806', '#fffbe6', '#ad6800', '#ffe58f'),
    error: tone('#ff4d4f', '#ff7875', '#d9363e', '#fff2f0', '#cf1322', '#ffccc7'),
    info: tone('#1677ff', '#4096ff', '#0958d9', '#e6f4ff', '#0958d9', '#91caff'),
  },
  radius: { control: 6 }, control: { height: { small: 24, middle: 32, large: 40 } },
  font: { size: 14, family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  motion: { duration: 140 },
};
