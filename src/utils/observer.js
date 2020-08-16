export default new IntersectionObserver((entries, self) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      let img = entry.target.querySelector("img");
      img.src = img.dataset.src;
      self.unobserve(entry.target);
    }
  });
});
