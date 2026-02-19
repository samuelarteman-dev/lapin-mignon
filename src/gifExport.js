import GIF from 'gif.js';
import { drawRabbit } from './drawRabbit';

export function exportGif() {
  const WIDTH = 390;
  const HEIGHT = 844;
  const FPS = 15;
  const DURATION = 3;
  const TOTAL_FRAMES = FPS * DURATION;

  return new Promise((resolve, reject) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = WIDTH;
    offscreen.height = HEIGHT;
    const ctx = offscreen.getContext('2d');

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: WIDTH,
      height: HEIGHT,
      workerScript: '/gif.worker.js',
      repeat: 0,
    });

    const scale = Math.min(WIDTH / 390, HEIGHT / 844) * 1.3;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const time = i / FPS;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawRabbit(ctx, centerX, centerY, 'idle', time, scale);
      gif.addFrame(ctx, { copy: true, delay: Math.round(1000 / FPS) });
    }

    gif.on('finished', (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'lapin-panique.gif';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    });

    gif.on('error', reject);
    gif.render();
  });
}

export function exportJpeg(canvas) {
  // Create a white-background copy for JPEG (no transparency)
  const w = canvas.width;
  const h = canvas.height;
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(canvas, 0, 0);

  const link = document.createElement('a');
  link.download = 'lapin-panique.jpg';
  link.href = offscreen.toDataURL('image/jpeg', 0.95);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
