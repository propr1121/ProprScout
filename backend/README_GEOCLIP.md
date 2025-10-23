# GeoCLIP Portuguese Property Location Prediction

This setup enables testing GeoCLIP's accuracy on Portuguese property images for location prediction.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install Python dependencies
pip install torch torchvision pillow requests numpy matplotlib seaborn pandas scikit-learn tqdm

# Install GeoCLIP from GitHub
pip install git+https://github.com/VicenteVivan/geo-clip.git
```

### 2. Run Setup Script
```bash
python setup_geoclip.py
```

### 3. Collect Property Data
```bash
python collect_property_data.py
```

### 4. Test GeoCLIP Accuracy
```bash
python test_geoclip_portuguese.py
```

## 📋 Requirements

- Python 3.7+
- 8GB+ RAM (for GeoCLIP model)
- Internet connection (for downloading images)

## 🏠 Property Data Collection

### Target: 50 Portuguese Properties

**Major Cities to Include:**
- Lisboa (Lisbon)
- Porto
- Braga
- Coimbra
- Aveiro
- Faro
- Évora
- Setúbal
- Cascais
- Sintra
- Funchal (Madeira)
- Ponta Delgada (Azores)

### Property Sources
- **Idealista.pt** - High-quality images
- **Imovirtual.com** - Good variety
- **OLX.pt** - Local properties
- **Supercasa.pt** - Premium listings

### Data Format
Each property needs:
```json
{
  "image_url": "https://example.com/property.jpg",
  "actual_address": "Cascais, Lisboa",
  "actual_coords": [38.6979, -9.4213],
  "source": "idealista",
  "additional_info": {
    "region": "Lisboa",
    "type": "apartment"
  }
}
```

## 🎯 Testing Accuracy

The test script evaluates GeoCLIP on multiple distance thresholds:

- **1km** - Very precise (urban level)
- **5km** - City district level
- **10km** - City level
- **25km** - Regional level

### Expected Results
- **1km accuracy**: 20-40% (very challenging)
- **5km accuracy**: 40-70% (good performance)
- **10km accuracy**: 60-85% (excellent)
- **25km accuracy**: 80-95% (outstanding)

## 📊 Output Files

The test generates:
- `geoclip_results_1km.json` - 1km threshold results
- `geoclip_results_5km.json` - 5km threshold results
- `geoclip_results_10km.json` - 10km threshold results
- `geoclip_results_25km.json` - 25km threshold results

## 🔧 Customization

### Add Your Own Properties
```python
from collect_property_data import PropertyDataCollector

collector = PropertyDataCollector()
collector.add_property(
    image_url="https://your-property-image.jpg",
    address="Your Address, City",
    coords=(latitude, longitude),
    source="your_source"
)
collector.save_to_file("your_properties.json")
```

### Modify Test Parameters
```python
# In test_geoclip_portuguese.py
thresholds = [1.0, 5.0, 10.0, 25.0]  # km
distance_threshold_km = 5.0  # Default threshold
```

## 🐛 Troubleshooting

### Common Issues

1. **"ModuleNotFoundError: No module named 'geoclip'"**
   ```bash
   pip install git+https://github.com/VicenteVivan/geo-clip.git
   ```

2. **"CUDA out of memory"**
   - Reduce batch size or use CPU
   - Close other applications

3. **"Image loading failed"**
   - Check image URLs are accessible
   - Verify internet connection

4. **"Low accuracy"**
   - Ensure property images show location features
   - Check coordinate accuracy
   - Try different distance thresholds

## 📈 Performance Tips

- Use high-quality property images
- Include diverse locations (urban, rural, coastal)
- Ensure accurate coordinates
- Test with different distance thresholds
- Consider image preprocessing

## 🎯 Integration with ProprScout

This GeoCLIP testing can be integrated into ProprScout for:
- Property location verification
- Address validation
- Location-based analysis
- Market area identification

## 📚 References

- [GeoCLIP GitHub](https://github.com/VicenteVivan/geo-clip)
- [GeoCLIP Paper](https://arxiv.org/abs/2301.10113)
- [Portuguese Property Portals](https://www.idealista.pt/)

## 🤝 Contributing

To add more Portuguese properties:
1. Find property images with known addresses
2. Get exact coordinates (lat, lon)
3. Add to `portuguese_properties.json`
4. Run the test script
5. Share results!

---

**Note**: This is for research and testing purposes. Always respect website terms of service when collecting property data.
