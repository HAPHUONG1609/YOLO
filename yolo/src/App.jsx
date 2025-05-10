import { useState } from 'react';
import ImageUpload from "./components/ImageUpload.jsx";
import DetectionResults from "./components/DetectionResults.jsx";
import ResultCanvas from "./components/ResultCanvas.jsx";

function App() {
  const [defaultImage, setDefaultImage] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const sendToAPI = async (file, modelType) => {
    setError('');
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
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError('Failed to connect to server');
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

  return (
    <>
      <h1 className="flex items-center justify-center text-[#00A5CF]">YOLO Object Detection</h1>
      <div className="flex items-center justify-center">
        <div className="">
          <h2 className="font-semibold mb-2">Default Model</h2>
          <ImageUpload className="" onImageUpload={handleDefaultUpload} />
        </div>  
        <div className="mx-4">
          <h2 className="font-semibold mb-2">Custom Model</h2>
          <ImageUpload onImageUpload={handleCustomUpload} />
        </div>
      </div> 

      {/* Khung hiển thị hình ảnh và kết quả */}
      <div className="mt-6 border border-gray-300 rounded-lg p-4 w-[50vw] h-[50vh] max-w-3xl mx-auto overflow-hidden flex items-center justify-center">
        {imagePreview ? (
          <ResultCanvas imageSrc={imagePreview} detections={detections} />
        ) : (
          <p className="text-center text-gray-500 flex items-center justify-center h-full">No image uploaded yet.</p>
        )}
      </div>

      {/* Kết quả phát hiện */}
      <DetectionResults detections={detections} error={error} />
    </>
  );
}

export default App;
