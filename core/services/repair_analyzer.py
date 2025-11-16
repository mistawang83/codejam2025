# core/services/repair_analyzer.py

import os
import json
from openai import OpenAI

REPAIR_ANALYSIS_PROMPT = """
You are an expert home repair and renovation advisor.

The user has uploaded a photo of a real home repair or renovation situation.
You are given:
- A natural language description of the problem and what they want to achieve
- Their DIY skill level
- Their budget preference
- Their location (for pricing estimates)

User description:
\"\"\"{description}\"\"\"

User skill level: {skill_level}
Budget preference: {budget}
Location (for pricing): {location}

You MUST respond with valid JSON only, no extra text, with this structure:

{{
  "diagnosis": "Short summary of what the issue is based on the image + text.",
  "projectCategory": "small_repair or renovation",
  "scope": "One or two sentences describing the overall scope of the work.",
  "materials": [
    {{
      "name": "Name of material",
      "quantity": 0,
      "unit": "piece / ft / sq ft / liter / etc",
      "estimated_unit_cost": 0.0,
      "notes": "Any important selection details."
    }}
  ],
  "tools": [
    "Tool 1",
    "Tool 2"
  ],
  "steps": [
    {{
      "step_number": 1,
      "title": "Short step title",
      "details": "Clear, actionable instructions tailored to the photo.",
      "estimated_time_minutes": 0
    }}
  ],
  "timeEstimate": {{
    "active_time_minutes": 0,
    "drying_or_wait_time_minutes": 0,
    "total_calendar_time_hours": 0
  }},
  "difficulty": "Beginner or Intermediate or Advanced",
  "cost": {{
    "currency": "USD",
    "diy_materials_cost_estimate": 0.0,
    "diy_tool_rental_cost_estimate": 0.0,
    "pro_labor_cost_estimate": 0.0,
    "pro_total_cost_estimate": 0.0,
    "notes": "Any key assumptions or caveats about cost."
  }},
  "safetyNotes": [
    "Safety note 1",
    "Safety note 2"
  ],
  "shouldCallProfessional": false,
  "professionalEscalationReasons": [
    "Reason 1 they should call a pro",
    "Reason 2 they should call a pro"
  ]
}}

Remember: output ONLY JSON. No markdown, no explanation.
"""



class RepairAnalyzer:
    def __init__(self, api_key: str | None = None):
        # Uses env var if api_key not passed
        self.client = OpenAI(api_key=api_key or os.environ.get("OPENAI_API_KEY"))
        self.model = "gpt-4o"  # or "gpt-4o-mini" if you prefer cheaper

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
            budget=budget,
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
                            {
                                "type": "text",
                                "text": prompt,
                            },
                        ],
                    }
                ],
                max_tokens=2000,
                temperature=0.3,
            )

            response_text = response.choices[0].message.content
            analysis = self._parse_json_response(response_text)

            analysis["_metadata"] = {
                "model_used": self.model,
                "tokens_used": {
                    "prompt": response.usage.prompt_tokens,
                    "completion": response.usage.completion_tokens,
                    "total": response.usage.total_tokens,
                },
            }

            return {"success": True, "data": analysis}

        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Failed to parse AI response as JSON: {e}",
                "error_type": "parse_error",
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "error_type": "unknown_error",
            }

    def _parse_json_response(self, response_text: str) -> dict:
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        return json.loads(cleaned)


def humanize_analysis(analysis: dict, original_description: str) -> str:
    """
    Take the structured JSON analysis and let ChatGPT talk
    like a friendly, expert contractor to the user.
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    analysis_json = json.dumps(analysis, ensure_ascii=False, indent=2)

    system_msg = (
        "You are a friendly, expert home repair advisor. "
        "You are talking to a non-expert homeowner. "
        "Be clear, encouraging, and practical."
    )

    user_msg = f"""
The user originally described their problem as:

\"\"\"{original_description}\"\"\"

Here is a structured analysis of their situation as JSON:

{analysis_json}

Using ONLY the information in that analysis, speak to the user like a real contractor would:

- Briefly restate what the problem is in plain language.
- Tell them if this is reasonable for them to DIY given the difficulty.
- Summarize estimated time and cost (DIY vs hiring a pro).
- Give a high-level step-by-step plan (not too technical).
- Mention any important safety warnings.
- If the analysis suggests they should call a professional, be honest about that and explain why.

Do NOT show the JSON. Just give a natural, conversational answer.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
        max_tokens=600,
        temperature=0.5,
    )

    return response.choices[0].message.content


# Singleton instance for easy importing in views
analyzer = RepairAnalyzer()
