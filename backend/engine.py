def calculate_validation_score(accuracy):
    """
    accuracy should be between 0 and 1.
    Example: 0.86 = 86%
    """
    return max(0, min(100, accuracy * 100))


def calculate_sample_maturity(sample_count):
    """
    More validation samples = higher maturity.
    1000 or more samples = 100.
    """
    score = (sample_count / 1000) * 100
    return max(0, min(100, score))


def calculate_uncertainty_score(uncertainty):
    """
    Lower uncertainty = higher score.
    uncertainty should be between 0 and 1.
    """
    score = (1 - uncertainty) * 100
    return max(0, min(100, score))


def calculate_mmi(accuracy, sample_count, uncertainty):

    validation_score = calculate_validation_score(accuracy)

    sample_score = calculate_sample_maturity(sample_count)

    uncertainty_score = calculate_uncertainty_score(uncertainty)

    mmi = (
        0.40 * validation_score +
        0.30 * sample_score +
        0.30 * uncertainty_score
    )

    return round(mmi, 2)


def get_mode(mmi):

    if mmi < 40:
        return "SHADOW"

    elif mmi < 75:
        return "ASSISTED"

    else:
        return "AUTONOMOUS"


def get_confidence(mmi):

    if mmi < 40:
        return "LOW"

    elif mmi < 75:
        return "MODERATE"

    else:
        return "HIGH"


def get_maturity_result(accuracy, sample_count, uncertainty):

    mmi = calculate_mmi(
        accuracy,
        sample_count,
        uncertainty
    )

    mode = get_mode(mmi)

    confidence = get_confidence(mmi)

    return {
        "mmi": mmi,
        "mode": mode,
        "confidence": confidence,
        "can_auto_alert": mmi >= 75
    }