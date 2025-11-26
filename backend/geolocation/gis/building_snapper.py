"""
GIS-based building footprint snapping
Uses OpenStreetMap Overpass API for building data
"""

import json
from pathlib import Path
import logging
import requests

logger = logging.getLogger(__name__)

# Try to import GIS libraries, allow graceful fallback
try:
    import geopandas as gpd
    from shapely.geometry import Point, Polygon
    GIS_AVAILABLE = True
except ImportError:
    GIS_AVAILABLE = False
    logger.warning("GIS libraries not available - building snapping will be disabled")


class BuildingSnapper:
    """
    Snaps predicted coordinates to nearest building footprint.
    Uses OpenStreetMap Overpass API for building data.
    """

    def __init__(self, cache_dir: str = None):
        self.cache_dir = Path(cache_dir) if cache_dir else Path('data/gis_cache')
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.buildings_gdf = None

    def load_buildings_for_area(self, lat: float, lon: float, radius_m: float = 500):
        """
        Load building footprints for area around coordinates.
        Uses Overpass API to query OSM buildings.

        Args:
            lat: Latitude
            lon: Longitude
            radius_m: Search radius in meters
        """
        if not GIS_AVAILABLE:
            logger.warning("GIS libraries not available")
            return

        cache_key = f"{lat:.3f}_{lon:.3f}_{int(radius_m)}"
        cache_file = self.cache_dir / f"buildings_{cache_key}.geojson"

        if cache_file.exists():
            logger.info(f"Loading cached buildings from {cache_file}")
            self.buildings_gdf = gpd.read_file(cache_file)
            return

        # Query Overpass API
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:30];
        (
          way["building"](around:{radius_m},{lat},{lon});
          relation["building"](around:{radius_m},{lat},{lon});
        );
        out body;
        >;
        out skel qt;
        """

        try:
            response = requests.post(overpass_url, data={'data': query}, timeout=60)
            response.raise_for_status()
            data = response.json()

            # Convert to GeoDataFrame
            buildings = self._osm_to_geodataframe(data)
            if not buildings.empty:
                buildings.to_file(cache_file, driver='GeoJSON')
                self.buildings_gdf = buildings
                logger.info(f"Cached {len(buildings)} buildings to {cache_file}")
            else:
                logger.warning(f"No buildings found near {lat}, {lon}")
                self.buildings_gdf = gpd.GeoDataFrame()

        except Exception as e:
            logger.error(f"Failed to fetch buildings: {e}")
            self.buildings_gdf = gpd.GeoDataFrame() if GIS_AVAILABLE else None

    def _osm_to_geodataframe(self, osm_data: dict):
        """Convert OSM Overpass response to GeoDataFrame"""
        if not GIS_AVAILABLE:
            return None

        # Build node lookup
        nodes = {}
        for elem in osm_data.get('elements', []):
            if elem['type'] == 'node':
                nodes[elem['id']] = (elem['lon'], elem['lat'])

        # Build building polygons
        buildings = []
        for elem in osm_data.get('elements', []):
            if elem['type'] == 'way' and 'nodes' in elem:
                coords = [nodes.get(n) for n in elem['nodes'] if n in nodes]
                if len(coords) >= 4:  # Valid polygon needs at least 4 points
                    try:
                        poly = Polygon(coords)
                        if poly.is_valid:
                            buildings.append({
                                'geometry': poly,
                                'osm_id': elem['id'],
                                'building_type': elem.get('tags', {}).get('building', 'yes'),
                                'name': elem.get('tags', {}).get('name', ''),
                                'addr_street': elem.get('tags', {}).get('addr:street', ''),
                                'addr_number': elem.get('tags', {}).get('addr:housenumber', '')
                            })
                    except Exception:
                        continue

        if buildings:
            return gpd.GeoDataFrame(buildings, crs='EPSG:4326')
        return gpd.GeoDataFrame()

    def snap_to_building(self, lat: float, lon: float, max_distance_m: float = 150) -> dict:
        """
        Find nearest building to coordinates.

        Args:
            lat: Predicted latitude
            lon: Predicted longitude
            max_distance_m: Maximum snap distance in meters

        Returns:
            dict with building info or None if no building found
        """
        if not GIS_AVAILABLE:
            return None

        # Load buildings if not cached for this area
        if self.buildings_gdf is None or self.buildings_gdf.empty:
            self.load_buildings_for_area(lat, lon, radius_m=max_distance_m * 2)

        if self.buildings_gdf is None or self.buildings_gdf.empty:
            return None

        # Create point and find nearest building
        point = Point(lon, lat)

        # Project to meters for distance calculation (Portugal uses EPSG:3763)
        try:
            buildings_projected = self.buildings_gdf.to_crs('EPSG:3763')
            point_projected = gpd.GeoSeries([point], crs='EPSG:4326').to_crs('EPSG:3763')[0]

            # Calculate distances
            buildings_projected['distance'] = buildings_projected.geometry.distance(point_projected)

            # Find nearest within threshold
            nearest = buildings_projected[buildings_projected['distance'] <= max_distance_m]

            if nearest.empty:
                return None

            closest = nearest.loc[nearest['distance'].idxmin()]
            centroid = self.buildings_gdf.loc[closest.name].geometry.centroid

            return {
                'osm_id': closest.get('osm_id'),
                'lat': centroid.y,
                'lon': centroid.x,
                'distance_m': float(closest['distance']),
                'building_type': closest.get('building_type', 'unknown'),
                'address': f"{closest.get('addr_street', '')} {closest.get('addr_number', '')}".strip(),
                'name': closest.get('name', '')
            }

        except Exception as e:
            logger.error(f"Building snap failed: {e}")
            return None

    @property
    def is_available(self) -> bool:
        """Check if building snapping is available"""
        return GIS_AVAILABLE
