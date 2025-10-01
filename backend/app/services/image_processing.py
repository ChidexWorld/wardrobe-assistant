from PIL import Image, ImageEnhance
import cv2
import numpy as np
from pathlib import Path
import asyncio
from typing import Tuple, Dict, Any

class ImageProcessor:
    def __init__(self):
        self.max_size = (800, 800)
        self.thumbnail_size = (200, 200)

    async def process_clothing_image(self, image_path: Path) -> Path:
        """Process uploaded clothing image: resize, enhance, extract features"""

        try:
            # Open and process image
            with Image.open(image_path) as img:
                # Convert to RGB if needed
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                # Resize to max dimensions while maintaining aspect ratio
                img.thumbnail(self.max_size, Image.Resampling.LANCZOS)

                # Enhance image quality
                img = self._enhance_image(img)

                # Save processed image
                processed_path = image_path.parent / f"processed_{image_path.name}"
                img.save(processed_path, "JPEG", quality=85, optimize=True)

                # Create thumbnail
                thumbnail_path = image_path.parent / f"thumb_{image_path.name}"
                thumb = img.copy()
                thumb.thumbnail(self.thumbnail_size, Image.Resampling.LANCZOS)
                thumb.save(thumbnail_path, "JPEG", quality=80)

                return processed_path

        except Exception as e:
            raise Exception(f"Image processing failed: {str(e)}")

    def _enhance_image(self, img: Image.Image) -> Image.Image:
        """Apply basic image enhancements"""

        # Slightly increase contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.1)

        # Slightly increase sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.1)

        return img

    async def extract_clothing_features(self, image_path: Path) -> Dict[str, Any]:
        """Extract features from clothing image for AI analysis"""

        try:
            # Load image with OpenCV
            img = cv2.imread(str(image_path))
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Extract dominant colors
            colors = self._extract_dominant_colors(img_rgb)

            # Detect clothing type (simplified)
            clothing_type = self._detect_clothing_type(img_rgb)

            # Extract texture features (simplified)
            texture = self._analyze_texture(img_rgb)

            return {
                "dominant_colors": colors,
                "detected_type": clothing_type,
                "texture_features": texture,
                "image_dimensions": img.shape[:2]
            }

        except Exception as e:
            return {
                "error": f"Feature extraction failed: {str(e)}",
                "dominant_colors": [],
                "detected_type": "unknown",
                "texture_features": {}
            }

    def _extract_dominant_colors(self, img: np.ndarray, k: int = 3) -> list:
        """Extract dominant colors using K-means clustering"""

        try:
            # Reshape image to be a list of pixels
            data = img.reshape((-1, 3))
            data = np.float32(data)

            # Apply K-means
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
            _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

            # Convert centers to integer values and to list
            centers = np.uint8(centers)
            colors = centers.tolist()

            return colors

        except:
            return [[128, 128, 128]]  # Default gray if extraction fails

    def _detect_clothing_type(self, img: np.ndarray) -> str:
        """Simple clothing type detection based on image dimensions and shape analysis"""

        height, width = img.shape[:2]
        aspect_ratio = height / width

        # Very simplified logic - in practice, you'd use a trained ML model
        if aspect_ratio > 1.5:
            return "dress" if aspect_ratio > 2.0 else "shirt"
        elif aspect_ratio < 0.8:
            return "pants"
        else:
            return "casual"

    def _analyze_texture(self, img: np.ndarray) -> Dict[str, float]:
        """Analyze texture features using simple statistical methods"""

        try:
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

            # Calculate texture features
            mean_intensity = np.mean(gray)
            std_intensity = np.std(gray)

            # Calculate gradient magnitude for texture roughness
            grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
            texture_roughness = np.mean(gradient_magnitude)

            return {
                "mean_intensity": float(mean_intensity),
                "intensity_variation": float(std_intensity),
                "texture_roughness": float(texture_roughness)
            }

        except:
            return {
                "mean_intensity": 128.0,
                "intensity_variation": 0.0,
                "texture_roughness": 0.0
            }

    async def create_outfit_visualization(self, clothing_items: list) -> Path:
        """Create a visual representation of an outfit combination"""

        # This would create a composite image showing the outfit
        # For now, return a placeholder
        return Path("static/outfits/placeholder_outfit.jpg")