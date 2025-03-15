import cv2 
print(cv2.__version__)

import cvzone
import mediapipe as mp
from ultralytics import YOLO
from flask import Flask, Response
import threading
import numpy as np
from datetime import datetime
import time

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

# Person tracking variables
person_database = {}  # Will store unique person signatures
next_person_id = 1    # Counter for new person IDs

def get_person_features(frame, x, y, w_box, h_box):
    """Extract basic features of a person to use for re-identification"""
    try:
        # Crop the person region
        person_roi = frame[y:y+h_box, x:x+w_box]
        if person_roi.shape[0] == 0 or person_roi.shape[1] == 0:
            return None
        
        # Calculate color histogram
        hist = cv2.calcHist([person_roi], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        
        # Calculate height/width ratio
        aspect_ratio = h_box / w_box if w_box > 0 else 0
        
        return {"histogram": hist, "height": h_box, "width": w_box, "aspect_ratio": aspect_ratio}
    except Exception as e:
        print(f"Error getting person features: {e}")
        return None

def compare_features(features1, features2):
    """Compare two feature sets and return a similarity score (0-1)"""
    if features1 is None or features2 is None:
        return 0
    
    try:
        # Compare histograms
        hist_score = cv2.compareHist(features1["histogram"], features2["histogram"], cv2.HISTCMP_CORREL)
        if hist_score < 0:
            hist_score = 0
        
        # Compare aspect ratios
        aspect_diff = abs(features1["aspect_ratio"] - features2["aspect_ratio"])
        aspect_score = max(0, 1 - aspect_diff)
        
        # Compare size
        height_ratio = min(features1["height"], features2["height"]) / max(features1["height"], features2["height"])
        
        # Weighted combination
        similarity = 0.6 * hist_score + 0.2 * aspect_score + 0.2 * height_ratio
        return similarity
    except Exception as e:
        print(f"Error comparing features: {e}")
        return 0

def assign_person_id(frame, x, y, w_box, h_box):
    """Assign or re-assign a person ID based on appearance similarity"""
    global next_person_id, person_database
    
    try:
        # Extract features
        current_features = get_person_features(frame, x, y, w_box, h_box)
        if current_features is None:
            return f"P{next_person_id}"
        
        best_match_id = None
        best_match_score = 0
        
        # Compare with known persons
        for person_id, data in person_database.items():
            score = compare_features(current_features, data["features"])
            # If we have a good match
            if score > 0.65 and score > best_match_score:
                best_match_id = person_id
                best_match_score = score
        
        # If no good match, assign new ID
        if best_match_id is None:
            person_id = f"P{next_person_id}"
            next_person_id += 1
            person_database[person_id] = {
                "features": current_features,
                "last_seen": time.time(),
                "position": (x + w_box // 2, y + h_box // 2),
                "frames_tracked": 1
            }
        else:
            person_id = best_match_id
            # Update the database with the latest features (weighted average)
            old_features = person_database[person_id]["features"]
            frames_tracked = person_database[person_id]["frames_tracked"]
            
            # Adaptive feature update - give more weight to established features
            weight_new = min(0.3, 1.0 / frames_tracked)
            weight_old = 1.0 - weight_new
            
            # Update histogram using weighted average
            weighted_hist = weight_old * old_features["histogram"] + weight_new * current_features["histogram"]
            old_features["histogram"] = cv2.normalize(weighted_hist, weighted_hist).flatten()
            
            # Update other metrics
            old_features["height"] = weight_old * old_features["height"] + weight_new * current_features["height"]
            old_features["width"] = weight_old * old_features["width"] + weight_new * current_features["width"]
            old_features["aspect_ratio"] = old_features["height"] / old_features["width"] if old_features["width"] > 0 else 0
            
            # Update tracking data
            person_database[person_id]["last_seen"] = time.time()
            person_database[person_id]["position"] = (x + w_box // 2, y + h_box // 2)
            person_database[person_id]["frames_tracked"] += 1
        
        return person_id
    except Exception as e:
        print(f"Error assigning person ID: {e}")
        return f"P{next_person_id}"

def cleanup_person_database():
    """Remove old entries from the person database"""
    global person_database
    current_time = time.time()
    # Remove people not seen in 30 seconds
    keys_to_remove = [pid for pid, data in person_database.items() 
                     if current_time - data["last_seen"] > 30.0]
    for pid in keys_to_remove:
        del person_database[pid]

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
    """Generate frames with general object detection and detailed movement logging."""
    
    global global_frame, object_positions
    object_positions = {}  # Store previous positions for tracking
    MOVEMENT_THRESHOLD = 10  # Pixels threshold for movement detection
    FRAME_HISTORY = 5  # Number of frames to keep for movement analysis
    
    # Periodically clean up person database
    last_cleanup_time = time.time()
    
    while True:
        with lock:
            if global_frame is None:
                continue
            frame = global_frame.copy()

        # Periodically clean up person database
        current_time = time.time()
        if current_time - last_cleanup_time > 5.0:  # Clean up every 5 seconds
            cleanup_person_database()
            last_cleanup_time = current_time

        # Get frame dimensions
        h, w, _ = frame.shape
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # General Object Detection with SSD MobileNet
        classIds, confs, bbox = net.detect(frame, confThreshold=0.55, nmsThreshold=0.2)

        current_detections = {}

        if len(classIds) > 0:
            classIds = np.array(classIds).flatten()
            confs = np.array(confs).flatten()

            for detection_idx, (classId, conf, box) in enumerate(zip(classIds, confs, bbox)):
                x, y, w_box, h_box = box
                x = max(0, x)
                y = max(0, y)
                w_box = min(w_box, w - x)
                h_box = min(h_box, h - y)

                # Calculate center point
                center_x = x + w_box // 2
                center_y = y + h_box // 2

                # Check if this is a person detection (class 1 in COCO is person)
                is_person = (classId == 1)
                
                # If it's a person, assign/retrieve person ID
                person_id = None
                if is_person:
                    person_id = assign_person_id(frame, x, y, w_box, h_box)

                # Generate unique ID for this detection
                detection_id = f"{classId}_{center_x}_{center_y}" if not is_person else person_id

                # Store current position
                current_detections[detection_id] = {
                    'timestamp': timestamp,
                    'class_id': classId,
                    'class_name': classNames[classId - 1],
                    'confidence': conf,
                    'bbox': (x, y, w_box, h_box),
                    'center': (center_x, center_y),
                    'history': [],
                    'is_person': is_person,
                    'person_id': person_id if is_person else None
                }

                # Match with previous detections
                if detection_id in object_positions:
                    current_detections[detection_id]['history'] = object_positions[detection_id]['history'][-FRAME_HISTORY:]

                # Update position history
                current_detections[detection_id]['history'].append({
                    'timestamp': timestamp,
                    'center': (center_x, center_y)
                })

                # Analyze movement
                movement_state = "Stationary"
                if len(current_detections[detection_id]['history']) >= 2:
                    prev_pos = current_detections[detection_id]['history'][-2]['center']
                    curr_pos = current_detections[detection_id]['history'][-1]['center']
                    
                    distance = np.sqrt((curr_pos[0] - prev_pos[0])**2 + 
                                    (curr_pos[1] - prev_pos[1])**2)
                    
                    if distance > MOVEMENT_THRESHOLD:
                        # Estimate speed based on distance
                        if distance > MOVEMENT_THRESHOLD * 2:
                            movement_state = "Running"
                        else:
                            movement_state = "Walking"

                # Log detailed information
                # print(f"Object Detection - ID: {detection_id}")
                # print(f"  Timestamp: {timestamp}")
                # print(f"  Type: {classNames[classId - 1].upper()}")
                # print(f"  Confidence: {conf:.2f}")
                # print(f"  Bounding Box (pixels):")
                # print(f"    Top-left: ({x}, {y})")
                # print(f"    Bottom-right: ({x + w_box}, {y + h_box})")
                # print(f"    Center: ({center_x}, {center_y})")
                # print(f"    Dimensions: {w_box}x{h_box}")
                # print(f"  Normalized Coordinates:")
                # print(f"    Top-left: ({x/w:.3f}, {y/h:.3f})")
                # print(f"    Bottom-right: ({(x + w_box)/w:.3f}, {(y + h_box)/h:.3f})")
                # print(f"    Center: ({center_x/w:.3f}, {center_y/h:.3f})")
                # print(f"  Movement State: {movement_state}")
                # if len(current_detections[detection_id]['history']) >= 2:
                #     print(f"  Distance from last position: {distance:.1f} pixels")
                # print(f"  Frame dimensions: {w}x{h}")
                # if is_person:
                #     print(f"  Person ID: {person_id}")
                # print("-" * 50)

                # Draw on frame
                cvzone.cornerRect(frame, (x, y, w_box, h_box))
                
                # Add class name and confidence
                cv2.putText(frame, 
                           f'{classNames[classId - 1].upper()} {round(conf * 100, 2)}%',
                           (x + 10, y + 30), 
                           cv2.FONT_HERSHEY_COMPLEX_SMALL,
                           1, (0, 255, 0), 2)
                
                # Add movement state
                cv2.putText(frame, 
                           f'State: {movement_state}',
                           (x + 10, y + 50),
                           cv2.FONT_HERSHEY_COMPLEX_SMALL,
                           0.7, (0, 255, 0), 1)
                
                # Add person ID if this is a person
                if is_person:
                    # Draw ID with a background for better visibility
                    id_text = f"ID: {person_id}"
                    text_size = cv2.getTextSize(id_text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
                    
                    # Draw background rectangle for text
                    cv2.rectangle(frame, 
                                 (x, y - text_size[1] - 10), 
                                 (x + text_size[0] + 10, y), 
                                 (0, 0, 0), -1)
                    
                    # Draw ID text
                    cv2.putText(frame, id_text,
                               (x + 5, y - 5),
                               cv2.FONT_HERSHEY_SIMPLEX,
                               0.8, (255, 255, 255), 2)

        # Update object positions
        object_positions = current_detections

        # Debug info - show number of people being tracked
        person_count = len([pid for pid in person_database.keys()])
        cv2.putText(frame, f"Tracking {person_count} people", (10, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)

        # Convert to bytes for streaming
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

            # Debug info - show number of people being tracked
            person_count = len([pid for pid in person_database.keys()])
            cv2.putText(frame, f"Tracking {person_count} people", (10, 70),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)

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

@app.route('/person_database')
def get_person_database():
    """Return current person tracking data"""
    person_info = {}
    for person_id, data in person_database.items():
        person_info[person_id] = {
            "last_seen": data["last_seen"],
            "position": data["position"],
            "frames_tracked": data["frames_tracked"]
        }
    return {'persons': person_info}

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
