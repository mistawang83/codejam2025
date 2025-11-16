# core/services/repair_analyzer.py

import os
import json
from openai import OpenAI

REPAIR_ANALYSIS_PROMPT = """You are an expert home repair advisor. Analyze the uploaded image thoroughly and provide comprehensive repair guidance.

User's problem: "{description}"
Skill level: {skill_level}
Location (for pricing): {location}

Respond with ONLY this JSON (no markdown, no extra text):

{{
  "diagnosis": "Detailed description of the issue based on what you see in the image. Include size estimates, material type, and extent of damage.",
  "severity": "minor/moderate/severe",
  "difficulty": "Beginner/Intermediate/Advanced",
  "estimated_repair_success_rate": "Percentage chance of successful DIY repair",
  "materials": [
    {{
      "name": "Specific material name and brand recommendation",
      "quantity": 1,
      "unit": "piece/ft/sq ft/gallon/oz",
      "estimated_unit_cost": 0.00,
      "where_to_buy": "Home Depot, Lowes, Amazon, etc.",
      "notes": "Why this material, any alternatives, quality considerations"
    }}
  ],
  "tools": [
    {{
      "name": "Tool name",
      "required": true,
      "estimated_cost": 0.00,
      "can_rent": true,
      "purpose": "What this tool is used for in this repair"
    }}
  ],
  "steps": [
    {{
      "step_number": 1,
      "title": "Clear step title",
      "details": "Detailed, beginner-friendly instructions. Include specific measurements, techniques, and what to look for.",
      "estimated_time_minutes": 10,
      "pro_tips": ["Helpful tip for better results"],
      "common_mistakes": ["What to avoid"]
    }}
  ],
  "timeEstimate": {{
    "active_work_minutes": 0,
    "drying_curing_wait_minutes": 0,
    "total_calendar_time_hours": 0.0,
    "best_time_to_start": "Morning/afternoon recommendation and why"
  }},
  "cost": {{
    "diy_materials_cost_estimate": 0.00,
    "diy_tools_cost_if_buying": 0.00,
    "diy_total_cost": 0.00,
    "pro_labor_cost_estimate": 0.00,
    "pro_materials_cost_estimate": 0.00,
    "pro_total_cost_estimate": 0.00,
    "potential_savings": 0.00,
    "cost_notes": "Any assumptions about pricing or regional variations"
  }},
  "safetyNotes": [
    "Detailed safety warning with explanation of why it matters"
  ],
  "required_ppe": ["Safety glasses", "Gloves", "etc."],
  "shouldCallProfessional": false,
  "whyCallPro": [
    "Specific reason why a professional might be needed"
  ],
  "warningSignsToStop": [
    "Signs during repair that indicate you should stop and call a pro"
  ],
  "aftercare": "What to do after the repair is complete to ensure longevity",
  "prevention_tips": "How to prevent this issue from happening again"
}}
"""


class RepairAnalyzer:
    def __init__(self, api_key: str | None = None):
        self.client = OpenAI(api_key=api_key or os.environ.get("OPENAI_API_KEY"))
        self.model = "gpt-4o-mini"  # Use full model for detailed analysis

    def analyze_repair(
        self,
        image_base64: str,
        description: str,
        skill_level: str = "beginner",
        budget: str = "moderate",
        location: str = "United States",
        media_type: str = "image/jpeg",
    ) -> dict:
        prompt = REPAIR_ANALYSIS_PROMPT.format(
            description=description,
            skill_level=skill_level,
            location=location,
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{media_type};base64,{image_base64}",
                                },
                            },
                            {"type": "text", "text": prompt},
                        ],
                    }
                ],
                max_tokens=2000,
                temperature=0.3,
            )

            response_text = response.choices[0].message.content
            analysis = self._parse_json(response_text)

            return {"success": True, "data": analysis}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def _parse_json(self, text: str) -> dict:
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())

def humanize_analysis(analysis: dict, description: str) -> str:
    """Convert JSON analysis to detailed, friendly contractor advice."""
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    analysis_json = json.dumps(analysis, indent=2)

    prompt = f"""You are a friendly, experienced contractor giving detailed advice to a homeowner. 

The homeowner described their problem as: "{description}"

Here is the complete analysis:
{analysis_json}

Write a comprehensive but conversational response (300-400 words) that covers:

1. What's wrong - Explain the diagnosis in plain language
2. Can they DIY it? - Based on difficulty and their situation
3. Cost breakdown - DIY savings vs hiring a pro, be specific with numbers
4. Time commitment - Realistic time including drying/waiting
5. Key steps overview - Give a numbered list like "1. First step  2. Second step  3. Third step" etc.
6. Materials to get - Mention the key items they'll need to buy
7. Safety first - Important warnings they must follow
8. Pro tips - 2-3 insider tips for better results

IMPORTANT FORMATTING RULES:
- Do NOT use any markdown formatting
- Do NOT use ** for bold
- Do NOT use # for headers
- Do NOT use bullet points with * or -
- For steps, use numbers like: 1. Step one  2. Step two  3. Step three
- Write in plain paragraphs with numbered steps only
- Use regular text, no special formatting symbols

Be encouraging if it's beginner-friendly, but be honest if it's complex. Use a warm, helpful tone like you're talking to a neighbor."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.6,
    )

    return response.choices[0].message.content



analyzer = RepairAnalyzer()