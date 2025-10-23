#!/usr/bin/env python3
"""
GeoCLIP Portuguese Property Location Prediction Test
Tests GeoCLIP model accuracy on Portuguese property images with known addresses
"""

import torch
import requests
from PIL import Image
import io
import math
from typing import List, Dict, Tuple
import json
import time
import random

# Install required packages if not already installed
try:
    from geoclip import GeoCLIP
except ImportError:
    print("Installing GeoCLIP...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "git+https://github.com/VicenteVivan/geo-clip.git"])
    from geoclip import GeoCLIP

def haversine_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Calculate the great circle distance between two points on Earth (in kilometers)
    """
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    return c * r

def load_image_from_url(url: str) -> Image.Image:
    """Load image from URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content))
    except Exception as e:
        print(f"Error loading image from {url}: {e}")
        return None

class GeoCLIPTester:
    def __init__(self):
        """Initialize GeoCLIP model"""
        print("Loading GeoCLIP model...")
        self.model = GeoCLIP()
        print("✅ GeoCLIP model loaded successfully!")
    
    def predict_location(self, image_url: str) -> Tuple[float, float]:
        """
        Predict location from property image
        Returns: (latitude, longitude)
        """
        try:
            # Load image
            image = load_image_from_url(image_url)
            if image is None:
                raise ValueError("Could not load image")
            
            # Predict coordinates
            coords = self.model.predict(image)
            return coords
        except Exception as e:
            print(f"Error predicting location for {image_url}: {e}")
            return None, None
    
    def validate_accuracy(self, test_properties: List[Dict], distance_threshold_km: float = 5.0) -> Dict:
        """
        Test GeoCLIP accuracy on Portuguese property images
        
        Args:
            test_properties: List of property dictionaries with image_url, actual_address, actual_coords
            distance_threshold_km: Distance threshold for considering prediction correct (default: 5km)
        
        Returns:
            Dictionary with accuracy metrics
        """
        print(f"\n🔍 Testing GeoCLIP accuracy on {len(test_properties)} Portuguese properties...")
        print(f"Distance threshold: {distance_threshold_km}km")
        
        correct_predictions = 0
        total_predictions = 0
        distances = []
        errors = []
        
        for i, prop in enumerate(test_properties):
            print(f"\n📍 Property {i+1}/{len(test_properties)}: {prop.get('actual_address', 'Unknown')}")
            
            try:
                # Predict location
                predicted_lat, predicted_lon = self.predict_location(prop['image_url'])
                
                if predicted_lat is None or predicted_lon is None:
                    print("❌ Prediction failed")
                    errors.append(f"Property {i+1}: Prediction failed")
                    continue
                
                # Calculate distance
                actual_coords = prop['actual_coords']
                distance_km = haversine_distance(
                    (predicted_lat, predicted_lon),
                    actual_coords
                )
                
                distances.append(distance_km)
                total_predictions += 1
                
                # Check if prediction is within threshold
                if distance_km <= distance_threshold_km:
                    correct_predictions += 1
                    print(f"✅ Correct! Distance: {distance_km:.2f}km")
                else:
                    print(f"❌ Incorrect. Distance: {distance_km:.2f}km")
                
                print(f"   Predicted: ({predicted_lat:.4f}, {predicted_lon:.4f})")
                print(f"   Actual: {actual_coords}")
                
            except Exception as e:
                print(f"❌ Error processing property {i+1}: {e}")
                errors.append(f"Property {i+1}: {str(e)}")
        
        # Calculate metrics
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        avg_distance = sum(distances) / len(distances) if distances else float('inf')
        median_distance = sorted(distances)[len(distances)//2] if distances else float('inf')
        
        results = {
            'total_properties': len(test_properties),
            'successful_predictions': total_predictions,
            'correct_predictions': correct_predictions,
            'accuracy_percentage': accuracy * 100,
            'average_distance_km': avg_distance,
            'median_distance_km': median_distance,
            'distance_threshold_km': distance_threshold_km,
            'errors': errors,
            'distances': distances
        }
        
        return results
    
    def print_results(self, results: Dict):
        """Print formatted results"""
        print("\n" + "="*60)
        print("🎯 GeoCLIP Portuguese Property Location Prediction Results")
        print("="*60)
        
        print(f"📊 Total Properties Tested: {results['total_properties']}")
        print(f"✅ Successful Predictions: {results['successful_predictions']}")
        print(f"🎯 Correct Predictions: {results['correct_predictions']}")
        print(f"📈 Accuracy: {results['accuracy_percentage']:.1f}%")
        print(f"📏 Average Distance: {results['average_distance_km']:.2f}km")
        print(f"📏 Median Distance: {results['median_distance_km']:.2f}km")
        print(f"🎯 Distance Threshold: {results['distance_threshold_km']}km")
        
        if results['errors']:
            print(f"\n❌ Errors ({len(results['errors'])}):")
            for error in results['errors'][:5]:  # Show first 5 errors
                print(f"   • {error}")
            if len(results['errors']) > 5:
                print(f"   ... and {len(results['errors']) - 5} more errors")
        
        print("\n" + "="*60)

def create_sample_test_data() -> List[Dict]:
    """
    Create sample test data for Portuguese properties
    Note: Replace with actual property images and coordinates
    """
    return [
        {
            'image_url': 'https://example.com/property1.jpg',
            'actual_address': 'Cascais, Lisboa',
            'actual_coords': (38.6979, -9.4213)
        },
        {
            'image_url': 'https://example.com/property2.jpg', 
            'actual_address': 'Porto, Porto',
            'actual_coords': (41.1579, -8.6291)
        },
        {
            'image_url': 'https://example.com/property3.jpg',
            'actual_address': 'Coimbra, Coimbra',
            'actual_coords': (40.2033, -8.4103)
        },
        # Add more properties as needed...
    ]

def main():
    """Main test function"""
    print("🚀 Starting GeoCLIP Portuguese Property Location Prediction Test")
    print("="*70)
    
    # Initialize tester
    tester = GeoCLIPTester()
    
    # Create test data (replace with your actual property data)
    test_properties = create_sample_test_data()
    
    print(f"\n📋 Test Properties: {len(test_properties)}")
    for i, prop in enumerate(test_properties):
        print(f"   {i+1}. {prop['actual_address']} - {prop['image_url']}")
    
    # Test with different distance thresholds
    thresholds = [1.0, 5.0, 10.0, 25.0]  # km
    
    for threshold in thresholds:
        print(f"\n🎯 Testing with {threshold}km threshold...")
        results = tester.validate_accuracy(test_properties, threshold)
        tester.print_results(results)
        
        # Save results to file
        with open(f'geoclip_results_{threshold}km.json', 'w') as f:
            json.dump(results, f, indent=2)
        print(f"💾 Results saved to geoclip_results_{threshold}km.json")

if __name__ == "__main__":
    main()
