const PINK = '#FFB6C1';
const DARK_PINK = '#FF91A4';
const LIGHT_PINK = '#FFD6E0';
const WHITE = '#FFFFFF';
const DARK = '#4A4A4A';
const BLUSH = 'rgba(255, 130, 160, 0.35)';

export function drawRabbit(ctx, x, y, state, time, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Animation parameters
  let bounceY, earAngleL, earAngleR, legOffset, bodySquash;

  if (state === 'idle') {
    bounceY = Math.sin(time * 3) * 4;
    earAngleL = Math.sin(time * 2.5) * 0.08;
    earAngleR = Math.sin(time * 2.5 + 0.5) * 0.08;
    legOffset = Math.sin(time * 5) * 3;
    bodySquash = 1 + Math.sin(time * 3) * 0.03;
  } else if (state === 'shock') {
    bounceY = -20;
    earAngleL = 0.4;
    earAngleR = -0.4;
    legOffset = 0;
    bodySquash = 1.15;
  } else {
    // flee / panic
    bounceY = Math.sin(time * 20) * 3;
    earAngleL = -0.5 + Math.sin(time * 15) * 0.15;
    earAngleR = -0.5 + Math.sin(time * 15 + 1) * 0.15;
    legOffset = Math.sin(time * 25) * 10;
    bodySquash = 0.92;
  }

  ctx.translate(0, bounceY);

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.beginPath();
  ctx.ellipse(0, 62 - bounceY, 32 * bodySquash, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail (behind body)
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(0, 38, 9, 0, Math.PI * 2);
  ctx.fill();

  // Back legs
  drawLeg(ctx, -16, 48, -legOffset);
  drawLeg(ctx, 16, 48, legOffset);

  // Body
  ctx.save();
  ctx.scale(bodySquash, 2 - bodySquash);
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.ellipse(0, 15 / (2 - bodySquash), 40, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly highlight
  ctx.fillStyle = LIGHT_PINK;
  ctx.beginPath();
  ctx.ellipse(0, 22 / (2 - bodySquash), 26, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front paws
  drawPaw(ctx, -26, 44, legOffset * 0.6);
  drawPaw(ctx, 26, 44, -legOffset * 0.6);

  // Head
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.arc(0, -25, 32, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  drawEar(ctx, -14, -50, earAngleL - 0.1);
  drawEar(ctx, 14, -50, -earAngleR + 0.1);

  // Face
  if (state === 'idle') {
    drawIdleFace(ctx, time);
  } else {
    drawPanicFace(ctx, time);
  }

  // Cheeks (blush)
  ctx.fillStyle = BLUSH;
  ctx.beginPath();
  ctx.arc(-22, -18, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, -18, 9, 0, Math.PI * 2);
  ctx.fill();

  // Speed lines during flee
  if (state === 'flee') {
    drawSpeedLines(ctx, time);
  }

  ctx.restore();
}

function drawEar(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Outer ear
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.ellipse(0, -28, 12, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner ear
  ctx.fillStyle = DARK_PINK;
  ctx.beginPath();
  ctx.ellipse(0, -26, 7, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawLeg(ctx, x, y, offset) {
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.ellipse(x, y + offset, 11, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Paw pad
  ctx.fillStyle = DARK_PINK;
  ctx.beginPath();
  ctx.ellipse(x, y + offset + 9, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPaw(ctx, x, y, offset) {
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.ellipse(x, y + offset, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small pad
  ctx.fillStyle = DARK_PINK;
  ctx.beginPath();
  ctx.ellipse(x, y + offset + 3, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawIdleFace(ctx, time) {
  const blink = Math.cos(time * 0.8) > 0.97;

  if (blink) {
    // Blink - closed eyes
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-18, -28);
    ctx.lineTo(-8, -28);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(8, -28);
    ctx.lineTo(18, -28);
    ctx.stroke();
  } else {
    // Happy half-closed eyes (upward arcs = happy expression)
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Left eye
    ctx.beginPath();
    ctx.arc(-13, -26, 6, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Right eye
    ctx.beginPath();
    ctx.arc(13, -26, 6, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Small highlight dots
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(-11, -30, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, -30, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose
  ctx.fillStyle = DARK_PINK;
  ctx.beginPath();
  ctx.moveTo(0, -19);
  ctx.lineTo(-4, -14);
  ctx.lineTo(4, -14);
  ctx.closePath();
  ctx.fill();

  // Mouth - gentle smile
  ctx.strokeStyle = DARK;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -11);
  ctx.quadraticCurveTo(0, -7, 5, -11);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = 'rgba(180, 140, 150, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-32, -18);
  ctx.lineTo(-18, -16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-30, -12);
  ctx.lineTo(-18, -13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(32, -18);
  ctx.lineTo(18, -16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(30, -12);
  ctx.lineTo(18, -13);
  ctx.stroke();
}

function drawPanicFace(ctx, time) {
  // Wide terrified eyes
  const jitterX = Math.sin(time * 30) * 2;
  const jitterY = Math.cos(time * 25) * 2;

  // Left eye - white sclera
  ctx.fillStyle = WHITE;
  ctx.strokeStyle = DARK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-13, -28, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Left pupil (tiny, jittering)
  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.arc(-13 + jitterX, -28 + jitterY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Left eye highlight
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(-10 + jitterX * 0.3, -32 + jitterY * 0.3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Right eye - white sclera
  ctx.fillStyle = WHITE;
  ctx.strokeStyle = DARK;
  ctx.beginPath();
  ctx.arc(13, -28, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right pupil
  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.arc(13 + jitterX, -28 + jitterY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Right eye highlight
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(16 + jitterX * 0.3, -32 + jitterY * 0.3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows (stressed)
  ctx.strokeStyle = DARK;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-20, -42);
  ctx.lineTo(-8, -38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, -42);
  ctx.lineTo(8, -38);
  ctx.stroke();

  // Nose
  ctx.fillStyle = DARK_PINK;
  ctx.beginPath();
  ctx.moveTo(0, -19);
  ctx.lineTo(-4, -14);
  ctx.lineTo(4, -14);
  ctx.closePath();
  ctx.fill();

  // Mouth - wide open scream
  ctx.fillStyle = '#FF7B7B';
  ctx.strokeStyle = DARK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, -6, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tongue
  ctx.fillStyle = '#FF9999';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 4, 0, 0, Math.PI);
  ctx.fill();

  // Sweat drops
  ctx.fillStyle = 'rgba(120, 200, 255, 0.6)';
  const sweatPhase = Math.sin(time * 8) * 4;
  // Left sweat
  ctx.beginPath();
  ctx.moveTo(-28, -40 + sweatPhase);
  ctx.quadraticCurveTo(-31, -33 + sweatPhase, -28, -30 + sweatPhase);
  ctx.quadraticCurveTo(-25, -33 + sweatPhase, -28, -40 + sweatPhase);
  ctx.fill();
  // Right sweat
  ctx.beginPath();
  ctx.moveTo(30, -36 + sweatPhase * 0.8);
  ctx.quadraticCurveTo(33, -29 + sweatPhase * 0.8, 30, -26 + sweatPhase * 0.8);
  ctx.quadraticCurveTo(27, -29 + sweatPhase * 0.8, 30, -36 + sweatPhase * 0.8);
  ctx.fill();

  // Whiskers (frazzled)
  ctx.strokeStyle = 'rgba(180, 140, 150, 0.5)';
  ctx.lineWidth = 1;
  const wh = Math.sin(time * 12) * 3;
  ctx.beginPath();
  ctx.moveTo(-34, -18 + wh);
  ctx.lineTo(-18, -14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-32, -10 + wh);
  ctx.lineTo(-18, -11);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(34, -18 - wh);
  ctx.lineTo(18, -14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(32, -10 - wh);
  ctx.lineTo(18, -11);
  ctx.stroke();
}

function drawSpeedLines(ctx, time) {
  ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  for (let i = 0; i < 6; i++) {
    const y = -50 + i * 22 + Math.sin(time * 10 + i * 1.7) * 5;
    const startX = 55 + Math.sin(time * 8 + i * 2.3) * 8;
    const length = 18 + Math.sin(time * 12 + i * 0.9) * 8;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + length, y);
    ctx.stroke();

    // Mirror on left side
    ctx.beginPath();
    ctx.moveTo(-startX, y);
    ctx.lineTo(-startX - length, y);
    ctx.stroke();
  }
}

export function getHitRadius(scale) {
  return 75 * scale;
}
