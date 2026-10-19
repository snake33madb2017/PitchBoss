import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  state: 'idle' | 'ai_speaking' | 'user_listening' | 'processing';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Executive corporate monochrome + champagne gold palette
      let baseColor = 'rgba(161, 161, 170, '; // Zinc-400 (idle)
      let waveCount = 3;
      let amplitudeMultiplier = 1;

      if (state === 'ai_speaking') {
        baseColor = 'rgba(212, 175, 55, '; // Champagne Gold (AI PitchBoss speaking)
        waveCount = 5;
        amplitudeMultiplier = 2.4;
      } else if (state === 'user_listening') {
        baseColor = 'rgba(250, 250, 250, '; // Pure Platinum / Crisp White (User speaking)
        waveCount = 4;
        amplitudeMultiplier = 2.8;
      } else if (state === 'processing') {
        baseColor = 'rgba(212, 175, 55, '; // Gold pulse (thinking)
        waveCount = 3;
        amplitudeMultiplier = 1.6;
      }

      // Draw subtle, ultra-clean concentric soundwaves
      for (let i = 0; i < waveCount; i++) {
        const radius = 55 + i * 16 + Math.sin(phase + i * 0.8) * (8 * amplitudeMultiplier);
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(10, radius), 0, Math.PI * 2);
        const opacity = Math.max(0.08, 0.35 - i * 0.07);
        ctx.strokeStyle = `${baseColor}${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Subtle glow effect
        ctx.fillStyle = `${baseColor}${0.02 * amplitudeMultiplier})`;
        ctx.fill();
      }

      // Center core orb
      const coreRadius = 40 + Math.sin(phase * 1.5) * (4 * amplitudeMultiplier);
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, coreRadius);
      gradient.addColorStop(0, `${baseColor}0.85)`);
      gradient.addColorStop(0.7, `${baseColor}0.25)`);
      gradient.addColorStop(1, `${baseColor}0.02)`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      phase += state === 'ai_speaking' ? 0.08 : state === 'user_listening' ? 0.09 : 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  return (
    <div className="relative flex items-center justify-center w-32 h-32 sm:w-52 sm:h-52 mx-auto shrink-0">
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-full h-full pointer-events-none drop-shadow-xl"
      />
    </div>
  );
};
