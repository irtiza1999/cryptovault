from algorithms.common import ALPHABET, ENGLISH_FREQ, abs_int, gcd

# Analyze a substitution cipher using frequency analysis and sample guesses.
def substitution_attack(text):
    # Lowercase the input so the frequency analysis is stable.
    text = (text or "").lower()
    # Keep only alphabetic characters for the analysis.
    cleaned = "".join(char for char in text if char in ALPHABET)
    # Prepare a zero count for every letter.
    counts = {char: 0 for char in ALPHABET}
    # Count each letter that appears in the cleaned text.
    for char in cleaned:
        # Increase the count for the current letter.
        counts[char] += 1
    # Sort the letters from the most common to the least common.
    ranked = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    # Build a guessed mapping against typical English frequency.
    guessed_map = {cipher: ENGLISH_FREQ[index] if index < len(ENGLISH_FREQ) else "?" for index, (cipher, _) in enumerate(ranked)}
    # Use a few sample keys to generate candidate plaintexts.
    sample_keys = ["zyxwvutsrqponmlkjihgfedcba", "qwertyuiopasdfghjklzxcvbnm", "phqgiumeaylnofdxkrcvstzwbj"]
    # Store each candidate attempt here.
    attempts = []
    # Test every sample key against the ciphertext.
    for key in sample_keys:
        # Create the reverse map for the current key.
        reverse = {key[index]: ALPHABET[index] for index in range(26)}
        # Decode the text using the candidate key.
        candidate = "".join(reverse.get(char, char) for char in text)
        # Score the candidate using common English fragments.
        score = sum(1 for token in [" the ", " and ", " to ", " of ", " is ", " in "] if token in f" {candidate} ")
        # Save the attempt for display and comparison.
        attempts.append({"key": key, "candidate": candidate, "score": score})
    # Rank the attempts so the best guess appears first.
    attempts.sort(key=lambda item: item["score"], reverse=True)
    # Return both the frequency table and candidate plaintexts.
    return {
        "frequency": {
            "counts": counts,
            "ranked": [{"ch": char, "count": count} for char, count in ranked],
            "guessedMap": guessed_map,
        },
        "bruteForce": {"attempts": attempts},
    }

# Factor an integer with Pollard's rho.
def pollards_rho(number, max_iterations=50000):
    # Convert the input into an integer.
    modulus = int(number)
    # Handle even numbers immediately.
    if modulus % 2 == 0:
        return {"success": True, "factor": "2", "cofactor": str(modulus // 2), "iterations": 1}

    # Define the polynomial used by the rho method.
    def iterate(value, constant):
        # Apply the quadratic step modulo the target.
        return (value * value + constant) % modulus

    # Seed the working values.
    x = 2
    # Seed the second tortoise/hare value.
    y = 2
    # Start with a small constant.
    c = 1
    # Begin with no discovered factor.
    d = 1
    # Count the number of iterations performed.
    iterations = 0
    # Keep a trace of the iteration states for the UI.
    trace = []

    # Continue until a factor is found or the limit is reached.
    while d == 1 and iterations < int(max_iterations):
        # Advance the slow pointer.
        x = iterate(x, c)
        # Advance the fast pointer twice.
        y = iterate(iterate(y, c), c)
        # Compute the gcd of their difference and the target.
        d = gcd(abs_int(x - y), modulus)
        # Count this step.
        iterations += 1
        # Record the current iteration state.
        trace.append({"iteration": iterations, "x": str(x), "y": str(y), "gcd": str(d)})
        # Reset when the algorithm hits a degenerate cycle.
        if d == modulus:
            # Change the constant to escape the cycle.
            c += 1
            # Reset both pointers.
            x = y = 2
            # Clear the factor candidate.
            d = 1

    # Return a successful factorization when one is found.
    if 1 < d < modulus:
        return {"success": True, "factor": str(d), "cofactor": str(modulus // d), "iterations": iterations, "trace": trace}
    # Return a failure message when no factor was found.
    return {"success": False, "iterations": iterations, "message": "No factor found in budget", "trace": trace}
