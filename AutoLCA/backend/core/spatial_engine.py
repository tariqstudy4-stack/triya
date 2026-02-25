import json
from shapely.geometry import shape, Point
from typing import Optional, Dict, List
import os

class SpatialEngine:
    """
    Engine for resolving coordinates into regional IDs using GeoJSON spatial data.
    Designed for Location-Based Spatial Regionalization (AWARE v1.2 etc).
    """
    def __init__(self, geojson_path: Optional[str] = None):
        self.regions = [] # List of (geometry, properties)
        if geojson_path and os.path.exists(geojson_path):
            self.load_geojson(geojson_path)
        else:
            # Load a minimal mock GeoJSON if no path provided for demo
            self._load_mock_data()

    def load_geojson(self, path: str):
        with open(path, 'r') as f:
            data = json.load(f)
            if data['type'] == 'FeatureCollection':
                for feature in data['features']:
                    geom = shape(feature['geometry'])
                    props = feature['properties']
                    self.regions.append((geom, props))

    def _load_mock_data(self):
        # Mini mockup: Watersheds in different regions
        # US, EU, GLO (Mocked as boxes)
        mock_features = [
            {
                "type": "Feature",
                "properties": {"region_id": "US", "name": "United States Watershed"},
                "geometry": {"type": "Polygon", "coordinates": [[[-125, 24], [-125, 49], [-66, 49], [-66, 24], [-125, 24]]]}
            },
            {
                "type": "Feature",
                "properties": {"region_id": "EU", "name": "European Watershed"},
                "geometry": {"type": "Polygon", "coordinates": [[[-10, 35], [-10, 70], [30, 70], [30, 35], [-10, 35]]]}
            }
        ]
        for feature in mock_features:
            geom = shape(feature['geometry'])
            props = feature['properties']
            self.regions.append((geom, props))

    def resolve_region_from_coords(self, lat: float, lng: float) -> str:
        """
        Intersects a point with loaded polygons to find the region ID.
        Returns 'GLO' as fallback.
        """
        point = Point(lng, lat) # Shapely uses (x, y) order
        for geom, props in self.regions:
            if geom.contains(point):
                return props.get('region_id', 'GLO')
        return 'GLO'

    def get_hierarchical_fallback(self, region_id: str) -> List[str]:
        """
        Returns a list of regions to check in order of priority.
        Example: 'US-CA' -> ['US-CA', 'US', 'RER', 'GLO']
        """
        # Simple heuristic mapping for demo
        hierarchy = [region_id]
        
        # If it's a sub-region (hyphenated), add the parent nation
        if '-' in region_id:
            parent = region_id.split('-')[0]
            if parent not in hierarchy:
                hierarchy.append(parent)
        
        # Add Continental and Global fallbacks
        if region_id not in ['RER', 'GLO']:
            hierarchy.append('RER') # Rest of World/Europe/Continental
        if 'GLO' not in hierarchy:
            hierarchy.append('GLO')
            
        return hierarchy

# Singleton instance
spatial_engine = SpatialEngine()
