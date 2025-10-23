#!/usr/bin/env python3
"""
Property Data Collection Helper for GeoCLIP Testing
Helps collect Portuguese property images with known addresses for testing
"""

import json
import requests
from typing import List, Dict, Tuple
import time
import random

class PropertyDataCollector:
    """Helper class for collecting Portuguese property data"""
    
    def __init__(self):
        self.properties = []
    
    def add_property(self, image_url: str, address: str, coords: Tuple[float, float], 
                    source: str = "manual", additional_info: Dict = None):
        """
        Add a property to the test dataset
        
        Args:
            image_url: URL to the property image
            address: Human-readable address
            coords: (latitude, longitude) tuple
            source: Source of the data (e.g., "idealista", "imovirtual")
            additional_info: Additional property information
        """
        property_data = {
            'image_url': image_url,
            'actual_address': address,
            'actual_coords': coords,
            'source': source,
            'collected_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'additional_info': additional_info or {}
        }
        
        self.properties.append(property_data)
        print(f"✅ Added property: {address}")
    
    def save_to_file(self, filename: str = "portuguese_properties.json"):
        """Save collected properties to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.properties, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved {len(self.properties)} properties to {filename}")
    
    def load_from_file(self, filename: str = "portuguese_properties.json"):
        """Load properties from JSON file"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                self.properties = json.load(f)
            print(f"📂 Loaded {len(self.properties)} properties from {filename}")
        except FileNotFoundError:
            print(f"❌ File {filename} not found")
            self.properties = []
    
    def validate_image_url(self, url: str) -> bool:
        """Validate that image URL is accessible"""
        try:
            response = requests.head(url, timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_sample_properties(self) -> List[Dict]:
        """Get sample Portuguese properties for testing"""
        return [
            {
                'image_url': 'https://example.com/cascais_property.jpg',
                'actual_address': 'Cascais, Lisboa',
                'actual_coords': (38.6979, -9.4213),
                'source': 'sample',
                'additional_info': {'region': 'Lisboa', 'type': 'apartment'}
            },
            {
                'image_url': 'https://example.com/porto_property.jpg',
                'actual_address': 'Porto, Porto',
                'actual_coords': (41.1579, -8.6291),
                'source': 'sample',
                'additional_info': {'region': 'Porto', 'type': 'house'}
            },
            {
                'image_url': 'https://example.com/coimbra_property.jpg',
                'actual_address': 'Coimbra, Coimbra',
                'actual_coords': (40.2033, -8.4103),
                'source': 'sample',
                'additional_info': {'region': 'Coimbra', 'type': 'apartment'}
            }
        ]

def create_portuguese_property_dataset():
    """Create a comprehensive Portuguese property dataset for testing"""
    
    collector = PropertyDataCollector()
    
    # Major Portuguese cities with coordinates
    portuguese_cities = [
        ("Lisboa", (38.7223, -9.1393)),
        ("Porto", (41.1579, -8.6291)),
        ("Braga", (41.5518, -8.4229)),
        ("Coimbra", (40.2033, -8.4103)),
        ("Aveiro", (40.6405, -8.6538)),
        ("Faro", (37.0194, -7.9322)),
        ("Évora", (38.5665, -7.9075)),
        ("Setúbal", (38.5244, -8.8882)),
        ("Cascais", (38.6979, -9.4213)),
        ("Sintra", (38.8029, -9.3787)),
        ("Funchal", (32.6669, -16.9241)),  # Madeira
        ("Ponta Delgada", (37.7412, -25.6756)),  # Azores
    ]
    
    print("🏠 Portuguese Property Dataset Collection")
    print("="*50)
    print("📋 Instructions:")
    print("1. For each city, find 3-5 property images from:")
    print("   • Idealista.pt")
    print("   • Imovirtual.com")
    print("   • OLX.pt")
    print("   • Supercasa.pt")
    print("2. Get the exact coordinates (lat, lon)")
    print("3. Note the full address")
    print("4. Save the image URL")
    print("\n🎯 Target: 50 properties total")
    
    # Add sample properties
    sample_properties = collector.get_sample_properties()
    for prop in sample_properties:
        collector.add_property(
            prop['image_url'],
            prop['actual_address'],
            prop['actual_coords'],
            prop['source'],
            prop['additional_info']
        )
    
    # Save initial dataset
    collector.save_to_file("portuguese_properties.json")
    
    print(f"\n📊 Current dataset: {len(collector.properties)} properties")
    print("💡 Add more properties by editing the JSON file or using the collector.add_property() method")
    
    return collector

def main():
    """Main function"""
    print("🚀 Portuguese Property Data Collection for GeoCLIP Testing")
    print("="*60)
    
    # Create dataset
    collector = create_portuguese_property_dataset()
    
    print("\n📋 Next steps:")
    print("1. Collect more property images with known addresses")
    print("2. Update portuguese_properties.json with real data")
    print("3. Run: python test_geoclip_portuguese.py")
    
    print("\n🎯 Recommended property sources:")
    print("• Idealista.pt - High-quality images")
    print("• Imovirtual.com - Good variety")
    print("• OLX.pt - Local properties")
    print("• Supercasa.pt - Premium listings")

if __name__ == "__main__":
    main()
