"""
cache.py — pre-baked fallback responses for the 3 demo headlines

WHY THIS EXISTS
───────────────
If the Gemini API is rate-limited or the network hiccups mid-demo,
we serve these canned responses instead of a crash screen.

The three demo headlines are:
  H1 → "Govt announces new farm loan waiver scheme"
  H2 → "Police lathi-charge protesters near Parliament"
  H3 → "India's GDP growth slips to 6.2% in Q2"

HOW TO UPDATE
─────────────
Run the three headlines through the live API while preparing for the demo,
copy the JSON outputs here, and you have a bullet-proof fallback.
The current values are illustrative placeholders — replace them with
your real pre-run outputs before going on stage.
"""

from typing import Any, Dict, Optional

# ── Type alias ───────────────────────────────────────────────────────────────
CachedResponse = Dict[str, Any]

# ─────────────────────────────────────────────────────────────────────────────
#  DEMO HEADLINE 1
# ─────────────────────────────────────────────────────────────────────────────
_H1 = "Govt announces new farm loan waiver scheme"

_H1_STAGE1: str = "contested across sources"

_H1_STAGE2: Dict[str, str] = {
    "startup_founder_pune":       "While rural relief is crucial, these funds are financed by urban tax payers. I hope we see similar policy focus on small enterprise incentives and start-up tax exemptions.",
    "urban_student_vadodara":    "Good for the farm sector, but when will we get loan waivers or interest relaxation for education and student loans? Placements are already tough.",
    "corporate_employee_chennai": "Another subsidy paid by direct taxpayers like us, with zero returns for urban infrastructure. The fiscal deficit will widen and cause inflation.",
    "homemaker_thanjavur":        "If the local banks clear these loans, will it lower the price of vegetables and daily groceries? That's what matters to my kitchen budget.",
    "homemaker_hoshiarpur":       "Our family depends heavily on what my brother farms. With the erratic monsoons, this waiver is a major blessing to keep the household running.",
    "business_owner_surat":       "If rural demand goes up due to debt relief, textile sales in rural markets might recover. But what about credit relief for micro and small businesses?",
    "farmer_kannur":              "Waivers are usually for food crops. I hope cooperative bank loans for commercial cash-crops like rubber and spices are covered too.",
    "farmer_anantapur":           "We've faced drought for years and our borewells are dry. This waiver saves us from severe debt traps, but we need permanent irrigation solutions.",
    "business_owner_aligarh":      "If farmers have money, they spend more. But lock manufacturers like us also need cheap raw materials and steady electricity, not just crop waivers.",
    "aspirant_sangli":            "Government spending goes to waivers, which means fewer new recruitment posts in departments. I've been waiting for state exam notifications for a year.",
    "retired_officer_ujjain":      "Implementing a loan waiver scheme cleanly is highly complex. Most state schemes see huge leakages and delayed bank reimbursements.",
    "retired_officer_guntur":      "A politically popular move, but it threatens fiscal stability. Hopefully, the guidelines have strict cut-offs so only the needy benefit.",
}

_H1_STAGE3: str = (
    "The government has announced a farm loan relief scheme targeting small and marginal farmers. "
    "Eligibility criteria, state-level rollout timelines, and inclusion safeguards for SC/ST and women landholders "
    "will be published within 30 days. Independent audit of disbursement will be conducted at 6-month intervals."
)

# ─────────────────────────────────────────────────────────────────────────────
#  DEMO HEADLINE 2
# ─────────────────────────────────────────────────────────────────────────────
_H2 = "Police lathi-charge protesters near Parliament"

_H2_STAGE1: str = "contested across sources"

_H2_STAGE2: Dict[str, str] = {
    "startup_founder_pune":       "Disruptions near the Parliament area look bad for business confidence. However, excessive force by authorities is concerning.",
    "urban_student_vadodara":    "If students or citizens are being beaten up for voicing concerns, it's worrying. Protesting peacefully is a fundamental right.",
    "corporate_employee_chennai": "I need to know the context first—who is protesting and why? But using physical force on citizens should be the absolute last resort.",
    "homemaker_thanjavur":        "It's scary to see such violence on TV. I hope no innocent youngsters were caught in the middle of it.",
    "homemaker_hoshiarpur":       "If these are farmers or local workers protesting, my family feels their pain. Government must talk to them instead of using force.",
    "business_owner_surat":       "Protests disrupt logistics and local markets. While law and order must be maintained, violence is bad for the economy.",
    "farmer_kannur":              "It's always the common people who get beaten up when they go to the capital to highlight their issues.",
    "farmer_anantapur":           "They treat citizens like criminals just for demanding basic survival support or fair prices.",
    "business_owner_aligarh":      "Such clashes create tension and shut down transport. We can't dispatch lock consignments if highways get blocked.",
    "aspirant_sangli":            "Many student and youth groups protest over exam leaks and delays. It's frustrating to see them met with police sticks.",
    "retired_officer_ujjain":      "Standard operating procedures for crowd control require warning and water cannons before using force. Let's see if proper procedure was followed.",
    "retired_officer_guntur":      "Law enforcement has a tough job maintaining peace near high-security zones, but any use of force must be strictly proportional.",
}

_H2_STAGE3: str = (
    "Police and protesters clashed near Parliament during a demonstration. "
    "Authorities say force was used after crowd barriers were breached; protest organisers dispute this account. "
    "An independent inquiry has been requested. Three people were hospitalised; no life-threatening injuries reported."
)

# ─────────────────────────────────────────────────────────────────────────────
#  DEMO HEADLINE 3
# ─────────────────────────────────────────────────────────────────────────────
_H3 = "India's GDP growth slips to 6.2% in Q2"

_H3_STAGE1: str = "well-supported by credible sources"

_H3_STAGE2: Dict[str, str] = {
    "startup_founder_pune":       "A slowdown to 6.2% will make VC funding even tighter. We need structural reforms to boost investment and consumer spending.",
    "urban_student_vadodara":    "A drop in GDP growth means companies might hire less this year. The placement cell at college is going to have a hard time.",
    "corporate_employee_chennai": "This means smaller appraisals and potential layoffs in the IT sector. Cost-cutting will likely continue.",
    "homemaker_thanjavur":        "They keep talking about GDP percentages, but the price of cooking oil, gas, and onions is what affects my monthly budget.",
    "homemaker_hoshiarpur":       "When the big economy slows down, money flow to rural areas decreases. We'll have to cut down on discretionary expenses.",
    "business_owner_surat":       "We've already seen domestic textile demand slowing. A 6.2% figure confirms what we are seeing on the shop floor.",
    "farmer_kannur":              "Global prices of rubber are down, and now domestic growth is slipping. It's going to be a tough season for agriculture.",
    "farmer_anantapur":           "Whether the GDP is 6% or 8%, our crop yield depends on rain. A bad monsoon affects us far more than these numbers.",
    "business_owner_aligarh":      "Manufacturing sector slowdown is the real culprit here. High metal prices and lower market demand are hurting small units like ours.",
    "aspirant_sangli":            "Slower growth means public sector recruitment will shrink further. It's very discouraging for candidates preparing day and night.",
    "retired_officer_ujjain":      "The private capital expenditure is stagnating. Government spending alone cannot sustain high growth rates indefinitely.",
    "retired_officer_guntur":      "A correction was expected, but 6.2% is still relatively strong globally. We need to watch inflation and interest rate trends now.",
}

_H3_STAGE3: str = (
    "India's GDP growth reached 6.2% in Q2, below the previous quarter's 6.8%. "
    "The slowdown was driven primarily by a contraction in private fixed investment; consumption remained stable. "
    "The RBI has not signalled a policy response. Formal and informal sector impacts are expected to diverge."
)


# ─────────────────────────────────────────────────────────────────────────────
#  Public lookup API
# ─────────────────────────────────────────────────────────────────────────────

_CACHE: Dict[str, CachedResponse] = {
    _H1.lower(): {
        "headline":    _H1,
        "stage1":      _H1_STAGE1,
        "stage2":      _H1_STAGE2,
        "stage3":      _H1_STAGE3,
    },
    _H2.lower(): {
        "headline":    _H2,
        "stage1":      _H2_STAGE1,
        "stage2":      _H2_STAGE2,
        "stage3":      _H2_STAGE3,
    },
    _H3.lower(): {
        "headline":    _H3,
        "stage1":      _H3_STAGE1,
        "stage2":      _H3_STAGE2,
        "stage3":      _H3_STAGE3,
    },
}


def get_cached(headline: str) -> Optional[CachedResponse]:
    """
    Returns the full cached pipeline response for a known demo headline,
    or None if no cache entry exists for this headline.

    Matching is case-insensitive and strips leading/trailing whitespace.
    """
    return _CACHE.get(headline.strip().lower())


def list_cached_headlines() -> list[str]:
    """Returns the canonical form of every pre-cached headline."""
    return [v["headline"] for v in _CACHE.values()]
