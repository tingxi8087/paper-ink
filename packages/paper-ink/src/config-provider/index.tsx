import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { defaultTheme, resolveTheme } from '../theme/resolve.js';
import { themeVariables } from '../theme/variables.js';
import type { ThemeConfig } from '../theme/types.js';
const ThemeContext = createContext(defaultTheme);
export const useTheme = () => useContext(ThemeContext);
export interface ConfigProviderProps { theme?: ThemeConfig; children?: ReactNode }
export function ConfigProvider({ theme, children }: ConfigProviderProps) {
  const parent = useTheme();
  const resolved = useMemo(() => resolveTheme(parent, theme), [parent, theme]);
  return <ThemeContext.Provider value={resolved}><div className="pi-theme" style={themeVariables(resolved)}>{children}</div></ThemeContext.Provider>;
}
