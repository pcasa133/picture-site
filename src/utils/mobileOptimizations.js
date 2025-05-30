// Mobile optimization utilities

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  
  const isMobileWidth = window.innerWidth <= 768;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const result = isMobileWidth || isMobileUserAgent;
  
  // Debug logging
  console.log('Mobile detection:', { 
    width: window.innerWidth, 
    isMobileWidth, 
    isMobileUserAgent, 
    result 
  });
  
  return result;
};

export const getMobileImageLimit = () => {
  const mobile = isMobile();
  console.log('getMobileImageLimit - isMobile:', mobile);
  
  // Temporarily disable limit to debug
  return Infinity;
  
  /*
  if (!mobile) return Infinity;
  
  // Limit images based on device capabilities
  const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
  console.log('Device memory:', memory);
  
  let limit;
  if (memory <= 2) {
    limit = 15; // Low-end devices
  } else if (memory <= 4) {
    limit = 25; // Mid-range devices
  } else {
    limit = 35; // Higher-end mobile devices
  }
  
  console.log('Image limit set to:', limit);
  return limit;
  */
};

export const getMobileAnimationSettings = () => {
  if (!isMobile()) {
    return {
      enableAnimations: true,
      frameRate: 60,
      animationIntensity: 1.0
    };
  }
  
  return {
    enableAnimations: false, // Disable complex animations on mobile
    frameRate: 30,
    animationIntensity: 0.3
  };
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}; 