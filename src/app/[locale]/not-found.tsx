"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { monoLabel } from "@/components/ui/styles";
import { common } from "@/content/common";
import { defaultLocale, isLocale, localePath } from "@/lib/i18n";

// not-found receives no params, so the locale comes from the URL.
export default function NotFound() {
  const segment = usePathname()?.split("/")[1] ?? "";
  const locale = isLocale(segment) ? segment : defaultLocale;

  return (
    <Container className="flex min-h-[70svh] flex-col items-start justify-center gap-6 pt-24">
      <p className={monoLabel}>404</p>
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{common.notFoundTitle[locale]}</h1>
      <p className="max-w-xl text-muted">{common.notFoundBody[locale]}</p>
      <Button href={localePath(locale)}>{common.backHome[locale]}</Button>
    </Container>
  );
}
