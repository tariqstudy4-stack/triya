import numpy as np
from scipy import stats
from typing import Dict, Any, Union

def generate_samples(dist_config: Dict[str, Any], iterations: int = 1000) -> np.ndarray:
    """
    Generates N random samples based on the provided distribution configuration.
    
    Supported types: normal, lognormal, triangular, uniform
    """
    dist_type = dist_config.get('type', 'deterministic').lower()
    
    if dist_type == 'deterministic':
        value = float(dist_config.get('value', 0.0))
        return np.full(iterations, value)
    
    params = dist_config.get('params', {})
    
    if dist_type == 'normal':
        mean = float(params.get('mean', 1.0))
        std = float(params.get('std', 0.1))
        return np.random.normal(mean, std, iterations)
    
    elif dist_type == 'lognormal':
        # geom_mean (mu*), geom_sd (sigma*)
        # mu = ln(geom_mean), sigma = ln(geom_sd)
        geom_mean = float(params.get('geom_mean', 1.0))
        geom_sd = float(params.get('geom_sd', 1.2))
        return np.random.lognormal(np.log(geom_mean), np.log(geom_sd), iterations)
    
    elif dist_type == 'triangular':
        left = float(params.get('min', 0.8))
        mode = float(params.get('mode', 1.0))
        right = float(params.get('max', 1.2))
        # numpy.random.triangular(left, mode, right, size)
        return np.random.triangular(left, mode, right, iterations)
    
    elif dist_type == 'uniform':
        low = float(params.get('min', 0.0))
        high = float(params.get('max', 1.0))
        return np.random.uniform(low, high, iterations)
    
    # Fallback to deterministic
    value = float(dist_config.get('value', 0.0))
    return np.full(iterations, value)

def calculate_stats(samples: np.ndarray) -> Dict[str, float]:
    """
    Calculates descriptive statistics for a sample array.
    """
    if len(samples) == 0:
        return {}
        
    return {
        "mean": float(np.mean(samples)),
        "median": float(np.median(samples)),
        "std": float(np.std(samples)),
        "p5": float(np.percentile(samples, 5)),
        "p95": float(np.percentile(samples, 95)),
        "min": float(np.min(samples)),
        "max": float(np.max(samples))
    }
