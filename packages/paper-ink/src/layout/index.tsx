import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useTheme } from "../config-provider/index.js";
import { themeVariables } from "../theme/variables.js";
import { ChevronDownIcon } from "../internal/icons.js";
export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  hasSider?: boolean;
}
export interface SiderProps extends HTMLAttributes<HTMLElement> {
  width?: number | string;
  collapsedWidth?: number | string;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  trigger?: ReactNode;
  reverseArrow?: boolean;
  theme?: "light" | "dark";
  breakpoint?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  onCollapse?: (
    collapsed: boolean,
    type: "clickTrigger" | "responsive",
  ) => void;
  onBreakpoint?: (broken: boolean) => void;
}
const breakpoints = { xs: 480, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600 };
const Sider = forwardRef<HTMLElement, SiderProps>(function Sider(
  {
    width = 200,
    collapsedWidth = 64,
    collapsible = false,
    collapsed,
    defaultCollapsed = false,
    trigger,
    reverseArrow = false,
    theme: color = "light",
    breakpoint,
    onCollapse,
    onBreakpoint,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const [inner, setInner] = useState(defaultCollapsed);
  const closed = collapsed ?? inner;
  const latest = useRef({ collapsed, onCollapse, onBreakpoint });
  latest.current = { collapsed, onCollapse, onBreakpoint };
  useEffect(() => {
    if (!breakpoint || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(
      `(max-width: ${breakpoints[breakpoint] - 0.02}px)`,
    );
    const update = () => {
      latest.current.onBreakpoint?.(media.matches);
      if (latest.current.collapsed === undefined) setInner(media.matches);
      latest.current.onCollapse?.(media.matches, "responsive");
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [breakpoint]);
  const zero =
    closed &&
    (collapsedWidth === 0 ||
      collapsedWidth === "0" ||
      collapsedWidth === "0px");
  return (
    <aside
      {...rest}
      ref={ref}
      className={[
        "pi-layout__sider",
        `pi-layout__sider--${color}`,
        closed && "pi-layout__sider--collapsed",
        zero && "pi-layout__sider--zero",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...themeVariables(theme),
        width: closed ? collapsedWidth : width,
        ...style,
      }}
    >
      <div className="pi-layout__sider-content" hidden={zero}>
        {children}
      </div>
      {collapsible && trigger !== null && (
        <button
          type="button"
          className="pi-layout__trigger"
          aria-label={closed ? "展开侧栏" : "折叠侧栏"}
          aria-expanded={!closed}
          onClick={() => {
            if (collapsed === undefined) setInner(!closed);
            onCollapse?.(!closed, "clickTrigger");
          }}
        >
          {trigger ?? (
            <ChevronDownIcon
              style={{
                transform: `rotate(${closed !== reverseArrow ? -90 : 90}deg)`,
              }}
            />
          )}
        </button>
      )}
    </aside>
  );
});
const Header = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Header({ className, ...props }, ref) {
    return (
      <header
        {...props}
        ref={ref}
        className={["pi-layout__header", className].filter(Boolean).join(" ")}
      />
    );
  },
);
const Content = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Content({ className, ...props }, ref) {
    return (
      <main
        {...props}
        ref={ref}
        className={["pi-layout__content", className].filter(Boolean).join(" ")}
      />
    );
  },
);
const Footer = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Footer({ className, ...props }, ref) {
    return (
      <footer
        {...props}
        ref={ref}
        className={["pi-layout__footer", className].filter(Boolean).join(" ")}
      />
    );
  },
);
const Root = forwardRef<HTMLDivElement, LayoutProps>(function Layout(
  { hasSider, className, style, children, ...rest },
  ref,
) {
  const theme = useTheme();
  const sided =
    hasSider ??
    Children.toArray(children).some(
      (child) => isValidElement(child) && child.type === Sider,
    );
  return (
    <div
      {...rest}
      ref={ref}
      className={["pi-layout", sided && "pi-layout--has-sider", className]
        .filter(Boolean)
        .join(" ")}
      style={{ ...themeVariables(theme), ...style }}
    >
      {children}
    </div>
  );
});
export const Layout = Object.assign(Root, { Header, Content, Footer, Sider });
