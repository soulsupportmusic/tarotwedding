document.addEventListener('DOMContentLoaded', function () {
  var nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
});
