import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

// Mảng màu sắc khoa học cho các bounding box (cần phải đồng bộ với ResultCanvas)
const DETECTION_COLORS = [
  '#00A5CF', // primary-500
  '#1eb464', // secondary-500
  '#f98207', // accent-500
  '#6366f1', // indigo-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
];

function DetectionResults({ detections, error }) {
  const [expanded, setExpanded] = useState(false);
  const resultsRef = useRef(null);
  const detailsRef = useRef(null);
  const errorRef = useRef(null);
  
  // Hàm để lấy màu từ mảng dựa trên class name (giống ResultCanvas)
  const getColorForClass = (className) => {
    const hash = className.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return DETECTION_COLORS[hash % DETECTION_COLORS.length];
  };
  
  // Tổng hợp thông tin các đối tượng đã phát hiện theo loại
  const getDetectionSummary = () => {
    const summary = {};
    
    detections.forEach(detection => {
      const { class: className, confidence } = detection;
      if (!summary[className]) {
        summary[className] = {
          count: 1,
          avgConfidence: confidence
        };
      } else {
        summary[className].count++;
        summary[className].avgConfidence = (summary[className].avgConfidence + confidence) / 2;
      }
    });
    
    return Object.entries(summary).map(([className, data]) => ({
      className,
      count: data.count,
      avgConfidence: data.avgConfidence,
      color: getColorForClass(className)
    }));
  };
  
  // Animation effect khi có kết quả mới
  useEffect(() => {
    if (!resultsRef.current) return;
    
    // Animation cho bảng kết quả
    if (detections.length > 0) {
      const tl = gsap.timeline();
      
      // Animate summary items
      tl.fromTo(
        resultsRef.current.querySelectorAll('.summary-item'), 
        { 
          y: 20, 
          opacity: 0,
          scale: 0.95
        }, 
        { 
          y: 0, 
          opacity: 1,
          scale: 1,
          stagger: 0.05,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
      
      // Animate details button if exists
      if (detections.length > 3) {
        tl.fromTo(
          resultsRef.current.querySelector('.details-toggle'),
          {
            opacity: 0,
            y: 10
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            clearProps: 'all'
          },
          '-=0.2'
        );
      }
    }
    
    // Animation error message
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        {
          opacity: 0,
          y: -20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          clearProps: 'all'
        }
      );
    }
  }, [detections, error]);
  
  // Animation cho phần chi tiết
  useEffect(() => {
    if (!detailsRef.current) return;
    
    if (expanded) {
      gsap.fromTo(
        detailsRef.current.querySelectorAll('.detail-item'),
        {
          opacity: 0,
          y: 10,
          scale: 0.97
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.03,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
    }
  }, [expanded]);
  
  if (error) {
    return (
      <div ref={errorRef} className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md relative overflow-hidden">
        <div className="flex items-start relative z-10">
          <svg className="w-6 h-6 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p className="text-red-700 font-medium">Lỗi xử lý hình ảnh</p>
            <p className="text-red-600">{error}</p>
            <p className="text-red-500 text-sm mt-2">Giải pháp: Hãy kiểm tra kết nối đến API server hoặc thử tải lên một hình ảnh khác</p>
          </div>
        </div>
        {/* Background effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-100 rounded-full -ml-12 -mb-12 opacity-40"></div>
      </div>
    );
  }
  
  const summary = getDetectionSummary();
  
  return (
    <div className="mt-6" ref={resultsRef}>
      {detections.length > 0 ? (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-neutral-800">
              Kết quả phát hiện
            </h3>
            <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full animate-pulse-glow">
              {detections.length} đối tượng
            </span>
          </div>
          
          {/* Tóm tắt kết quả */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {summary.map((item, index) => (
              <div 
                key={index} 
                className="summary-item flex items-center p-3 rounded-md border border-neutral-200 transform transition-transform hover:scale-102 hover:shadow-sm"
                style={{ 
                  borderLeftColor: item.color, 
                  borderLeftWidth: '4px',
                  background: `linear-gradient(to right, ${item.color}10, transparent)`
                }}
              >
                <div className="flex-1">
                  <div className="font-medium">{item.className}</div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-neutral-500">
                      Số lượng: <span className="font-medium text-neutral-700">{item.count}</span>
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center">
                        <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden mr-1">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${item.avgConfidence * 100}%`, 
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="text-neutral-700 font-medium">
                          {(item.avgConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Nút mở rộng/thu gọn chi tiết */}
          {detections.length > 3 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="details-toggle text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center mb-2 transition-all duration-300 hover:pl-1"
            >
              {expanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              <svg 
                className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          )}
          
          {/* Chi tiết từng đối tượng */}
          <div 
            ref={detailsRef}
            className={`mt-2 border-t border-neutral-200 pt-2 space-y-2 max-h-60 overflow-y-auto transition-all duration-500 ${expanded ? 'opacity-100' : 'opacity-0 h-0 pt-0 mt-0 border-none'}`}
            style={{ display: expanded ? 'block' : 'none' }}
          >
            {detections.map((detection, index) => {
              const { class: className, confidence, bbox } = detection;
              const color = getColorForClass(className);
              
              return (
                <div 
                  key={index} 
                  className="detail-item text-sm p-3 rounded-md bg-neutral-50 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium">{className}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden mr-1.5">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${confidence * 100}%`, 
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {(confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-neutral-400 mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100">
                      <span className="mr-1">centerX:</span> 
                      <span className="font-medium text-neutral-700">{bbox[0].toFixed(1)}</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100">
                      <span className="mr-1">centerY:</span> 
                      <span className="font-medium text-neutral-700">{bbox[1].toFixed(1)}</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100">
                      <span className="mr-1">width:</span> 
                      <span className="font-medium text-neutral-700">{bbox[2].toFixed(1)}</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100">
                      <span className="mr-1">height:</span> 
                      <span className="font-medium text-neutral-700">{bbox[3].toFixed(1)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : detections.length === 0 && !error ? (
        <div className="text-sm text-center text-neutral-500 card animate-fadeIn">
          <div className="flex flex-col items-center p-4">
            <svg className="w-12 h-12 text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="font-medium text-neutral-600">Chưa phát hiện đối tượng nào</p>
            <p className="text-neutral-400 mt-1">Hãy thử tải lên ảnh khác hoặc chọn mô hình phù hợp hơn</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DetectionResults;