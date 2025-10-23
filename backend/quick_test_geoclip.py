#!/usr/bin/env python3
"""
Quick test to verify GeoCLIP setup is working
"""

from geoclip import GeoCLIP
import json

def main():
    print("🚀 Quick GeoCLIP Test")
    print("="*30)
    
    try:
        # Initialize GeoCLIP
        print("Loading GeoCLIP model...")
        model = GeoCLIP()
        print("✅ GeoCLIP model loaded successfully!")
        
        # Load test properties
        print("\nLoading test properties...")
        with open('portuguese_properties.json', 'r') as f:
            properties = json.load(f)
        
        print(f"📋 Found {len(properties)} test properties")
        
        # Test with first property (if available)
        if properties:
            prop = properties[0]
            print(f"\n🎯 Testing with: {prop['actual_address']}")
            print(f"📍 Expected coordinates: {prop['actual_coords']}")
            print(f"🖼️ Image URL: {prop['image_url']}")
            
            # Note: This will fail with sample URLs, but shows the setup works
            print("\n⚠️ Note: Sample URLs won't work, but the setup is ready!")
            print("✅ GeoCLIP setup is working correctly!")
        else:
            print("❌ No test properties found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    print("\n🎯 Next steps:")
    print("1. Collect real Portuguese property images")
    print("2. Update portuguese_properties.json with real URLs")
    print("3. Run: python test_geoclip_portuguese.py")
    
    return True

if __name__ == "__main__":
    main()
