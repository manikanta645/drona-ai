"""
DRONA-AI: Pose Analysis Engine
Handles camera-based pose detection and analysis using MediaPipe.
Author: DRONA-AI System
"""

import cv2
import numpy as np
from typing import Optional, Dict, Tuple
import time
from dataclasses import dataclass
from .models import PoseData

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("WARNING: MediaPipe not available. Using simulation mode.")


class PoseAnalyzer:
    """
    Analyzes body pose from camera frames.
    Uses MediaPipe Pose for accurate landmark detection.
    Falls back to simulation if MediaPipe unavailable.
    """
    
    def __init__(self, use_simulation: bool = False):
        """
        Initialize pose analyzer.
        
        Args:
            use_simulation: Force simulation mode (for testing)
        """
        self.use_simulation = use_simulation or not MEDIAPIPE_AVAILABLE
        
        if not self.use_simulation:
            self.mp_pose = mp.solutions.pose
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=1,  # 0=lite, 1=full
                smooth_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
        else:
            print("Using POSE SIMULATION mode for testing")
    
    def analyze_frame(self, frame: np.ndarray, vidya: str = "dhanur") -> Optional[PoseData]:
        """
        Analyze a single frame and extract pose data.
        
        Args:
            frame: Image frame (numpy array)
            vidya: Vidya type (affects analysis focus)
        
        Returns:
            PoseData object or None if detection fails
        """
        if self.use_simulation:
            return self._analyze_frame_simulated()
        
        try:
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(frame_rgb)
            
            if not results.pose_landmarks:
                return None
            
            # Extract key landmarks
            landmarks = results.pose_landmarks.landmark
            pose_data = self._extract_pose_features(landmarks, vidya)
            
            return pose_data
        
        except Exception as e:
            print(f"Error analyzing frame: {e}")
            return None
    
    def _extract_pose_features(self, landmarks, vidya: str) -> PoseData:
        """
        Extract meaningful pose features from MediaPipe landmarks.
        
        Args:
            landmarks: MediaPipe pose landmarks
            vidya: Vidya type for focused analysis
        
        Returns:
            PoseData with extracted features
        """
        # MediaPipe landmark indices
        NOSE = 0
        LEFT_SHOULDER = 11
        RIGHT_SHOULDER = 12
        LEFT_ELBOW = 13
        RIGHT_ELBOW = 14
        LEFT_WRIST = 15
        RIGHT_WRIST = 16
        LEFT_HIP = 23
        RIGHT_HIP = 24
        LEFT_KNEE = 25
        RIGHT_KNEE = 26
        
        # Extract coordinates
        shoulder_left = np.array([landmarks[LEFT_SHOULDER].x, landmarks[LEFT_SHOULDER].y])
        shoulder_right = np.array([landmarks[RIGHT_SHOULDER].x, landmarks[RIGHT_SHOULDER].y])
        hip_left = np.array([landmarks[LEFT_HIP].x, landmarks[LEFT_HIP].y])
        hip_right = np.array([landmarks[RIGHT_HIP].x, landmarks[RIGHT_HIP].y])
        nose = np.array([landmarks[NOSE].x, landmarks[NOSE].y])
        
        # Calculate shoulder alignment (0-100)
        shoulder_diff = abs(shoulder_left[1] - shoulder_right[1])
        shoulder_alignment = max(0, 100 - (shoulder_diff * 200))
        
        # Calculate arm angles
        left_arm_angle = self._calculate_angle(
            landmarks[LEFT_SHOULDER], landmarks[LEFT_ELBOW], landmarks[LEFT_WRIST]
        )
        right_arm_angle = self._calculate_angle(
            landmarks[RIGHT_SHOULDER], landmarks[RIGHT_ELBOW], landmarks[RIGHT_WRIST]
        )
        avg_arm_angle = (left_arm_angle + right_arm_angle) / 2
        
        # Check spine alignment (shoulder-hip vertical alignment)
        spine_straight = abs(shoulder_left[0] - hip_left[0]) < 0.1
        
        # Calculate body balance (hip alignment similar to shoulders)
        hip_diff = abs(hip_left[1] - hip_right[1])
        body_balanced = hip_diff < 0.05
        
        # Stability score (confidence-based)
        left_shoulder_conf = landmarks[LEFT_SHOULDER].z
        right_shoulder_conf = landmarks[RIGHT_SHOULDER].z
        stability_score = (left_shoulder_conf + right_shoulder_conf) / 2 * 100
        
        # Head position
        head_position = self._determine_head_position(nose, shoulder_left, shoulder_right)
        
        # Create PoseData
        pose_data = PoseData(
            timestamp=time.time(),
            shoulder_alignment=shoulder_alignment,
            arm_angle=avg_arm_angle,
            spine_straight=spine_straight,
            head_position=head_position,
            body_balanced=body_balanced,
            stability_score=stability_score,
            movement_detected=False,  # Would need frame comparison
            confidence=min(
                landmarks[LEFT_SHOULDER].visibility,
                landmarks[RIGHT_SHOULDER].visibility
            ) * 100
        )
        
        return pose_data
    
    def _calculate_angle(self, point_a, point_b, point_c) -> float:
        """
        Calculate angle between three points.
        
        Args:
            point_a, point_b, point_c: Landmark points (a is start, b is vertex, c is end)
        
        Returns:
            Angle in degrees
        """
        a = np.array([point_a.x, point_a.y])
        b = np.array([point_b.x, point_b.y])
        c = np.array([point_c.x, point_c.y])
        
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        cosine_angle = np.clip(cosine_angle, -1, 1)
        angle = np.degrees(np.arccos(cosine_angle))
        
        return angle
    
    def _determine_head_position(self, nose, shoulder_left, shoulder_right) -> str:
        """
        Determine head position relative to shoulders.
        
        Returns:
            "forward", "tilted_left", or "tilted_right"
        """
        shoulder_center_x = (shoulder_left[0] + shoulder_right[0]) / 2
        nose_x = nose[0]
        
        diff = nose_x - shoulder_center_x
        if abs(diff) < 0.05:
            return "forward"
        elif diff < -0.05:
            return "tilted_left"
        else:
            return "tilted_right"
    
    def _analyze_frame_simulated(self) -> PoseData:
        """
        Simulate pose data for testing without camera.
        Returns realistic-looking test data.
        """
        import random
        
        pose_data = PoseData(
            timestamp=time.time(),
            shoulder_alignment=random.uniform(75, 95),
            arm_angle=random.uniform(160, 180),
            spine_straight=random.choice([True, False]),
            head_position=random.choice(["forward", "tilted_left", "tilted_right"]),
            body_balanced=random.choice([True, True, True, False]),  # 75% balanced
            stability_score=random.uniform(70, 95),
            movement_detected=random.choice([False, False, False, True]),  # 25% movement
            confidence=random.uniform(85, 99)
        )
        
        return pose_data
    
    def analyze_pose_over_time(self, frames: list, duration_seconds: float) -> list:
        """
        Analyze multiple frames over a duration.
        
        Args:
            frames: List of frame arrays
            duration_seconds: Duration of the recording
        
        Returns:
            List of PoseData objects
        """
        pose_data_list = []
        
        for frame in frames:
            pose_data = self.analyze_frame(frame)
            if pose_data:
                pose_data_list.append(pose_data)
        
        return pose_data_list
    
    def get_stability_trend(self, pose_data_list: list) -> float:
        """
        Calculate trend in stability scores (improvement or decline).
        
        Args:
            pose_data_list: List of PoseData objects
        
        Returns:
            Trend value (-1 to 1, where 1 = improving, -1 = declining)
        """
        if len(pose_data_list) < 2:
            return 0.0
        
        first_half_avg = np.mean([p.stability_score for p in pose_data_list[:len(pose_data_list)//2]])
        second_half_avg = np.mean([p.stability_score for p in pose_data_list[len(pose_data_list)//2:]])
        
        # Normalize to -1 to 1
        trend = (second_half_avg - first_half_avg) / 100
        return np.clip(trend, -1, 1)
    
    def detect_movement(self, pose_data_list: list) -> bool:
        """
        Detect if student moved significantly during attempt.
        
        Args:
            pose_data_list: List of PoseData objects
        
        Returns:
            True if significant movement detected
        """
        if len(pose_data_list) < 2:
            return False
        
        # Check arm angle variations
        arm_angles = [p.arm_angle for p in pose_data_list]
        arm_variance = np.var(arm_angles)
        
        # Check shoulder alignment variations
        alignments = [p.shoulder_alignment for p in pose_data_list]
        alignment_variance = np.var(alignments)
        
        # If variance is high, movement was detected
        return arm_variance > 50 or alignment_variance > 50


class PoseValidator:
    """
    Validates pose against lesson requirements.
    """
    
    def __init__(self):
        """Initialize pose validator"""
        self.validation_rules = self._initialize_rules()
    
    def _initialize_rules(self) -> Dict:
        """
        Initialize validation rules for each discipline.
        
        Returns:
            Dictionary of validation rules per vidya
        """
        return {
            "dhanur": {
                "shoulder_alignment_min": 80,
                "spine_straight_required": True,
                "body_balanced_required": True,
                "arm_angle_min": 170,
                "stability_threshold": 75,
                "movement_allowed": False
            },
            "khadga": {
                "shoulder_alignment_min": 75,
                "spine_straight_required": True,
                "body_balanced_required": True,
                "arm_angle_range": (120, 180),  # Arms must be in this range
                "stability_threshold": 70,
                "movement_allowed": True  # Controlled movement
            },
            "dhyana": {
                "shoulder_alignment_min": 90,  # Very strict
                "spine_straight_required": True,
                "body_balanced_required": True,
                "stability_threshold": 85,
                "movement_allowed": False
            }
        }
    
    def validate_pose(self, pose_data: PoseData, vidya: str) -> Tuple[bool, list]:
        """
        Validate pose against vidya requirements.
        
        Args:
            pose_data: PoseData to validate
            vidya: Vidya discipline
        
        Returns:
            (is_valid, list_of_errors)
        """
        errors = []
        rules = self.validation_rules.get(vidya, {})
        
        # Check shoulder alignment
        if pose_data.shoulder_alignment < rules.get("shoulder_alignment_min", 70):
            errors.append(f"Shoulder alignment too low: {pose_data.shoulder_alignment:.1f}")
        
        # Check spine
        if rules.get("spine_straight_required") and not pose_data.spine_straight:
            errors.append("Spine must be straight")
        
        # Check balance
        if rules.get("body_balanced_required") and not pose_data.body_balanced:
            errors.append("Body not balanced - check hip alignment")
        
        # Check stability
        if pose_data.stability_score < rules.get("stability_threshold", 70):
            errors.append(f"Body stability too low: {pose_data.stability_score:.1f}")
        
        is_valid = len(errors) == 0
        
        return is_valid, errors
