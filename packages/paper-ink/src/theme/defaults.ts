import type { ThemeToken, Tone } from './types.js';
const tone = (solid: string, solidHover: string, solidActive: string, subtle: string, onSubtle: string, border: string): Tone => ({ solid, solidHover, solidActive, subtle, onSubtle, border, onSolid: '#ffffff' });
export const defaultToken: ThemeToken = {
  color: {
    text: { primary: '#171717', secondary: '#404040', disabled: '#a3a3a3' },
    surface: { page: '#ffffff', container: '#ffffff', elevated: '#ffffff', muted: '#fafafa' },
    border: { default: '#525252', subtle: '#eeeeee' },
    link: { default: '#1677ff', hover: '#4096ff', active: '#0958d9' },
    primary: tone('#171717', '#404040', '#262626', '#fafafa', '#171717', '#525252'),
    success: tone('#52c41a', '#73d13d', '#389e0d', '#f6ffed', '#237804', '#b7eb8f'),
    warning: tone('#faad14', '#ffc53d', '#d48806', '#fffbe6', '#ad6800', '#ffe58f'),
    error: tone('#ff4d4f', '#ff7875', '#d9363e', '#fff2f0', '#cf1322', '#ffccc7'),
    info: tone('#1677ff', '#4096ff', '#0958d9', '#e6f4ff', '#0958d9', '#91caff'),
  },
  spacing: { small: 4, medium: 8, large: 16 },
  radius: { control: 6 }, control: { height: { small: 24, middle: 32, large: 40 } },
  font: { size: 14, family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  motion: { duration: 140 },
};
