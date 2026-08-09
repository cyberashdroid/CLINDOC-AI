import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are ClinDoc AI, a clinical documentation assistant. 
You generate accurate, structured SOAP clinical notes from doctor-patient conversation transcripts.
Always respond with valid JSON only. Be clinically precise and professional."""

async def generate_soap_note(
    patient_name: str,
    patient_age: int,
    patient_gender: str,
    chief_complaint: str,
    visit_type: str,
    transcript: str
) -> dict:
    """Generate structured SOAP note from transcript using Claude."""

    prompt = f"""Generate a complete structured SOAP clinical note from this consultation.

PATIENT DETAILS:
- Name: {patient_name}
- Age: {patient_age} years
- Gender: {patient_gender}
- Chief Complaint: {chief_complaint}
- Visit Type: {visit_type}

CONSULTATION TRANSCRIPT:
{transcript}

Respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{{
  "subjective": "Patient's history, symptoms in their own words, onset, duration, severity, associated symptoms",
  "objective": "Vitals, physical examination findings, relevant observations",
  "assessment": "Clinical diagnosis or differential diagnoses with reasoning",
  "plan": "Treatment plan, investigations ordered, referrals, counseling",
  "diagnosis": "Primary diagnosis (concise, 2-6 words)",
  "medications": "Prescribed medications with dosage and frequency",
  "follow_up": "Follow-up instructions, timeline, red flag symptoms to watch for"
}}"""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1500,
        messages=[
            {"role": "user", "content": prompt}
        ],
        system=SYSTEM_PROMPT
    )

    raw = message.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


async def summarize_transcript(transcript: str) -> str:
    """Summarize a long transcript into key clinical points."""
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"Summarize the key clinical points from this transcript in 3-5 bullet points:\n\n{transcript}"
        }]
    )
    return message.content[0].text
