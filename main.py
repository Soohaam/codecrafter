import cv2 

print(cv2.__version__)

import cvzone
import mediapipe as mp
from ultralytics import YOLO
from flask import Flask, Response
import threading
import numpy as np
from datetime import datetime

app = Flask(__name__)

# Initialize video capture
cap = cv2.VideoCapture(0)
cap.set(3, 740)  # Width
cap.set(4, 480)  # Height
cap.set(5, 30)
# Load COCO classes for general object detection
classNames = []
classFile = 'coco.names'
with open(classFile, 'rt') as f:
    classNames = f.read().split('\n')

# Load SSD MobileNet model
configPath = 'ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt'
weightsPath = "frozen_inference_graph.pb"
net = cv2.dnn_DetectionModel(weightsPath, configPath)
net.setInputSize(320, 320)
net.setInputScale(1.0 / 127.5)
net.setInputMean((127.5, 127.5, 127.5))
net.setInputSwapRB(True)

# Mediapipe Pose and Drawing
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose()

# Initialize YOLOv8 model for weapon detection
model = YOLO("yolov8m.pt")

# Class mapping for weapons
WEAPON_CLASSES = {
    'knife': 'knife',
    'scissors': 'Sharp Object',
    'gun': 'gun'
}

# Thread safety
lock = threading.Lock()
global_frame = None

# Store detection history
detection_history = []

def capture_frames():
    """Background thread to continuously capture frames from the camera."""
    global global_frame
    while True:
        success, frame = cap.read()
        if success:
            with lock:
                global_frame = frame.copy()

# Start the frame capture thread
thread = threading.Thread(target=capture_frames, daemon=True)
thread.start()

def generate_object_detection_frames():
    """Generate frames with general object detection."""
    while True:
        with lock:
            if global_frame is None:
                continue
            frame = global_frame.copy()

        # General Object Detection with SSD MobileNet
        h, w, _ = frame.shape
        classIds, confs, bbox = net.detect(frame, confThreshold=0.55, nmsThreshold=0.2)

        if len(classIds) > 0:
            classIds = np.array(classIds).flatten()
            confs = np.array(confs).flatten()

            for classId, conf, box in zip(classIds, confs, bbox):
                x, y, w_box, h_box = box
                x = max(0, x)
                y = max(0, y)
                w_box = min(w_box, w - x)
                h_box = min(h_box, h - y)

                cvzone.cornerRect(frame, (x, y, w_box, h_box))
                cv2.putText(frame, f'{classNames[classId - 1].upper()} {round(conf * 100, 2)}%',
                            (x + 10, y + 30), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                            1, (0, 255, 0), 2)

        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def generate_thermal_frames():
    """Generate frames with thermal simulation."""
    while True:
        with lock:
            if global_frame is None:
                continue
            frame = global_frame.copy()

        # Convert frame to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        normalized_gray = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
        thermal_frame = cv2.applyColorMap(normalized_gray, cv2.COLORMAP_JET)

        _, buffer = cv2.imencode('.jpg', thermal_frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def detect_weapons(frame):
    """Detect weapons in frame using YOLOv8"""
    try:
        # Run detection
        results = model.predict(source=frame, conf=0.5, verbose=False)[0]
        
        # Process detections
        for detection in results.boxes.data:
            x1, y1, x2, y2, conf, cls = detection
            class_name = results.names[int(cls)]
            
            # Only process weapons
            if class_name.lower() in WEAPON_CLASSES:
                # Convert coordinates to integers
                x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
                
                # Draw red box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                
                # Add label with confidence
                label = f"{class_name.upper()}: {conf:.2f}"
                cv2.putText(frame, label, (x1, y1 - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                
                # Add timestamp
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cv2.putText(frame, timestamp, (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                # Store detection in history
                detection_history.append({
                    'timestamp': timestamp,
                    'weapon_type': class_name,
                    'confidence': float(conf)
                })
                
                # Keep only last 100 detections
                if len(detection_history) > 100:
                    detection_history.pop(0)
        
        # Add "Monitoring Active" indicator
        cv2.putText(frame, "Monitoring Active", (10, frame.shape[0] - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
        return frame
        
    except Exception as e:
        print(f"Error in weapon detection: {e}")
        return frame
    
def generate_activity_frames():
    """Advanced motion detection including: Running, Walking, Sitting, etc."""
    # Activity tracking variables
    prev_center = None
    activity = "Initializing..."
    activity_history = []  # Store recent activities for smoothing
    displacement_history = []  # Store recent displacements for better classification

    # Performance optimization
    process_every_n_frames = 1  # Process every frame for 60 FPS
    frame_count = 0

    # Create a dedicated pose instance with optimized settings
    with mp_pose.Pose(
        model_complexity=0,  # Light complexity for faster processing
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        smooth_landmarks=True  # Enable temporal filtering
    ) as pose_detector:

        while True:
            # Safely access the global frame
            with lock:
                if global_frame is None:
                    continue
                frame = global_frame.copy()

            # Process every frame for performance
            frame_count += 1
            if frame_count % process_every_n_frames != 0:
                # Still do weapon detection on every frame
                frame = detect_weapons(frame)

            # Draw the previous activity state
            cv2.putText(frame, f"Activity: {activity}", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1,
                        (0, 255, 0) if activity != "No pose detected" else (0, 0, 255), 2)

            # Add status indicator
            cv2.putText(frame, "Monitoring Active", (10, frame.shape[0] - 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # _, buffer = cv2.imencode(".jpg", frame)
            # yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            # continue

            # Process full frame for weapon detection
            frame = detect_weapons(frame)

            # Pre-process frame for pose detection - resize for better performance
            # Use a better scaling factor for improved balance between speed and accuracy
            scale_factor = 0.5
            small_frame = cv2.resize(frame, (0, 0), fx=scale_factor, fy=scale_factor)

            # Convert to RGB (MediaPipe requirement)
            rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            # Get pose landmarks
            results = pose_detector.process(rgb_frame)

            # Valid pose detection
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark

                # Calculate centroid with visibility filter
                visible_landmarks = []
                for lm in landmarks:
                    if lm.visibility > 0.5:  # Improved visibility threshold
                        visible_landmarks.append((lm.x, lm.y))

                if len(visible_landmarks) >= 10:  # Need good visibility
                    # Calculate centroid
                    current_center = (
                        sum(p[0] for p in visible_landmarks) / len(visible_landmarks),
                        sum(p[1] for p in visible_landmarks) / len(visible_landmarks)
                    )

                    # Get specific landmarks for posture analysis
                    try:
                        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
                        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
                        left_knee = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
                        right_knee = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
                        left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                        right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
                        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
                        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]

                        # Calculate body angles and vectors for better classification
                        hip_avg_y = (left_hip.y + right_hip.y) / 2
                        knee_avg_y = (left_knee.y + right_knee.y) / 2
                        ankle_avg_y = (left_ankle.y + right_ankle.y) / 2
                        shoulder_avg_y = (left_shoulder.y + right_shoulder.y) / 2

                        # Body tilt (vertical alignment)
                        body_vertical = hip_avg_y - shoulder_avg_y

                        if prev_center is not None:
                            # Calculate displacement (movement amount)
                            dx = current_center[0] - prev_center[0]
                            dy = current_center[1] - prev_center[1]
                            displacement = (dx**2 + dy**2)**0.5

                            # Store in history for smoother detection
                            displacement_history.append(displacement)
                            if len(displacement_history) > 5:
                                displacement_history.pop(0)

                            # Get average displacement for stability
                            avg_displacement = sum(displacement_history) / len(displacement_history)

                            # Enhanced posture detection
                            # Sitting: hips are lower than knees (y increases downwards)
                            sitting_score = (hip_avg_y - knee_avg_y)

                            # Crouching: knees are significantly bent
                            knee_bend = knee_avg_y - ankle_avg_y

                            # Activity classification with improved thresholds
                            if sitting_score > 0.05:  # Sitting
                                new_activity = "Sitting"
                            elif knee_bend > 0.15:  # Crouching
                                new_activity = "Crouching"
                            elif avg_displacement > 0.07:  # Running (faster movement)
                                new_activity = "Running"
                            elif 0.02 < avg_displacement < 0.07:  # Walking (moderate movement)
                                new_activity = "Walking"
                            elif abs(dy) > 0.06 and abs(dx) < 0.04:  # Jumping (vertical movement)
                                new_activity = "Jumping"
                            elif body_vertical < -0.05:  # Bending forward
                                new_activity = "Bending"
                            else:
                                new_activity = "Standing"
                        else:
                            new_activity = "Standing"

                        # Add to activity history for smoothing
                        activity_history.append(new_activity)
                        if len(activity_history) > 3:  # Keep last 3 activities
                            activity_history.pop(0)

                        # Get most common recent activity (temporal smoothing)
                        from collections import Counter
                        activity = Counter(activity_history).most_common(1)[0][0]

                        # Update previous center
                        prev_center = current_center

                    except Exception as e:
                        # Fallback if specific landmark access fails
                        activity = "Standing"
                        print(f"Error in pose analysis: {e}")
                else:
                    activity = "Limited Visibility"
                    prev_center = None
            else:
                activity = "No Pose Detected"
                prev_center = None

            # Draw skeleton on original frame if landmarks exist
            if results.pose_landmarks:
                # Draw the skeleton with correct coordinate transformation
                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    connection_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2)
                )

            # Display activity
            cv2.putText(frame, f"Activity: {activity}", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1,
                        (0, 255, 0) if "No" not in activity else (0, 0, 255), 2)

            # Add status indicator
            cv2.putText(frame, "Monitoring Active", (10, frame.shape[0] - 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # Encode and yield the frame
            _, buffer = cv2.imencode(".jpg", frame)
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')


def generate_weapon_frames():
    """Generate frames with weapon detection only."""
    while True:
        with lock:
            if global_frame is None:
                continue
            frame = global_frame.copy()

        # Weapon detection only
        processed_frame = detect_weapons(frame)
        
        try:
            # Convert to bytes for streaming
            _, buffer = cv2.imencode('.jpg', processed_frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        except Exception as e:
            print(f"Error in frame generation: {e}")
            continue

@app.route('/video_feed')
def video_feed():
    """Route for general object detection feed."""
    return Response(generate_object_detection_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed_thermal')
def video_feed_thermal():
    """Route for thermal camera simulation feed."""
    return Response(generate_thermal_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/activity_feed')
def activity_feed():
    """Route for pose and weapon detection feed."""
    return Response(generate_activity_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/weapon_detection_feed')
def weapon_detection_feed():
    """Stream the weapon detection feed"""
    return Response(generate_weapon_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/detection_history')
def get_detection_history():
    """Get the detection history"""
    return {'detections': detection_history}

@app.route('/')
def index():
    """Serve a simple HTML page with all video feeds"""
    return """
    <html>
        <head>
            <title>Integrated Detection System</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }
                .feed-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
                .feed { flex: 1; min-width: 300px; margin: 10px; }
                img { max-width: 100%; margin: 10px 0; }
                .status { color: green; font-weight: bold; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>Integrated Detection System</h1>
            <div class="status">System Active</div>
            <div class="feed-container">
                <div class="feed">
                    <h2>Object Detection</h2>
                    <img src="/video_feed" />
                </div>
                <div class="feed">
                    <h2>Thermal View</h2>
                    <img src="/video_feed_thermal" />
                </div>
                <div class="feed">
                    <h2>Activity & Weapon Detection</h2>
                    <img src="/activity_feed" />
                </div>
            </div>
        </body>
    </html>
    """

if __name__ == "__main__":
    try:
        print("Starting Integrated Detection System...")
        print("Access the system at http://localhost:5000")
        app.run(host="0.0.0.0", port=5000, threaded=True)
    finally:
        cap.release()