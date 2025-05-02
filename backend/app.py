from flask import Flask, request
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO
import io

app = Flask(__name__)
CORS(app)  # Cho phép frontend gửi yêu cầu từ localhost:3000
model = YOLO('weights/yolov5su.pt')  # Tải mô hình YOLO

@app.route('/api/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return {'error': 'No image provided'}, 400
    file = request.files['image']
    img = Image.open(file.stream)
    results = model(img)  # Chạy mô hình
    detections = [
        {
            'bbox': [float(x) for x in box.xywh[0].tolist()],  # Lấy tọa độ khung bao
            'confidence': float(box.conf[0]),  # Lấy độ tin cậy
            'class': model.names[int(box.cls[0])]  # Lấy tên lớp
        } for box in results[0].boxes  # Duyệt qua các khung bao trong results[0]
    ]
    return {'detections': detections}

if __name__ == '__main__':
    app.run(debug=True, port=5000)