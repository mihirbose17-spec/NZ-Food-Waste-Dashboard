from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import random
from dotenv import load_dotenv
import google.generativeai as genai

# Load the hidden vault
load_dotenv()

# Check the toggle switch (defaults to False if not found)
USE_LIVE_AI = os.getenv("USE_LIVE_AI", "False").lower() in ("true", "1", "t")

secure_api_key = os.getenv("GEMINI_API_KEY")

# Only initialize the AI model if the toggle is ON
if USE_LIVE_AI and secure_api_key:
    genai.configure(api_key=secure_api_key)
    model = genai.GenerativeModel('gemini-3.5-flash',
                                  generation_config={"response_mime_type": "application/json"})

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    mode = "LIVE AI" if USE_LIVE_AI else "DEV MODE (Mock Data)"
    return {"message": f"AI Circular Food System API is Running securely in {mode}"}


@app.get("/api/predict")
def get_prediction():
    if USE_LIVE_AI:
        prompt = """
        Generate a unique, highly realistic retail food waste prediction scenario for a New Zealand supermarket.
        Return ONLY a JSON object with this exact structure:
        {
          "sector": "Retail - [Specific NZ Supermarket Chain or Region]",
          "flagged_category": "[Specific perishable category, e.g., Artisan Bread, Stone Fruit, Dairy]",
          "predicted_excess_tonnes": [integer between 5 and 50],
          "ai_recommendation": "1 specific sentence recommending a purchase order adjustment."
        }
        """
        response = model.generate_content(prompt)
        return json.loads(response.text)

    # MOCK DATA (Zero API Cost)
    return {
        "sector": "Retail - [DEV MODE]",
        "flagged_category": "Bakery & Fresh Produce",
        "predicted_excess_tonnes": random.randint(12, 45),
        "ai_recommendation": "[DEV MODE] Reduce next 48hr purchase orders by 18% to align with localized demand drop."
    }


@app.get("/api/redistribute")
def get_redistribution_match():
    if USE_LIVE_AI:
        prompt = """
        Generate a unique, highly realistic farm-level food waste redistribution scenario in New Zealand.
        Return ONLY a JSON object with this exact structure:
        {
          "source": "Primary Production - [Specific NZ Region and Farm Type]",
          "available_tonnes": [float between 1.0 and 15.0],
          "matched_buyer": "[Specific type of secondary buyer]",
          "logistics_status": "1 specific sentence about automated transport routing."
        }
        """
        response = model.generate_content(prompt)
        return json.loads(response.text)

    # MOCK DATA (Zero API Cost)
    return {
        "source": "Primary Production - Hawke's Bay Apple Orchard",
        "available_tonnes": round(random.uniform(2.0, 8.5), 1),
        "matched_buyer": "Local Juicery Inc. [DEV MODE]",
        "logistics_status": "Automated transport routed for 14:00 today."
    }


@app.get("/api/convert")
def get_bioprocessing_route():
    if USE_LIVE_AI:
        prompt = """
        Generate a unique, highly realistic end-of-life circular conversion scenario for organic waste in New Zealand.
        Return ONLY a JSON object with this exact structure:
        {
          "waste_type": "[Specific unsalvageable waste]",
          "volume_tonnes": [float between 0.5 and 10.0],
          "destination": "[Specific NZ Bioprocessing plant]",
          "environmental_impact": "1 specific sentence quantifying CO2 or methane prevented."
        }
        """
        response = model.generate_content(prompt)
        return json.loads(response.text)

    # MOCK DATA (Zero API Cost)
    return {
        "waste_type": "Unsalvageable Organic [DEV MODE]",
        "volume_tonnes": round(random.uniform(1.0, 4.0), 1),
        "destination": "Regional Anaerobic Digestion Plant",
        "environmental_impact": "Prevents methane emissions equivalent to taking 12 cars off the road."
    }


@app.get("/api/generate-brief")
def generate_implementation_brief():
    if USE_LIVE_AI:
        prompt = """
        You are an AI optimization engine managing a circular food system in Aotearoa New Zealand.
        Generate a strategic, highly professional implementation brief to intervene and reduce supply chain food waste.
        Make it sound like a consulting report for operations managers.
        You must return ONLY a JSON object with this exact structure:
        {
          "title": "A professional, catchy strategy title",
          "executive_summary": "1 to 2 sentences summarizing the intervention within a specific New Zealand context.",
          "action_steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
          "projected_impact": "1 specific sentence detailing environmental and economic savings."
        }
        """
        response = model.generate_content(prompt)
        return json.loads(response.text)

    # MOCK DATA (Zero API Cost)
    import time
    time.sleep(1)  # Simulate AI thinking time so the button still looks real
    return {
        "title": "[DEV MODE] Automated Primary Production Salvage Protocol",
        "executive_summary": "This is a simulated brief to save your API limits while developing the frontend interface.",
        "action_steps": [
            "1. Activate Computer Vision QA to verify Grade-B status.",
            "2. Trigger Smart Contract with secondary buyers.",
            "3. Route Logistics bypassing centralized packinghouses."
        ],
        "projected_impact": "Recovers simulated revenue and prevents simulated CO2 emissions."
    }