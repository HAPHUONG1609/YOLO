from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO
import io

app = Flask(__name__)
CORS(app)

# === Load mô hình một lần duy nhất ===
model_paths = {
    'default': './weights/yolov5su.pt',
    'custom': [
        './weights/motocycle.pt',
        './weights/traffic_light.pt',
        './weights/traffic_sign.pt',
        './weights/euro_detection.pt',
        './weights/money_detection.pt'
    ]
}

models = {
    'default': YOLO(model_paths['default']),
    'custom': [YOLO(path) for path in model_paths['custom']]
}

@app.route('/api/detect', methods=['POST'])
def detect():
    """
    Nhận ảnh và loại mô hình ('default' hoặc 'custom'), trả về kết quả nhận diện.
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    model_type = request.form.get('model_type', 'default') # chọn mô hình 
    print(f"[INFO] Using model: {model_type} | Path: {model_paths.get(model_type)}")

    if model_type not in models:
        return jsonify({'error': f"Invalid model_type: {model_type}"}), 400

    file = request.files['image']
    try:
        img = Image.open(file.stream).convert("RGB")
    except Exception as e:
        return jsonify({'error': f'Invalid image format: {str(e)}'}), 400

    detections = []

    if model_type == 'custom':
        for i, model in enumerate(models['custom']):
            results = model(img)
            for box in results[0].boxes:
                class_id = int(box.cls[0])
                detection = {
                    'model_index': i,  # để biết kết quả từ mô hình thứ mấy
                    'bbox': [float(x) for x in box.xywh[0].tolist()],
                    'confidence': float(box.conf[0]),
                    'class': model.names[class_id] if class_id < len(model.names) else str(class_id)
                }
                detections.append(detection)
    else:
        model = models['default']
        results = model(img)
        for box in results[0].boxes:
            class_id = int(box.cls[0])
            detection = {
                'bbox': [float(x) for x in box.xywh[0].tolist()],
                'confidence': float(box.conf[0]),
                'class': model.names[class_id] if class_id < len(model.names) else str(class_id)
            }
            detections.append(detection)

    return jsonify({'detections': detections})

@app.route('/api/reload-model', methods=['POST'])
def reload_model():
    """
    Reload mô hình nếu cần cập nhật lại weight.
    Gửi JSON với model_type = 'default' hoặc 'custom'
    """
    global models
    data = request.get_json()
    model_type = data.get('model_type')

    if model_type not in model_paths:
        return jsonify({'error': f"Invalid model_type: {model_type}"}), 400

    try:
        if model_type == 'custom':
            models['custom'] = [YOLO(path) for path in model_paths['custom']]
        else:
            models['default'] = YOLO(model_paths['default'])

        return jsonify({'message': f'Model {model_type} reloaded successfully'})
    except Exception as e:
        return jsonify({'error': f'Failed to reload {model_type} model: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
