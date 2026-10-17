import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost";
type Size = "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<"a">,
    keyof CommonProps | "href"
  >;

type ButtonAsButton = CommonProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    keyof CommonProps
  >;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-center leading-tight font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-light text-bg shadow-[0_0_40px_-10px_rgb(76_195_255/0.7)] hover:bg-white hover:shadow-[0_0_56px_-8px_rgb(76_195_255/0.9)]",
  ghost:
    "border border-line bg-white/[0.03] text-fg hover:border-accent/50 hover:bg-white/[0.06]",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 py-2 text-sm",
  lg: "min-h-13 px-7 py-3 text-base",
};

/** Plain anchors for protocols and external URLs; Next Link for in-app routes and hashes. */
function isExternal(href: string) {
  return /^(https?:|tel:|mailto:)/.test(href);
}

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    if (isExternal(href)) {
      return (
        <a href={href} className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
