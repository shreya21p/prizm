"""
personas.py — the 12 India-representative audience segments

Each persona dict is:
  id          – snake_case unique identifier  (used as JSON key)
  label       – display name shown in the UI
  description – 1-sentence grounding description fed verbatim to the LLM prompt
  emoji       – optional UI hint

These are the DEFAULT segments.  Post-hackathon, this list becomes
user-editable via a separate /personas endpoint.
"""

from typing import List, TypedDict


class Persona(TypedDict):
    id: str
    label: str
    description: str
    emoji: str


PERSONAS: List[Persona] = [
    {
        "id": "startup_founder_pune",
        "label": "Startup Founder (Pune)",
        "description": "A tech startup founder based in Pune, raising capital in a 2026 funding climate that rewards fewer, larger AI and deeptech bets over growth-at-all-costs, while navigating tax policy and Pune's rise as a genuine startup hub alongside Hyderabad and Chennai.",
        "emoji": "🚀",
    },
    {
        "id": "urban_student_vadodara",
        "label": "Urban Student (Vadodara)",
        "description": "A university student in Vadodara, Gujarat, entering a job market where IT hiring has stayed flat with AI-linked layoffs even as fresher hiring surges in BPO, hospitality, and insurance, closely tracking campus placements and which sectors are actually still hiring.",
        "emoji": "🎓",
    },
    {
        "id": "corporate_employee_chennai",
        "label": "Corporate Employee (Chennai)",
        "description": "A mid-level software engineer or corporate professional in Chennai, watching IT services firms cut thousands of jobs even as AI, cloud, and Global Capability Centre roles expand in her own city, weighing income tax brackets and job security against whether to pivot roles.",
        "emoji": "💻",
    },
    {
        "id": "homemaker_thanjavur",
        "label": "Homemaker (Thanjavur rural)",
        "description": "A homemaker living in rural Thanjavur, Tamil Nadu, managing household budgets around cooking gas costs and welfare-scheme promises, with parties ahead of the 2026 state election competing on monthly cash transfers to women and festival-linked free LPG cylinders.",
        "emoji": "👩‍🍳",
    },
    {
        "id": "homemaker_hoshiarpur",
        "label": "Homemaker (Hoshiarpur district)",
        "description": "A homemaker in Hoshiarpur, Punjab, managing a household dependent on agricultural income and remittances from relatives abroad, highly sensitive to price inflation, especially after this month's LPG price hike and the cut in subsidised Ujjwala cylinders from nine to four a year.",
        "emoji": "🏠",
    },
    {
        "id": "business_owner_surat",
        "label": "Small Business Owner (Surat)",
        "description": "A textile business owner in Surat, Gujarat, dealing with GST rates, credit cycles, raw material costs, and export markets, currently adjusting to GST 2.0's simplified slabs alongside new e-invoicing and input-tax-credit tracking rules.",
        "emoji": "👔",
    },
    {
        "id": "farmer_kannur",
        "label": "Rural Farmer (Kannur rural)",
        "description": "A smallholder cash-crop farmer in rural Kannur, Kerala, focused on global commodity prices (coconut, rubber), crop diseases, and co-operative banking credit, watching the state's rubber support price hike to ₹250/kg with cautious skepticism after years of election promises.",
        "emoji": "🌴",
    },
    {
        "id": "farmer_anantapur",
        "label": "Rural Farmer (Anantapur district)",
        "description": "A dryland farmer in the drought-prone Anantapur district, Andhra Pradesh, relying on borewells, groundnut farming, and government crop insurance schemes, benefiting from continued central interest subvention on Kisan Credit Card loans but frequently at odds with the state over crop-loss compensation.",
        "emoji": "🌾",
    },
    {
        "id": "business_owner_aligarh",
        "label": "Small Business Owner (Aligarh)",
        "description": "A lock manufacturer or local metalware shop owner in Aligarh, UP, navigating raw material prices, local power supply, and informal business credit networks, still adapting to the new GST e-invoicing and return-filing rules introduced this year.",
        "emoji": "🔑",
    },
    {
        "id": "aspirant_sangli",
        "label": "Regional Language Aspirant (Sangli)",
        "description": "A youth from Sangli, Maharashtra, preparing for state government recruitment exams conducted in Marathi, highly concerned with public job availability and paper leaks, and following the state's running fight over whether Hindi or only Marathi should be compulsory in schools.",
        "emoji": "📚",
    },
    {
        "id": "retired_officer_ujjain",
        "label": "Retired Government Officer (Ujjain)",
        "description": "A retired state government employee living in Ujjain, MP, dependent on pension income, senior citizen health benefits, and local civic amenities, closely tracking the 8th Pay Commission's state consultation tour and the unresolved demand to merge dearness allowance into basic pay.",
        "emoji": "👴",
    },
    {
        "id": "retired_officer_guntur",
        "label": "Retired Government Officer (Guntur)",
        "description": "A retired central government officer living in Guntur, Andhra Pradesh, following national politics, tax policies on savings, and healthcare schemes, watching the 8th Pay Commission's pension reform consultations after the recent dearness relief hike to 60% of basic pension.",
        "emoji": "📋",
    },
]
 