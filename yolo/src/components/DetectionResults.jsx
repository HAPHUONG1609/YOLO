function DetectionResults({ detections, error }) {
    if (error) {
      return <p className="text-red-500 text-sm">{error}</p>;
    }
  
    return (
      <div className="text-sm text-gray-700">
        {detections.map((detection, index) => (
          <p key={index}>
            Class: {detection.class}, Confidence: {(detection.confidence * 100).toFixed(2)}%, BBox: [
            {detection.bbox.join(', ')}]
          </p>
        ))}
      </div>
    );
  }
  
  export default DetectionResults;