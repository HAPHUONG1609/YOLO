import { gsap } from 'gsap';
import { useEffect, useState } from 'react';
import DetectionResults from "./components/DetectionResults.jsx";
import ImageUpload from "./components/ImageUpload.jsx";
import ResultCanvas from "./components/ResultCanvas.jsx";

function App() {
  const [activeModel, setActiveModel] = useState('default');
  const [defaultImage, setDefaultImage] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(null);

  // Kiểm tra kết nối đến API server
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Sử dụng phương thức POST thay vì HEAD để tránh lỗi 405
        const formData = new FormData();
        formData.append('test', 'connection');
        
        await fetch('http://localhost:5000/api/detect', {
          method: 'POST',
          body: formData,
          timeout: 2000
        });
        setIsConnected(true);
      // eslint-disable-next-line no-unused-vars
      } catch (_) {
        setIsConnected(false);
      }
    };
    
    checkConnection();
    
    // Kiểm tra kết nối định kỳ mỗi 30 giây
    const intervalId = setInterval(checkConnection, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Hiệu ứng animation ban đầu
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.from(".header", {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      clearProps: "all"
    });
    
    tl.from(".content", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      clearProps: "all"
    }, "-=0.5");
    
    // Hiệu ứng cho các nút
    tl.from(".btn", {
      scale: 0.9,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: "back.out(1.7)",
      clearProps: "all"
    }, "-=0.5");
  }, []);

  const sendToAPI = async (file, modelType) => {
    setError('');
    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('model_type', modelType);

    try {
      const res = await fetch('http://localhost:5000/api/detect', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setDetections(data.detections);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setError(data.error || 'Lỗi không xác định');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_) {
      setError('Không thể kết nối đến máy chủ API');
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultUpload = (file) => {
    setDefaultImage(file);
    sendToAPI(file, 'default');
  };

  const handleCustomUpload = (file) => {
    setCustomImage(file);
    sendToAPI(file, 'custom');
  };

  const handleModelChange = (modelType) => {
    setActiveModel(modelType);
    
    // Nếu đã có ảnh upload cho model này, hiển thị lại kết quả
    if (modelType === 'default' && defaultImage) {
      sendToAPI(defaultImage, 'default');
    } else if (modelType === 'custom' && customImage) {
      sendToAPI(customImage, 'custom');
    }
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="header bg-gradient-to-r from-primary-700 to-primary-500 text-white py-6 px-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3Z" stroke="currentColor" strokeWidth="2" />
                <path d="M9.5 9C10.3284 9 11 8.32843 11 7.5C11 6.67157 10.3284 6 9.5 6C8.67157 6 8 6.67157 8 7.5C8 8.32843 8.67157 9 9.5 9Z" stroke="currentColor" strokeWidth="2" />
                <path d="M14 15L11 12L5 18H19L14 13L14 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h1 className="text-2xl font-bold">YOLO Object Detection</h1>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-800' : isConnected === false ? 'bg-red-100 text-red-800' : 'bg-neutral-100 text-neutral-800'}`}>
                <span className={`w-2 h-2 mr-1 rounded-full ${isConnected ? 'bg-green-500' : isConnected === false ? 'bg-red-500' : 'bg-neutral-500 animate-pulse'}`}></span>
                {isConnected ? 'API đã kết nối' : isConnected === false ? 'API chưa kết nối' : 'Đang kiểm tra...'}
              </span>
              {isConnected === false && (
                <span className="ml-2 text-xs text-red-600">
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  Vui lòng khởi động API server
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 content">
        {/* Model Selection */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Chọn mô hình phát hiện</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4">
              <button 
                className={`btn ${activeModel === 'default' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleModelChange('default')}
              >
                Mô hình cơ bản
                <span className="ml-2 text-xs opacity-80">YOLOv5/v8</span>
              </button>
              <button 
                className={`btn ${activeModel === 'custom' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleModelChange('custom')}
              >
                Mô hình tùy chỉnh
                <span className="ml-2 text-xs opacity-80">Biển báo, Giao thông, Tiền tệ</span>
              </button>
            </div>
            
            {/* Hiển thị thông tin chi tiết về các model có sẵn */}
            <div className="pt-2 border-t border-neutral-200">
              <h3 className="text-sm font-medium mb-2">Thông tin model đã tải</h3>
              <div className="bg-neutral-50 p-3 rounded-md">
                {activeModel === 'default' ? (
                  <div className="text-sm">
                    <div className="font-medium mb-1">Mô hình YOLO cơ bản</div>
                    <ul className="list-disc list-inside text-xs text-neutral-600 space-y-1">
                      <li>YOLOv5su (Default): Phiên bản nâng cao của YOLOv5, phát hiện 80 loại đối tượng</li>
                      <li>YOLOv5s: Phiên bản nhỏ gọn, tốc độ nhanh</li>
                      <li>YOLOv8n: Phiên bản mới nhất, cải thiện độ chính xác</li>
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="font-medium mb-1">Nhóm mô hình đặc biệt</div>
                    <ul className="list-disc list-inside text-xs text-neutral-600 space-y-1">
                      <li>Xe máy: Nhận diện các loại xe máy, xe tay ga</li>
                      <li>Đèn giao thông: Nhận diện tín hiệu đèn đỏ, vàng, xanh</li>
                      <li>Biển báo: Nhận diện các loại biển báo giao thông</li>
                      <li>Tiền Euro: Nhận diện các mệnh giá tiền Euro</li>
                      <li>Tiền tệ: Nhận diện các mệnh giá tiền Việt Nam</li>
                    </ul>
                    <p className="text-xs text-primary-600 mt-2">* Khi chọn Mô hình tùy chỉnh, hệ thống sẽ chạy 5 model cùng lúc để phát hiện mọi đối tượng</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Upload Panel */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Tải lên hình ảnh</h2>
              <ImageUpload 
                onImageUpload={activeModel === 'default' ? handleDefaultUpload : handleCustomUpload} 
                label={`Tải lên hình ảnh cho mô hình ${activeModel === 'default' ? 'cơ bản' : 'tùy chỉnh'}`}
                modelType={activeModel}
                isApiConnected={isConnected}
              />
              
              {loading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="ml-2 text-sm text-neutral-600">Đang xử lý...</span>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Thông tin mô hình</h3>
                <div className="bg-neutral-50 p-3 rounded-md text-sm">
                  {activeModel === 'default' ? (
                    <>
                      <p className="font-medium">YOLOv5/v8</p>
                      <p className="text-neutral-600 text-xs mt-1">
                        Mô hình tiêu chuẩn được huấn luyện với bộ dữ liệu COCO. Có thể phát hiện 80 loại đối tượng khác nhau như người, xe cộ, động vật,...
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Mô hình tùy chỉnh</p>
                      <p className="text-neutral-600 text-xs mt-1">
                        Tập hợp các mô hình tùy chỉnh được huấn luyện cho các tác vụ cụ thể như nhận diện biển báo, đèn giao thông, tiền tệ, xe máy,...
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Image Preview and Detection Result */}
          <div className="lg:col-span-2">
            <div className="card h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Kết quả phát hiện</h2>
              
              {/* Canvas View - Hiển thị hình ảnh và bounding box */}
              <div className="h-96 mb-4 rounded-lg overflow-hidden bg-neutral-800 relative">
                <ResultCanvas imageSrc={imagePreview} detections={detections} loading={loading} />
                
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                    <div className="text-center text-white">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                      <p className="mt-2">Đang phân tích hình ảnh...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Detection Results */}
              <DetectionResults detections={detections} error={error} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-20 bg-neutral-100 text-neutral-600 py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>YOLO Object Detection — Powered by Ultralytics YOLOv5/v8</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
