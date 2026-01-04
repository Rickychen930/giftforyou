import React, { memo, useCallback } from "react";
import { Link } from "react-router-dom";

interface HeroSlideCTAProps {
  href: string;
  className: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

const isExternal = (href: string): boolean => /^https?:\/\//i.test(href);

/**
 * Reusable CTA component for hero slides
 * Handles both internal and external links with proper accessibility
 * Memoized for performance optimization
 */
export const HeroSlideCTA: React.FC<HeroSlideCTAProps> = memo<HeroSlideCTAProps>(({
  href,
  className,
  children,
  variant = "primary",
  onClick,
}) => {
  const isExt = isExternal(href);

  const handleClick = useCallback((e: React.MouseEvent) => {
    onClick?.();
  }, [onClick]);

  if (isExt) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${children} (opens in new tab)`}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={className} to={href} aria-label={String(children)} onClick={handleClick}>
      {children}
    </Link>
  );
}, (prevProps: HeroSlideCTAProps, nextProps: HeroSlideCTAProps) => {
  // Custom comparison for memoization
  return (
    prevProps.href === nextProps.href &&
    prevProps.className === nextProps.className &&
    prevProps.variant === nextProps.variant &&
    prevProps.children === nextProps.children &&
    prevProps.onClick === nextProps.onClick
  );
});

HeroSlideCTA.displayName = "HeroSlideCTA";

