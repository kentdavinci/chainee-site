const canvas = document.querySelector("#networkCanvas");
const context = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const nodes = Array.from({ length: 42 }, (_, index) => ({
  x: 80 + ((index * 137) % 560),
  y: 56 + ((index * 89) % 410),
  radius: index % 7 === 0 ? 3.8 : 2.2,
  speed: 0.35 + (index % 5) * 0.07,
  phase: index * 0.42,
}));

function resizeCanvas() {
  const box = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(box.width * ratio));
  canvas.height = Math.max(1, Math.floor(box.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw(time = 0) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-0.34);
  context.strokeStyle = "rgba(251, 250, 245, 0.12)";
  context.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    context.beginPath();
    context.ellipse(0, 0, 82 + i * 54, 28 + i * 30, 0, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();

  context.fillStyle = "rgba(199, 255, 88, 0.92)";
  context.strokeStyle = "rgba(251, 250, 245, 0.2)";
  context.lineWidth = 1;

  const liveNodes = nodes.map((node) => {
    const drift = Math.sin(time * 0.0004 * node.speed + node.phase);
    return {
      ...node,
      x: (node.x / 720) * width + drift * 18,
      y: (node.y / 520) * height + Math.cos(time * 0.0005 * node.speed + node.phase) * 14,
    };
  });

  for (let i = 0; i < liveNodes.length; i += 1) {
    for (let j = i + 1; j < liveNodes.length; j += 1) {
      const a = liveNodes[i];
      const b = liveNodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 132) {
        context.globalAlpha = 1 - distance / 132;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
  }

  context.globalAlpha = 1;
  const coreGradient = context.createRadialGradient(width / 2, height / 2, 8, width / 2, height / 2, 115);
  coreGradient.addColorStop(0, "rgba(251, 250, 245, 0.92)");
  coreGradient.addColorStop(0.32, "rgba(199, 255, 88, 0.42)");
  coreGradient.addColorStop(1, "rgba(199, 255, 88, 0)");
  context.fillStyle = coreGradient;
  context.beginPath();
  context.arc(width / 2, height / 2, 120 + Math.sin(time * 0.001) * 8, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(199, 255, 88, 0.92)";
  liveNodes.forEach((node) => {
    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    context.fill();
  });

  context.globalAlpha = 0.2;
  context.strokeStyle = "#fbfaf5";
  for (let ring = 0; ring < 4; ring += 1) {
    context.beginPath();
    context.ellipse(width / 2, height / 2, 92 + ring * 64, 48 + ring * 38, -0.24, 0, Math.PI * 2);
    context.stroke();
  }

  context.globalAlpha = 0.5;
  context.strokeStyle = "rgba(199, 255, 88, 0.55)";
  context.beginPath();
  const sweep = (time * 0.00045) % (Math.PI * 2);
  context.arc(width / 2, height / 2, Math.min(width, height) * 0.34, sweep, sweep + Math.PI * 0.42);
  context.stroke();
  context.globalAlpha = 1;

  if (!prefersReducedMotion) {
    requestAnimationFrame(draw);
  }
}

resizeCanvas();
draw();
window.addEventListener("resize", () => {
  resizeCanvas();
  if (prefersReducedMotion) {
    draw();
  }
});
