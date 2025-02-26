let entryIntersectionObserver = new IntersectionObserver((entries, self) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.backgroundImage = entry.target.dataset.backgroundImage;
      self.unobserve(entry.target);
    }
  });
});

export default entryIntersectionObserver;