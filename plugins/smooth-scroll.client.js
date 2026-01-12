// plugins/smooth-scroll.client.js
export default defineNuxtPlugin(() => {
  // Enable smooth scrolling and scroll snapping globally
  if (process.client) {
    // Set CSS scroll-behavior and scroll-snap on html element
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.scrollSnapType = 'y proximity'; // Use proximity for optional snapping

    // Optional: Add custom smooth scroll for anchor links
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;

      e.preventDefault();
      const id = target.getAttribute('href').slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    // Attach to document for all anchor clicks
    document.addEventListener('click', handleAnchorClick);
  }
});