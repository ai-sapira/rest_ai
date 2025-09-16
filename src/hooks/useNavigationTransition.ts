/**
 * Hook para manejar transiciones suaves en la navegación con Framer Motion
 * Mejora la UX agregando animaciones fluidas y profesionales
 */

import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export interface NavigationVariants {
  initial: any;
  animate: any;
  exit: any;
  tap?: any;
  hover?: any;
}

export const navigationVariants: NavigationVariants = {
  initial: { 
    opacity: 1, 
    scale: 1,
    y: 0 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  },
  tap: {
    scale: 0.95,
    opacity: 0.8,
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const cardVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    y: -2,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  }
};

interface UseNavigationTransitionOptions {
  delay?: number;
}

export function useNavigationTransition(options: UseNavigationTransitionOptions = {}) {
  const navigate = useNavigate();
  const { delay = 150 } = options;

  const navigateWithDelay = useCallback((to: string) => {
    setTimeout(() => {
      navigate(to);
    }, delay);
  }, [navigate, delay]);

  return {
    navigateWithDelay,
    navigate,
    navigationVariants,
    pageTransitionVariants,
    cardVariants,
  };
}

export default useNavigationTransition;
