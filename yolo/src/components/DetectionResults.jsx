function DetectionResults({ detections, error }) {
    if (error) {
      return <p className="text-red-500 text-sm">{error}</p>;
    }
  
    return (
      <div className="flex flex-col justify-center items-center text-sm text-gray-700">
        {detections.map((detection, index) => (
          <p className="text-center" key={index}>
            Class: {detection.class}, Confidence: {(detection.confidence * 100).toFixed(2)}%, BBox: [
            {detection.bbox.join(', ')}]
          </p>
        ))}
      </div>
    );
  }
  
  export default DetectionResults;