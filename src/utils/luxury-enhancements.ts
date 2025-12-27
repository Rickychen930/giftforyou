/**
 * Luxury Enhancement Utilities
 * Professional animations, effects, and interactions
 */

/**
 * Smooth scroll with easing
 */
export function smoothScrollTo(element: HTMLElement | null, offset: number = 0): void {
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

/**
 * Fade in animation utility
 */
export function fadeIn(element: HTMLElement | null, duration: number = 300): void {
  if (!element) return;
  
  element.style.opacity = "0";
  element.style.transition = `opacity ${duration}ms ease-in-out`;
  
  requestAnimationFrame(() => {
    element.style.opacity = "1";
  });
}

/**
 * Stagger animation for lists
 */
export function staggerFadeIn(
  elements: NodeListOf<HTMLElement> | HTMLElement[],
  delay: number = 50,
  duration: number = 300
): void {
  elements.forEach((el, index) => {
    setTimeout(() => {
      fadeIn(el, duration);
    }, index * delay);
  });
}

/**
 * Parallax effect for hero sections
 */
export function initParallax(element: HTMLElement | null, intensity: number = 0.5): (() => void) | null {
  if (!element) return null;
  
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * intensity;
    element.style.transform = `translateY(${rate}px)`;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}

/**
 * Intersection Observer for fade-in animations
 */
export function observeFadeIn(
  selector: string,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === "undefined" || !window.IntersectionObserver) return null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
      ...options,
    }
  );

  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => observer.observe(el));

  return observer;
}

/**
 * Ripple effect for buttons
 */
export function createRipple(event: React.MouseEvent<HTMLElement>): void {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Add loading shimmer effect
 */
export function addShimmer(element: HTMLElement | null): void {
  if (!element) return;
  element.classList.add("shimmer");
}

/**
 * Remove loading shimmer effect
 */
export function removeShimmer(element: HTMLElement | null): void {
  if (!element) return;
  element.classList.remove("shimmer");
}

/**
 * Show toast notification
 */
export function showToast(
  message: string,
  type: "success" | "error" | "info" | "warning" = "info",
  duration: number = 3000
): void {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", "polite");
  
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * Copy to clipboard with feedback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Tersalin ke clipboard", "success");
    return true;
  } catch (err) {
    showToast("Gagal menyalin", "error");
    return false;
  }
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImages(): IntersectionObserver | null {
  if (typeof window === "undefined" || !window.IntersectionObserver) return null;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: "50px",
  });

  const images = document.querySelectorAll("img[data-src]");
  images.forEach((img) => imageObserver.observe(img));

  return imageObserver;
}

/**
 * Add smooth reveal animation
 */
export function revealOnScroll(): IntersectionObserver | null {
  if (typeof window === "undefined" || !window.IntersectionObserver) return null;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -100px 0px",
  });

  const reveals = document.querySelectorAll(".reveal-on-scroll");
  reveals.forEach((el) => revealObserver.observe(el));

  return revealObserver;
}

