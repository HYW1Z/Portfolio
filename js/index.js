const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav__link");

navToggle.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
  });
});

// ── Scroll reveal animation ──
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ── Particle canvas background ──
(function () {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height, particles, mouseX, mouseY;
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 150;
  const MOUSE_RADIUS = 180;

  function resize() {
    const section = canvas.parentElement;
    width = canvas.width = section.offsetWidth;
    height = canvas.height = section.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1,
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse repulsion
      if (mouseX !== undefined) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(167, 139, 250, 0.5)";
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  canvas.parentElement.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener("mouseleave", () => {
    mouseX = undefined;
    mouseY = undefined;
  });

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  animate();
})();

// ── C++ Terminal typing animation ──
(function () {
  const output = document.getElementById("terminal-output");
  if (!output) return;

  // Each line: { text (with HTML spans), delay before this line starts }
  const lines = [
    { html: '<span class="prompt">$</span> <span class="cmd">g++ portfolio.cpp -o ginam</span>', charDelay: 35 },
    { html: '<span class="prompt">$</span> <span class="cmd">./ginam</span>', charDelay: 50 },
    { html: '<span class="comment">// Loading portfolio...</span>', charDelay: 30 },
    { html: '', pause: 400 },
    { html: '<span class="keyword">std</span><span class="operator">::</span><span class="keyword">cout</span> <span class="operator">&lt;&lt;</span> <span class="string">"Hi, I am"</span> <span class="operator">&lt;&lt;</span> <span class="keyword">std</span><span class="operator">::</span><span class="keyword">endl</span>;', charDelay: 25 },
    { html: '<span class="output">Hi, I am</span>', charDelay: 0, instant: true },
    { html: '<span class="output-name">Ginam Park</span>', charDelay: 0, instant: true },
    { html: '', pause: 300 },
    { html: '<span class="comment">// Game Developer</span>', charDelay: 40 },
  ];

  let lineIdx = 0;

  function typeLine(lineObj, callback) {
    const lineEl = document.createElement("div");
    lineEl.classList.add("line");
    output.appendChild(lineEl);

    // Pure pause line
    if (lineObj.pause) {
      setTimeout(callback, lineObj.pause);
      return;
    }

    // Instant reveal (for output lines)
    if (lineObj.instant) {
      lineEl.innerHTML = lineObj.html;
      setTimeout(callback, 350);
      return;
    }

    // Typing effect: we need the plain text to type out, but final result is HTML
    // Strategy: reveal the full HTML but use a character counter on the visible text
    const temp = document.createElement("div");
    temp.innerHTML = lineObj.html;
    const plainText = temp.textContent;
    const fullHtml = lineObj.html;
    const delay = lineObj.charDelay || 35;

    let charIdx = 0;
    const cursor = document.createElement("span");
    cursor.classList.add("terminal__cursor");

    function typeNext() {
      if (charIdx <= plainText.length) {
        // Show progressively: use substring approach on visible text
        // We reveal the full HTML once all characters are "typed"
        if (charIdx === plainText.length) {
          lineEl.innerHTML = fullHtml;
          if (cursor.parentNode) cursor.remove();
        } else {
          // Show partial plain text + cursor
          lineEl.textContent = plainText.substring(0, charIdx);
          lineEl.appendChild(cursor);
        }
        charIdx++;
        setTimeout(typeNext, delay);
      } else {
        // Final: show proper HTML
        lineEl.innerHTML = fullHtml;
        setTimeout(callback, 200);
      }
    }

    typeNext();
  }

  function nextLine() {
    if (lineIdx < lines.length) {
      typeLine(lines[lineIdx], () => {
        lineIdx++;
        nextLine();
      });
    } else {
      // Add final blinking cursor
      const cursorLine = document.createElement("div");
      cursorLine.classList.add("line");
      cursorLine.innerHTML = '<span class="prompt">$</span> <span class="terminal__cursor"></span>';
      output.appendChild(cursorLine);
    }
  }

  // Start after a short delay
  setTimeout(nextLine, 600);
})();

// ── iframe focus helper ──
document.addEventListener("DOMContentLoaded", function () {
  const iframe = document.getElementById("demo");
  if (!iframe) return;
  iframe.addEventListener("load", function () {
    try {
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.addEventListener("mousedown", function () {
        iframe.contentWindow.Module.canvas.focus();
      });
    } catch (e) {
      console.error(e);
    }
  });
});