const taglines = [
  "Urban Planning Reimagined",
  "The Social Network of Cities",
  "Blockchain Infrastructure for Growth",
  "Education & Simulation for the Future"
];

let index = 0;
const tagline = document.getElementById("tagline");

function showNextTagline() {
  tagline.classList.remove("show");
  setTimeout(() => {
    tagline.textContent = taglines[index];
    tagline.classList.add("show");
    index = (index + 1) % taglines.length;
  }, 1000);
}

showNextTagline();
setInterval(showNextTagline, 8000);
