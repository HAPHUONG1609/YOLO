import { gsap } from 'gsap';
import { useCallback, useEffect, useRef, useState } from 'react';

function ImageUpload({ onImageUpload, label = "Upload an Image", modelType = "default", isApiConnected = true }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);
  const previewRef = useRef(null);

  // Animation cho component khi mount
  useEffect(() => {
    const tl = gsap.timeline();
    
    if (dropzoneRef.current) {
      tl.fromTo(
        dropzoneRef.current,
        { 
          y: 10, 
          opacity: 0,
          scale: 0.98
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
          clearProps: "all"
        }
      );
    }
  }, []);

  // Animation cho preview
  useEffect(() => {
    if (preview && previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        {
          opacity: 0,
          scale: 0.9
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
          clearProps: "all"
        }
      );
    }
  }, [preview]);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      
      // Tạo preview cho người dùng thấy ảnh đã chọn
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setTimeout(() => setIsUploading(false), 600); // Giả lập thời gian tải
      };
      reader.readAsDataURL(file);
      
      // Gửi file lên cho component cha xử lý
      onImageUpload(file);
    }
  };

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isApiConnected) return;
    
    setIsDragging(true);
    
    // Add pulsing effect on drag over
    if (dropzoneRef.current) {
      gsap.to(dropzoneRef.current, {
        boxShadow: "0 0 0 3px rgba(0, 165, 207, 0.3)",
        duration: 0.3
      });
    }
  }, [isApiConnected]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!isApiConnected) return;
    
    setIsDragging(false);
    
    // Remove pulsing effect
    if (dropzoneRef.current) {
      gsap.to(dropzoneRef.current, {
        boxShadow: "none",
        duration: 0.3
      });
    }
  }, [isApiConnected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (!isApiConnected) return;
    
    setIsDragging(false);
    
    // Remove pulsing effect
    if (dropzoneRef.current) {
      gsap.to(dropzoneRef.current, {
        boxShadow: "none",
        duration: 0.3
      });
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [isApiConnected, handleFile]);

  const handleClick = () => {
    if (!isApiConnected) return;
    fileInputRef.current.click();
  };

  return (
    <div className="relative w-full mb-6">
      <label className="block text-sm font-medium text-neutral-700 mb-2" htmlFor={`imageUpload-${modelType}`}>
        {label}
      </label>
      
      <div
        ref={dropzoneRef}
        className={`relative h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden
          ${!isApiConnected ? 'border-red-300 bg-red-50 opacity-80 cursor-not-allowed' : 
          isDragging ? 'border-primary-500 bg-primary-50 scale-[1.01]' : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'}`}
        onDragOver={isApiConnected ? handleDragOver : null}
        onDragLeave={isApiConnected ? handleDragLeave : null}
        onDrop={isApiConnected ? handleDrop : null}
        onClick={isApiConnected ? handleClick : null}
      >
        {!isApiConnected && (
          <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
            <div className="text-center p-4">
              <svg className="w-10 h-10 mx-auto text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <p className="text-red-700 font-medium">API server chưa kết nối</p>
              <p className="text-red-600 text-sm">Không thể tải lên hình ảnh</p>
            </div>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-20">
            <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin mb-3"></div>
            <p className="text-primary-700 font-medium">Đang tải lên...</p>
          </div>
        )}
        
        {preview ? (
          <div ref={previewRef} className="h-full w-full relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-contain p-2" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
              <div className="transform translate-y-4 hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-medium text-center mb-2">Kéo ảnh mới hoặc nhấp để thay đổi</p>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                  }}
                  className="mx-auto block text-xs px-3 py-1 rounded-full bg-white text-neutral-800 hover:bg-primary-500 hover:text-white transition-colors duration-300"
                >
                  Hủy ảnh
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}>
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p className="mt-2 text-sm text-neutral-500 text-center">
                {isDragging ? (
                  <span className="text-primary-600 font-medium">Thả ảnh vào đây để tải lên</span>
                ) : (
                  <>
                    Kéo và thả ảnh vào đây hoặc <span className="text-primary-500 font-medium">nhấp để chọn ảnh</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-neutral-400 text-center">PNG, JPG, WEBP (tối đa 10MB)</p>
            </div>
            
            {/* Gradient rings effect for dragging state */}
            {isDragging && (
              <>
                <div className="absolute inset-6 rounded-full border-4 border-dashed border-primary-200 animate-spin-slow opacity-20"></div>
                <div className="absolute inset-12 rounded-full border-4 border-dashed border-primary-300 animate-spin-reverse-slow opacity-20"></div>
              </>
            )}
          </>
        )}
      </div>
      
      <input
        type="file"
        id={`imageUpload-${modelType}`}
        accept="image/*"
        onChange={handleChange}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
}

export default ImageUpload;