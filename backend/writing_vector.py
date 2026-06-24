import math
import re
import statistics

try:
    import textstat
except ImportError:
    pass

try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        import spacy.cli
        spacy.cli.download("en_core_web_sm")
        nlp = spacy.load("en_core_web_sm")
except ImportError:
    nlp = None

try:
    import nltk
    from nltk.corpus import stopwords
    try:
        stop_words_set = set(stopwords.words('english'))
    except LookupError:
        nltk.download('stopwords', quiet=True)
        stop_words_set = set(stopwords.words('english'))
except ImportError:
    stop_words_set = set()


def clamp(val: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    """Helper to clamp values between 0.0 and 1.0."""
    return max(min_val, min(val, max_val))


def get_writing_profile_label(vector: dict) -> str:
    """
    Combines matching descriptors based on vector rules.
    """
    labels = []
    
    if vector.get("complexity_score", 0.0) > 0.60:
        labels.append("Policy / academic language")
    elif vector.get("complexity_score", 0.0) < 0.35:
        labels.append("Accessible language")
        
    if vector.get("urban_markers", 0.0) > 0.25:
        labels.append("Urban framing")
        
    if vector.get("institutional_density", 0.0) > 0.30:
        labels.append("Institutional voice")
        
    if vector.get("we_ratio", 0.0) > 0.30:
        labels.append("Community-oriented framing")
        
    if vector.get("they_ratio", 0.0) > 0.30:
        labels.append("Othering language detected")
        
    if not labels:
        return "Neutral / unclear framing"
        
    return " · ".join(labels)


def extract_writing_vector(text: str) -> dict:
    """
    Takes a single string and returns a normalized feature dictionary
    representing who the author was unconsciously writing for.
    """
    # Use simple word regex for basic token counting
    words = re.findall(r'\b[a-z0-9_]+\b', text.lower())
    total_tokens = len(words)
    
    # EDGE CASE: If text is empty
    if total_tokens == 0:
        return {
            "complexity_score": 0.0,
            "vocabulary_richness": 0.0,
            "avg_sentence_length": 0.0,
            "sentence_variance": 0.0,
            "we_ratio": 0.0,
            "you_ratio": 0.0,
            "they_ratio": 0.0,
            "institutional_density": 0.0,
            "urban_markers": 0.0,
            "profile_label": "Text empty"
        }

    features = {
        "complexity_score": 0.0,
        "vocabulary_richness": 0.0,
        "avg_sentence_length": 0.0,
        "sentence_variance": 0.0,
        "we_ratio": 0.0,
        "you_ratio": 0.0,
        "they_ratio": 0.0,
        "institutional_density": 0.0,
        "urban_markers": 0.0,
    }

    # 1. complexity_score
    try:
        raw_fk = textstat.flesch_kincaid_grade(text)
        features["complexity_score"] = clamp(raw_fk / 20.0)
    except Exception:
        pass

    # 2. vocabulary_richness
    try:
        valid_words = [w for w in words if w not in stop_words_set]
        unique_tokens = len(set(valid_words))
        # unique valid tokens divided by total tokens in text
        features["vocabulary_richness"] = clamp(unique_tokens / total_tokens)
    except Exception:
        pass

    # 3 & 4. avg_sentence_length and sentence_variance
    try:
        if nlp is not None:
            doc = nlp(text)
            sentence_lengths = []
            for sent in doc.sents:
                sent_words = [t.text for t in sent if not t.is_punct and not t.is_space]
                sentence_lengths.append(len(sent_words))
                
            if sentence_lengths:
                avg_len = sum(sentence_lengths) / len(sentence_lengths)
                features["avg_sentence_length"] = clamp(avg_len / 40.0)
                
                if len(sentence_lengths) > 1:
                    variance_val = statistics.stdev(sentence_lengths)
                else:
                    variance_val = 0.0
                features["sentence_variance"] = clamp(variance_val / 15.0)
    except Exception:
        pass

    # 5. we_ratio
    try:
        we_count = sum(1 for w in words if w in {"we", "our", "us"})
        features["we_ratio"] = clamp((we_count / total_tokens) * 10.0)
    except Exception:
        pass

    # 6. you_ratio
    try:
        you_count = sum(1 for w in words if w in {"you", "your"})
        features["you_ratio"] = clamp((you_count / total_tokens) * 10.0)
    except Exception:
        pass

    # 7. they_ratio
    try:
        they_count = sum(1 for w in words if w in {"they", "them", "those", "their"})
        features["they_ratio"] = clamp((they_count / total_tokens) * 10.0)
    except Exception:
        pass

    # 8. institutional_density
    try:
        inst_words = {
            "government", "policy", "scheme", "authority", "regulation",
            "ministry", "department", "official", "gazette", "mandate",
            "framework", "initiative", "directive", "announced", "implementation"
        }
        inst_count = sum(1 for w in words if w in inst_words)
        features["institutional_density"] = clamp((inst_count / total_tokens) * 20.0)
    except Exception:
        pass

    # 9. urban_markers
    try:
        urban_words = {
            "metro", "urban", "startup", "app", "platform", "digital",
            "online", "wifi", "delivery", "commute", "apartment", "mall",
            "café", "coworking", "tech", "laptop", "subscription", "gig",
            "influencer", "notification"
        }
        # Account for 'cafe' without accent
        urban_count = sum(1 for w in words if w in urban_words or w == "cafe")
        features["urban_markers"] = clamp((urban_count / total_tokens) * 20.0)
    except Exception:
        pass

    # Apply rounding and compute profile label
    for key, val in features.items():
        if isinstance(val, float):
            features[key] = round(val, 2)
            
    # The label relies on the rounded feature values
    features["profile_label"] = get_writing_profile_label(features)

    return features
