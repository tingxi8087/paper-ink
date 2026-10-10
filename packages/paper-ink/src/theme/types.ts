export interface Tone {
  solid: string; solidHover: string; solidActive: string; onSolid: string;
  subtle: string; onSubtle: string; border: string;
}
export interface ThemeToken {
  color: {
    text: { primary: string; secondary: string; disabled: string };
    surface: { page: string; container: string; elevated: string; muted: string };
    border: { default: string; subtle: string };
    link: { default: string; hover: string; active: string };
    primary: Tone; success: Tone; warning: Tone; error: Tone; info: Tone;
  };
  spacing: { small: number; medium: number; large: number };
  radius: { control: number };
  control: { height: { small: number; middle: number; large: number } };
  font: { size: number; family: string };
  motion: { duration: number };
}
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
export interface ButtonToken { radius: number; paddingInline: number }
export interface InputToken { radius: number; paddingInline: number }
export interface ModalToken { radius: number; padding: number }
export interface ThemeConfig {
  token?: DeepPartial<ThemeToken>;
  components?: { Button?: Partial<ButtonToken>; Input?: Partial<InputToken>; Modal?: Partial<ModalToken> };
  inherit?: boolean;
}
export interface ResolvedTheme { token: ThemeToken; components: { Button?: Partial<ButtonToken>; Input?: Partial<InputToken>; Modal?: Partial<ModalToken> } }
