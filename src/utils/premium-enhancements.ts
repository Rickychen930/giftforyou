/**
 * Premium Enhancement Utilities
 * Advanced animations, effects, and interactions for luxury experience
 */

/**
 * Advanced parallax with multiple layers
 */
export function initAdvancedParallax(
  container: HTMLElement | null,
  layers: { selector: string; speed: number }[]
): (() => void) | null {
  if (!container) return null;

  const elements = layers.map((layer) => ({
    element: container.querySelector<HTMLElement>(layer.selector),
    speed: layer.speed,
  })).filter((item) => item.element !== null);

  if (elements.length === 0) return null;

  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    elements.forEach(({ element, speed }) => {
      if (element) {
        const rate = scrolled * speed;
        element.style.transform = `translateY(${rate}px)`;
      }
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}

/**
 * Magnetic button effect - follows cursor
 */
export function initMagneticButton(
  button: HTMLElement | null,
  strength: number = 0.3
): (() => void) | null {
  if (!button) return null;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = () => {
    button.style.transform = "translate(0, 0)";
  };

  button.addEventListener("mousemove", handleMouseMove);
  button.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    button.removeEventListener("mousemove", handleMouseMove);
    button.removeEventListener("mouseleave", handleMouseLeave);
    button.style.transform = "translate(0, 0)";
  };
}

/**
 * Smooth number counter animation
 */
export function animateNumber(
  element: HTMLElement | null,
  target: number,
  duration: number = 2000,
  formatter?: (n: number) => string
): void {
  if (!element) return;

  const start = 0;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);

    element.textContent = formatter ? formatter(current) : current.toString();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = formatter ? formatter(target) : target.toString();
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Advanced reveal on scroll with multiple effects
 */
export function observeAdvancedReveal(
  selector: string,
  options?: {
    threshold?: number;
    rootMargin?: string;
    animationType?: "fade" | "slide" | "scale" | "blur";
    stagger?: number;
  }
): IntersectionObserver | null {
  if (typeof window === "undefined" || !window.IntersectionObserver) return null;

  const {
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    animationType = "fade",
    stagger = 0,
  } = options || {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            const target = entry.target as HTMLElement;
            
            switch (animationType) {
              case "fade":
                target.classList.add("fade-in-visible");
                break;
              case "slide":
                target.classList.add("slide-in-up", "visible");
                break;
              case "scale":
                target.classList.add("scale-in-visible");
                break;
              case "blur":
                target.classList.add("blur-reveal-visible");
                break;
            }
            
            observer.unobserve(target);
          }, index * stagger);
        }
      });
    },
    { threshold, rootMargin }
  );

  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const element = el as HTMLElement;
    switch (animationType) {
      case "fade":
        element.classList.add("fade-in");
        break;
      case "slide":
        element.classList.add("slide-in-up");
        break;
      case "scale":
        element.classList.add("scale-in");
        break;
      case "blur":
        element.classList.add("blur-reveal");
        break;
    }
    observer.observe(element);
  });

  return observer;
}

/**
 * Floating animation for decorative elements
 */
export function initFloatingAnimation(
  element: HTMLElement | null,
  options?: {
    duration?: number;
    distance?: number;
    delay?: number;
  }
): void {
  if (!element) return;

  const {
    duration = 3000,
    distance = 20,
    delay = 0,
  } = options || {};

  element.style.animation = `float ${duration}ms ease-in-out infinite`;
  element.style.animationDelay = `${delay}ms`;
  element.style.setProperty("--float-distance", `${distance}px`);
}

/**
 * Cursor follower effect
 */
export function initCursorFollower(
  element: HTMLElement | null,
  options?: {
    size?: number;
    color?: string;
    blur?: number;
  }
): (() => void) | null {
  if (!element) return null;

  const {
    size = 200,
    color = "rgba(212, 140, 156, 0.1)",
    blur = 40,
  } = options || {};

  const follower = document.createElement("div");
  follower.style.cssText = `
    position: fixed;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    filter: blur(${blur}px);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease-out;
    opacity: 0;
  `;
  document.body.appendChild(follower);

  let isVisible = false;

  const handleMouseMove = (e: MouseEvent) => {
    if (!isVisible) {
      follower.style.opacity = "1";
      isVisible = true;
    }
    follower.style.left = `${e.clientX}px`;
    follower.style.top = `${e.clientY}px`;
  };

  const handleMouseLeave = () => {
    follower.style.opacity = "0";
    isVisible = false;
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseleave", handleMouseLeave);
    follower.remove();
  };
}

/**
 * Text reveal animation
 */
export function initTextReveal(
  element: HTMLElement | null,
  options?: {
    delay?: number;
    duration?: number;
    stagger?: number;
  }
): void {
  if (!element) return;

  const {
    delay = 0,
    duration = 600,
    stagger = 50,
  } = options || {};

  const text = element.textContent || "";
  const words = text.split(" ");
  
  element.innerHTML = words
    .map((word, i) => `<span class="word-reveal" style="opacity: 0; transition: opacity ${duration}ms ease ${delay + i * stagger}ms">${word}</span>`)
    .join(" ");

  setTimeout(() => {
    const words = element.querySelectorAll(".word-reveal");
    words.forEach((word) => {
      (word as HTMLElement).style.opacity = "1";
    });
  }, 100);
}

/**
 * Gradient animation for backgrounds
 */
export function initGradientAnimation(
  element: HTMLElement | null,
  colors: string[],
  duration: number = 10000
): void {
  if (!element) return;

  const gradient = colors.join(", ");
  element.style.background = `linear-gradient(135deg, ${gradient})`;
  element.style.backgroundSize = "200% 200%";
  element.style.animation = `gradient-shift ${duration}ms ease infinite`;
}

/**
 * 3D tilt effect on hover
 */
export function init3DTilt(
  element: HTMLElement | null,
  options?: {
    maxTilt?: number;
    perspective?: number;
  }
): (() => void) | null {
  if (!element) return null;

  const {
    maxTilt = 15,
    perspective = 1000,
  } = options || {};

  element.style.transformStyle = "preserve-3d";
  element.style.perspective = `${perspective}px`;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    element.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    element.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  };

  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseleave", handleMouseLeave);
    element.style.transform = "";
  };
}

