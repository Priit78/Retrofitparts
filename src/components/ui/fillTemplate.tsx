import { Fragment, type ReactNode } from "react";

/**
 * Replaces `{name}` placeholders in a copy string. Values may be strings or React nodes
 * (for example a mailto link), so copy stays in content files while facts and links come
 * from site.ts. Unknown placeholders are left as they are.
 */
export function fillTemplate(template: string, values: Record<string, ReactNode>): ReactNode {
  const parts = template.split(/(\{\w+\})/g);
  return parts.map((part, index) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    const value = key !== undefined && key in values ? values[key] : part;
    return <Fragment key={index}>{value}</Fragment>;
  });
}

/** Plain-text version, for attributes and JSON-LD. */
export function fillText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
