import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ResultCanvas from './components/ResultCanvas';
import DetectionResults from './components/DetectionResults';

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setDetections([]);
    setImageSrc(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/detect', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setDetections(data.detections || []);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error processing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-gray-100 to-white">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-extrabold text-center text-indigo-600 mb-6 tracking-tight">
          YOLO Object Detection
        </h1>

        <div className="mb-6">
          <ImageUpload onImageUpload={handleImageUpload} />
        </div>

        {isLoading && (
          <div className="text-center text-gray-500 my-6 animate-pulse">
            🕒 Đang xử lý ảnh...
          </div>
        )}

        {imageSrc && (
          <div className="mb-6">
            <ResultCanvas imageSrc={imageSrc} detections={detections} />
          </div>
        )}

        <div>
          <DetectionResults detections={detections} error={error} />
        </div>
      </div>
    </div>
  );
}

export default App;
