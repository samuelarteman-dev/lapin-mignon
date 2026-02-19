import { useRef, useEffect, useCallback } from 'react';
import { drawRabbit, getHitRadius } from './drawRabbit';

export default function RabbitCanvas({ canvasRef, onStateChange }) {
  const stateRef = useRef({
    phase: 'idle',
    phaseStart: 0,
    rabbitX: 0,
    rabbitY: 0,
    targetX: 0,
    targetY: 0,
    fleeDirection: 1,
    fleeCount: 0,
    time: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stateRef.current.targetX = w / 2;
      stateRef.current.targetY = h / 2;
      if (stateRef.current.phase === 'idle') {
        stateRef.current.rabbitX = w / 2;
        stateRef.current.rabbitY = h / 2;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTimestamp = 0;
    let animId;

    const animate = (timestamp) => {
      const dt = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0;
      lastTimestamp = timestamp;

      const s = stateRef.current;
      s.time += dt;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const elapsed = (timestamp - s.phaseStart) / 1000;

      // State machine
      switch (s.phase) {
        case 'idle':
          s.rabbitX += (s.targetX - s.rabbitX) * 0.05;
          s.rabbitY += (s.targetY - s.rabbitY) * 0.05;
          break;

        case 'shock':
          if (elapsed > 0.25) {
            s.phase = 'flee';
            s.phaseStart = timestamp;
            s.fleeCount++;
            s.fleeDirection = s.fleeCount % 2 === 0 ? 1 : -1;
            if (onStateChange) onStateChange('flee');
          }
          break;

        case 'flee': {
          const speed = 12 + elapsed * 20;
          s.rabbitX += s.fleeDirection * speed;
          const outOfBounds = s.rabbitX < -120 || s.rabbitX > w + 120;
          if (elapsed > 0.8 || outOfBounds) {
            s.phase = 'return';
            s.phaseStart = timestamp;
            s.rabbitX = s.fleeDirection > 0 ? -80 : w + 80;
            s.rabbitY = s.targetY + (Math.sin(s.fleeCount) * 30);
            if (onStateChange) onStateChange('return');
          }
          break;
        }

        case 'return':
          s.rabbitX += (s.targetX - s.rabbitX) * 0.06;
          s.rabbitY += (s.targetY - s.rabbitY) * 0.06;
          if (Math.abs(s.rabbitX - s.targetX) < 1.5 && elapsed > 0.6) {
            s.phase = 'idle';
            s.phaseStart = timestamp;
            if (onStateChange) onStateChange('idle');
          }
          break;
      }

      // Determine draw state
      let drawState;
      if (s.phase === 'idle') {
        drawState = 'idle';
      } else if (s.phase === 'return' && elapsed > 0.35) {
        drawState = 'idle';
      } else if (s.phase === 'shock') {
        drawState = 'shock';
      } else {
        drawState = 'flee';
      }

      // Calculate scale
      const scale = Math.min(w / 390, h / 844) * 1.3;

      // Draw
      ctx.clearRect(0, 0, w, h);
      drawRabbit(ctx, s.rabbitX, s.rabbitY, drawState, s.time, scale);

      animId = requestAnimationFrame(animate);
    };

    stateRef.current.rabbitX = window.innerWidth / 2;
    stateRef.current.rabbitY = window.innerHeight / 2;
    stateRef.current.targetX = window.innerWidth / 2;
    stateRef.current.targetY = window.innerHeight / 2;

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, onStateChange]);

  const handleInteraction = useCallback((clientX, clientY) => {
    const s = stateRef.current;
    if (s.phase !== 'idle') return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.min(w / 390, h / 844) * 1.3;
    const hitRadius = getHitRadius(scale);

    const dx = clientX - s.rabbitX;
    const dy = clientY - s.rabbitY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= hitRadius) {
      s.phase = 'shock';
      s.phaseStart = performance.now();
      if (onStateChange) onStateChange('shock');
    }
  }, [onStateChange]);

  const handleClick = useCallback((e) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleInteraction]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      className="absolute inset-0 w-full h-full cursor-pointer"
      style={{ touchAction: 'none' }}
    />
  );
}
