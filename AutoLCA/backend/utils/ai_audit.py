import google.generativeai as genai
import json
import logging
import os
import requests
from typing import Optional, Dict, Any

import google.generativeai as genai
import json
import logging
import os
import requests
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class ExecutiveCSOConsultant:
    """
    Hybrid AI Interpretation Engine:
    Supports Local (Ollama) and Cloud (BYOK Gemini) execution paths.
    """
    
    def __init__(self, engine: str = "ollama", api_key: Optional[str] = None):
        self.engine = engine.lower()
        self.api_key = api_key
        
    def _construct_prompt(self, lcia_payload: Dict[str, Any]) -> str:
        """Constructs the CSO-level system prompt from LCIA metrics."""
        summary_payload = {
            "project_name": lcia_payload.get("project_name", "Industrial Supply Chain"),
            "total_gwp": lcia_payload.get("gwp", 0.0),
            "top_hotspots": lcia_payload.get("hotspots", [])[:3],
            "is_ai_predicted": lcia_payload.get("is_ai_predicted", False)
        }
        
        system_prompt = (
            "You are a Chief Sustainability Officer (CSO). "
            "Review the provided LCA Data Summary and write exactly 3 distinct paragraphs (no headers, bolding, or lists): "
            "1. Regulatory Risk & Global Warming Hotspot (Analyze GWP and hotspots). "
            "2. Supply Chain Vulnerability (Discuss business risks for high-impact nodes). "
            "3. Actionable Recommendation (Suggest material substitution or energy optimization). "
            "Be clinical and use exact numbers. Do NOT use markdown. "
            f"LCA Data Summary: {json.dumps(summary_payload)}"
        )
        return system_prompt

    def _call_ollama(self, prompt: str) -> str:
        """Zero-cost local execution via Ollama (Llama3/Mistral)."""
        logger.info("[HYBRID AI] Triggering local Ollama audit...")
        url = "http://localhost:11434/api/generate"
        payload = {
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
        
        try:
            response = requests.post(url, json=payload, timeout=60)
            response.raise_for_status()
            return response.json().get("response", "").strip()
        except requests.exceptions.ConnectionError:
            raise ConnectionRefusedError("Ollama is not running locally on port 11434.")
        except Exception as e:
            logger.error(f"Ollama local audit failed: {e}")
            raise RuntimeError(f"Local AI Failure: {str(e)}")

    def _call_cloud(self, prompt: str) -> str:
        """Cloud execution using the user's provided API key (BYOK)."""
        logger.info("[HYBRID AI] Triggering cloud Gemini audit...")
        if not self.api_key or self.api_key == "undefined":
            raise ValueError("Cloud Gemini requires a valid API Key. Update your AI Preferences.")
        
        try:
            # Thread-Safe Request Logic: Pass API key strictly into request options context
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt, request_options={"api_key": self.api_key})
            return response.text.strip()
        except Exception as e:
            logger.error(f"Cloud Gemini audit failed: {e}")
            raise RuntimeError(f"Cloud AI Failure: {str(e)}")

    def generate_executive_verdict(self, lcia_payload: Dict[str, Any]) -> str:
        """Main orchestrator for hybrid interpreted audits."""
        prompt = self._construct_prompt(lcia_payload)
        
        try:
            if self.engine == "ollama":
                return self._call_ollama(prompt)
            elif self.engine == "gemini":
                return self._call_cloud(prompt)
            else:
                raise ValueError(f"Unsupported AI Engine: {self.engine}")
        except ConnectionRefusedError as cre:
            raise cre # Propagate for HTTP 503 handling
        except Exception as e:
            logger.error(f"Hybrid Engine Failed: {e}")
            return (
                f"Strategic Interpretation Engine Failed ({self.engine.upper()}): {str(e)}. "
                "Manual hotspot auditing recommended."
            )

# Backward compatibility wrapper for existing routes
def generate_executive_verdict(lcia_payload: dict) -> str:
    # Use default engine for non-headered requests
    # Pass key directly to instance to avoid global state contamination
    key = os.environ.get("GOOGLE_GEMINI_API_KEY", "YOUR_API_KEY")
    engine = ExecutiveCSOConsultant(engine="gemini", api_key=key)
    return engine.generate_executive_verdict(lcia_payload)
