import { ElementType } from "react";
import { cn } from "@/lib/utils";

type InstantHighlighterProps = {
  children: React.ReactNode;

  as?: ElementType;

  className?: string;

  highlightColor?: string;
} & React.HTMLAttributes<HTMLElement>;

export function InstantHighlighter({
  children,
  as: ElementTag = "span",
  className,
  highlightColor = "hsl(25, 90%, 80%)",
  ...props
}: InstantHighlighterProps) {
  const highlightStyle = {
    backgroundImage: `linear-gradient(${highlightColor}, ${highlightColor})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0% 0%",
    backgroundSize: "100% 100%",
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone",
  } as React.CSSProperties;

  return (
    <ElementTag
      {...props}
      className={cn("inline-block", className)}
      style={{ ...highlightStyle, ...props.style }}
    >
      {children}
    </ElementTag>
  );
}

