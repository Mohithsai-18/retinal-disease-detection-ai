import { useEffect, useRef } from 'react';

const BiomedicalBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize Layer 1: Ambient Gradients
    const gradientNodes = [
      { x: width * 0.2, y: height * 0.3, vx: 0.2, vy: 0.1, r: Math.max(width, height) * 0.45, color: 'rgba(240, 253, 255, 0.95)' },
      { x: width * 0.8, y: height * 0.7, vx: -0.15, vy: 0.2, r: Math.max(width, height) * 0.55, color: 'rgba(207, 250, 254, 0.7)' },
      { x: width * 0.5, y: height * 0.1, vx: 0.1, vy: -0.15, r: Math.max(width, height) * 0.4, color: 'rgba(167, 243, 208, 0.25)' },
    ];

    // Initialize Layer 2: Floating Water Bubbles
    const bubbles = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height + height, // start off or at bottom
      r: Math.random() * 20 + 8,
      speedY: -(Math.random() * 0.3 + 0.15),
      swaySpeed: Math.random() * 0.006 + 0.003,
      swayAmount: Math.random() * 1.5 + 0.5,
      swayOffset: Math.random() * Math.PI * 2,
    }));

    // Initialize Layer 3: Abstract Cell Membranes
    const cells = Array.from({ length: 3 }, (_, i) => ({
      x: width * (0.25 + i * 0.25) + (Math.random() - 0.5) * 100,
      y: height * (0.3 + (i % 2) * 0.3) + (Math.random() - 0.5) * 100,
      r: Math.random() * 40 + 80,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      pulseSpeed: Math.random() * 0.001 + 0.0006,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    // Initialize Layer 4: Microscopic Particles
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: -(Math.random() * 0.25 + 0.1),
      alpha: Math.random() * 0.25 + 0.08,
      isCross: Math.random() > 0.7,
    }));

    let time = 0;

    const animate = () => {
      time += 1;
      
      // Clear canvas with base background color
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Layer 1: Ambient Gradients
      gradientNodes.forEach((node) => {
        // Move nodes slowly
        node.x += node.vx;
        node.y += node.vy;

        // Bounce nodes off screen edges
        if (node.x < -node.r * 0.2 || node.x > width + node.r * 0.2) node.vx *= -1;
        if (node.y < -node.r * 0.2 || node.y > height + node.r * 0.2) node.vy *= -1;

        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r);
        grad.addColorStop(0, node.color);
        grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // Layer 3: Abstract Cell Membranes (drawn under particles and bubbles for depth)
      cells.forEach((cell) => {
        cell.x += cell.vx;
        cell.y += cell.vy;

        // Contain cells within boundaries loosely
        if (cell.x < -cell.r) cell.x = width + cell.r;
        if (cell.x > width + cell.r) cell.x = -cell.r;
        if (cell.y < -cell.r) cell.y = height + cell.r;
        if (cell.y > height + cell.r) cell.y = -cell.r;

        ctx.beginPath();
        const numPoints = 16;
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          // Deform cell shape organically using sine waves over time
          const pulse = Math.sin(angle * 3 + time * 0.008 + cell.pulseOffset) * 6 + 
                        Math.cos(angle * 2 - time * 0.005 + cell.pulseOffset) * 4;
          const rad = cell.r + pulse;
          const px = cell.x + Math.cos(angle) * rad;
          const py = cell.y + Math.sin(angle) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(15, 118, 110, 0.022)'; // medical teal soft fill
        ctx.fill();
        ctx.strokeStyle = 'rgba(15, 118, 110, 0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Layer 4: Microscopic Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around top/bottom and sides
        if (p.y < -5) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }
        if (p.x < -5 || p.x > width + 5) p.speedX *= -1;

        if (p.isCross) {
          ctx.strokeStyle = `rgba(15, 118, 110, ${p.alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x - 2, p.y);
          ctx.lineTo(p.x + 2, p.y);
          ctx.moveTo(p.x, p.y - 2);
          ctx.lineTo(p.x, p.y + 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(20, 184, 166, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Layer 2: Floating Water Bubbles
      bubbles.forEach((b) => {
        b.y += b.speedY;
        // Sway back and forth using sine
        const sway = Math.sin(time * b.swaySpeed + b.swayOffset) * b.swayAmount;
        const currentX = b.x + sway;

        // Reset bubble to bottom when it exits top
        if (b.y < -b.r * 2) {
          b.y = height + b.r * 2;
          b.x = Math.random() * width;
        }

        // Draw soft water bubble
        ctx.strokeStyle = 'rgba(15, 118, 110, 0.1)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(currentX, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();

        // Soft highlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.beginPath();
        ctx.arc(currentX - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default BiomedicalBackground;
