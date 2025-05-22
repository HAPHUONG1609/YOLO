import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

// Mảng màu sắc khoa học cho các bounding box
const DETECTION_COLORS = [
  '#00A5CF', // primary-500
  '#1eb464', // secondary-500
  '#f98207', // accent-500
  '#6366f1', // indigo-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
];

function ResultCanvas({ imageSrc, detections, loading }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isRendered, setIsRendered] = useState(false);

  // Hàm để lấy màu từ mảng dựa trên class name
  const getColorForClass = (className) => {
    // Tạo một số hash đơn giản từ className
    const hash = className.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return DETECTION_COLORS[hash % DETECTION_COLORS.length];
  };

  // Xử lý vẽ hình ảnh và bounding box
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    // Hiệu ứng fade in cho canvas trước khi load ảnh
    gsap.set(canvas, { opacity: 0 });

    img.onload = () => {
      // Tính toán kích thước canvas dựa trên tỷ lệ khung hình của ảnh
      const containerWidth = containerRef.current ? containerRef.current.clientWidth : canvas.parentElement.clientWidth;
      const containerHeight = containerRef.current ? containerRef.current.clientHeight : canvas.parentElement.clientHeight;
      
      const imgRatio = img.width / img.height;
      const containerRatio = containerWidth / containerHeight;
      
      let canvasWidth, canvasHeight, scale;
      
      if (imgRatio > containerRatio) {
        // Ảnh rộng hơn tỷ lệ container, giới hạn bởi chiều rộng
        canvasWidth = Math.min(containerWidth, img.width);
        canvasHeight = canvasWidth / imgRatio;
        scale = canvasWidth / img.width;
      } else {
        // Ảnh cao hơn tỷ lệ container, giới hạn bởi chiều cao
        canvasHeight = Math.min(containerHeight, img.height);
        canvasWidth = canvasHeight * imgRatio;
        scale = canvasHeight / img.height;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      setDimensions({ width: canvasWidth, height: canvasHeight });
      
      // Timeline cho hiệu ứng
      const tl = gsap.timeline();
      
      // Xóa canvas và vẽ ảnh
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Hiệu ứng zoom in cho ảnh
      tl.to(canvas, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut"
      });
      
      // Vẽ ảnh vào canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Vẽ các bounding box với hiệu ứng
      if (detections.length > 0) {
        detections.forEach((detection, index) => {
          const { bbox, confidence, class: className } = detection;
          
          // Giải nén các giá trị từ bbox
          // YOLO Backend trả về [x, y, width, height] với x, y là tọa độ tâm,
          // và width, height là kích thước của đối tượng
          const [centerX, centerY, width, height] = bbox;
          
          // Tính toán lại tọa độ góc trên bên trái (TopLeft)
          const x = centerX - width / 2;
          const y = centerY - height / 2;
          
          // Tính toán vị trí và kích thước dựa trên tỷ lệ của canvas
          const scaledX = x * scale;
          const scaledY = y * scale;
          const scaledWidth = width * scale;
          const scaledHeight = height * scale;
          
          // Lấy màu dựa trên class
          const color = getColorForClass(className);
          
          // Tạo hiệu ứng vẽ frame
          tl.fromTo({}, {}, {
            duration: 0.1,
            onStart: () => {
              // Vẽ backdrop với hiệu ứng glow
              ctx.shadowColor = color;
              ctx.shadowBlur = 10;
              ctx.lineWidth = 3;
              ctx.strokeStyle = color;
              ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
              
              // Reset shadow để không ảnh hưởng đến text
              ctx.shadowBlur = 0;
              
              // Vẽ background cho text
              const text = `${className} (${(confidence * 100).toFixed(0)}%)`;
              ctx.font = 'bold 12px Inter';
              const textWidth = ctx.measureText(text).width + 8;
              
              // Hiệu ứng gradient cho label
              const gradient = ctx.createLinearGradient(scaledX, scaledY - 20, scaledX + textWidth, scaledY);
              gradient.addColorStop(0, color);
              gradient.addColorStop(1, adjustColorBrightness(color, 20));
              
              ctx.fillStyle = gradient;
              ctx.globalAlpha = 0.9;
              ctx.fillRect(
                scaledX - 1,
                scaledY - 20,
                textWidth,
                20
              );
              ctx.globalAlpha = 1;
              
              // Vẽ text với đổ bóng nhẹ
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = 'rgba(0,0,0,0.3)';
              ctx.shadowBlur = 2;
              ctx.shadowOffsetX = 1;
              ctx.shadowOffsetY = 1;
              ctx.fillText(
                text,
                scaledX + 4,
                scaledY - 6
              );
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            },
            ease: "power2.inOut",
          }, `-=${index > 0 ? 0.05 : 0}`);
        });
      }
      
      tl.call(() => setIsRendered(true));
    };
    
    return () => {
      // Cleanup timeline
      gsap.killTweensOf(canvas);
    };
  }, [imageSrc, detections]);

  // Hàm điều chỉnh độ sáng của màu
  const adjustColorBrightness = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) + percent;
    const g = ((num >> 8) & 0x00FF) + percent;
    const b = (num & 0x0000FF) + percent;
    
    const newR = r > 255 ? 255 : r < 0 ? 0 : r;
    const newG = g > 255 ? 255 : g < 0 ? 0 : g;
    const newB = b > 255 ? 255 : b < 0 ? 0 : b;
    
    return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-neutral-900 rounded-lg overflow-hidden">
      {!imageSrc && (
        <div className="text-center text-neutral-400 p-6 bg-neutral-800/40 rounded-lg border border-neutral-700 max-w-md mx-auto animate-fadeIn">
          <svg className="w-20 h-20 mx-auto mb-4 text-neutral-300 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p className="text-base font-medium text-neutral-200">Chưa có hình ảnh</p>
          <p className="text-sm text-neutral-400 mt-1">Vui lòng tải lên một hình ảnh để phát hiện đối tượng</p>
        </div>
      )}
      {imageSrc && (
        <canvas 
          ref={canvasRef} 
          className={`max-w-full max-h-full ${isRendered ? 'canvas-loaded' : 'opacity-0'}`} 
        />
      )}

      {imageSrc && detections.length === 0 && !loading && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center animate-fadeIn">
          <div className="bg-neutral-800 p-6 rounded-lg max-w-md text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <p className="text-white font-medium text-lg">Không tìm thấy đối tượng</p>
            <p className="text-neutral-300 text-sm mt-1">Mô hình không phát hiện được đối tượng nào trong ảnh này</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultCanvas;