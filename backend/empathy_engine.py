import math
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

BENCHMARKS = {
    ("metro", "english", "policy"): 4.2,
    ("metro", "english", "media"): 5.1,
    ("metro", "english", "business"): 4.8,
    ("metro", "english", "education"): 5.3,
    ("metro", "hindi", "policy"): 4.5,
    ("metro", "hindi", "business"): 5.0,
    ("metro", "regional", "education"): 5.8,
    ("small_city", "english", "policy"): 4.8,
    ("small_city", "hindi", "business"): 5.5,
    ("small_city", "regional", "education"): 6.0,
    ("town", "hindi", "policy"): 5.2,
    ("town", "regional", "education"): 6.3,
    ("village", "regional", "education"): 7.1,
}

KEY_ORDER = [
    "complexity_score",
    "vocabulary_richness",
    "avg_sentence_length",
    "sentence_variance",
    "we_ratio",
    "you_ratio",
    "they_ratio",
    "institutional_density",
    "urban_markers",
]


def compute_empathy_distances(writing_vector, cognitive_profile, persona_vectors) -> dict:
    """
    Computes zones and reach distances between a user's writing vector and persona targets.
    """
    if writing_vector is None:
        writing_vector = {}
    if cognitive_profile is None:
        cognitive_profile = {}
    if persona_vectors is None:
        persona_vectors = {}

    w_vec = np.array([writing_vector.get(k, 0.0) for k in KEY_ORDER])
    w_norm = np.linalg.norm(w_vec)

    persona_results = []
    empathy_reach = 0

    for pid, p_data in persona_vectors.items():
        p_vec = np.array([p_data.get(k, 0.0) for k in KEY_ORDER])
        p_norm = np.linalg.norm(p_vec)

        if w_norm == 0.0 or p_norm == 0.0:
            similarity = 0.0
        else:
            sim_matrix = cosine_similarity(w_vec.reshape(1, -1), p_vec.reshape(1, -1))
            similarity = float(sim_matrix[0][0])
            if math.isnan(similarity):
                similarity = 0.0

        distance = round(1.0 - similarity, 4)

        if distance < 0.35:
            zone = "CLOSE"
            reached = True
            empathy_reach += 1
        elif distance < 0.48:
            zone = "DISTANT"
            reached = False
        else:
            zone = "BLIND_SPOT"
            reached = False

        persona_results.append({
            "id": pid,
            "zone": zone,
            "distance": float(distance),
            "similarity": float(round(similarity, 4)),
            "reached": reached
        })

    # Benchmark lookup logic
    origin = cognitive_profile.get("origin") or "metro"
    language = cognitive_profile.get("language") or "english"
    profession = cognitive_profile.get("profession") or "policy"

    benchmark = BENCHMARKS.get((origin, language, profession), 4.5)
    floor_bench = math.floor(benchmark)

    diff = empathy_reach - floor_bench
    if diff < 0:
        benchmark_sentence = f"Most communicators with your profile reach {floor_bench} of 12. You reached {abs(diff)} fewer."
    elif diff > 0:
        benchmark_sentence = f"Most communicators with your profile reach {floor_bench} of 12. You reached {diff} more."
    else:
        benchmark_sentence = "You're exactly at the average for your profile."

    return {
        "empathy_reach": int(empathy_reach),
        "profile_benchmark": float(benchmark),
        "reach_sentence": f"You wrote this for {empathy_reach} of these 12 people.",
        "benchmark_sentence": benchmark_sentence,
        "personas": persona_results
    }
