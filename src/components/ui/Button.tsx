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
  "inline-flex items-center justify-center gap-2 rounded-[2px] text-center leading-tight font-semibold transition-[background-color,border-color,color,transform] duration-300 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-light text-bg hover:bg-soft",
  ghost:
    "border border-fg/35 text-fg hover:border-fg/70 hover:bg-fg/[0.04]",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 py-2 text-sm",
  lg: "min-h-[46px] px-6 py-3 text-[15px]",
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
