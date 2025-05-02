import { useRef, useEffect } from 'react';

function ResultCanvas({ imageSrc, detections }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      detections.forEach((detection) => {
        const { bbox, confidence, class: className } = detection;
        const [x, y, width, height] = bbox;

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.fillText(`${className} (${(confidence * 100).toFixed(2)}%)`, x, y > 10 ? y - 5 : y + 15);
      });
    };
  }, [imageSrc, detections]);

  return (
    <div className="mb-6">
      <canvas ref={canvasRef} className="w-full border border-gray-300 rounded" />
    </div>
  );
}

export default ResultCanvas;