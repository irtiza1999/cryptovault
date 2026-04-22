from algorithms.common import ALPHABET, ENGLISH_FREQ, chunk_text, flatten, inverse_permutation, parse_permutation

# Normalize and validate the substitution key.
def normalize_sub_key(key):
    # Lowercase the provided key for uniform handling.
    key = (key or "").lower()
    # Require all 26 alphabet characters.
    if len(key) != 26:
        # Explain the exact key length requirement.
        raise ValueError("Substitution key must have 26 characters")
    # Require the key to be a permutation of the alphabet.
    if set(key) != set(ALPHABET):
        # Reject keys that repeat or skip letters.
        raise ValueError("Substitution key must be a permutation of a-z")
    # Return the validated key.
    return key

# Encrypt or decrypt with a monoalphabetic substitution.
def substitution_transform(text, key, decrypt=False):
    # Validate the key before any mapping work.
    key = normalize_sub_key(key)
    # Build the forward substitution map.
    enc = {ALPHABET[index]: key[index] for index in range(26)}
    # Build the reverse substitution map.
    dec = {value: name for name, value in enc.items()}
    # Pick the direction based on the decrypt flag.
    mapper = dec if decrypt else enc
    # Collect the transformed text here.
    output = []
    # Record a step-by-step trace for the UI.
    steps = []
    # Walk each character and substitute letters only.
    for index, char in enumerate(text or ""):
        # Lowercase the character for lookup.
        lowered = char.lower()
        # Replace only characters in the mapping.
        if lowered in mapper:
            # Find the mapped character.
            mapped = mapper[lowered]
            # Restore case when the original letter was uppercase.
            final_char = mapped if char == lowered else mapped.upper()
            # Append the transformed character to the output.
            output.append(final_char)
            # Store the trace item for the UI and tests.
            steps.append({"index": index, "in": char, "out": final_char})
        else:
            # Leave punctuation and spaces unchanged.
            output.append(char)
            # Still record the unchanged step.
            steps.append({"index": index, "in": char, "out": char})
    # Return the transformed text and step trace.
    return {"text": "".join(output), "steps": steps}

# Encrypt a message by applying two column transpositions.
def double_trans_encrypt(text, key_a, key_b):
    # Parse the first permutation key.
    perm_a = parse_permutation(key_a)
    # Parse the second permutation key.
    perm_b = parse_permutation(key_b)
    # Build the first matrix from the plaintext.
    first_matrix = chunk_text(text or "", len(perm_a))
    # Apply the first column permutation.
    first_permuted = [[row[index] for index in perm_a] for row in first_matrix]
    # Flatten the first permutation output.
    after_first = flatten(first_permuted)
    # Build the second matrix from the intermediate text.
    second_matrix = chunk_text(after_first, len(perm_b))
    # Apply the second column permutation.
    second_permuted = [[row[index] for index in perm_b] for row in second_matrix]
    # Flatten the final ciphertext.
    ciphertext = flatten(second_permuted)
    # Return the ciphertext and the intermediate matrices.
    return {
        "ciphertext": ciphertext,
        "intermediate": {
            "afterFirst": after_first,
            "firstMatrix": first_matrix,
            "firstPermuted": first_permuted,
            "secondMatrix": second_matrix,
            "secondPermuted": second_permuted,
        },
    }

# Reverse a transposition step using the inverse permutation.
def reverse_transposition(text, perm):
    # Rebuild the matrix using the original column count.
    matrix = chunk_text(text, len(perm))
    # Apply the inverse permutation to restore column order.
    restored = [[row[index] for index in inverse_permutation(perm)] for row in matrix]
    # Flatten the recovered matrix back into text.
    return flatten(restored)

# Decrypt a message that used the double transposition chain.
def double_trans_decrypt(text, key_a, key_b):
    # Parse the first permutation key.
    perm_a = parse_permutation(key_a)
    # Parse the second permutation key.
    perm_b = parse_permutation(key_b)
    # Undo the second transposition first.
    undo_second = reverse_transposition(text or "", perm_b)
    # Undo the first transposition next and remove padding.
    plaintext = reverse_transposition(undo_second, perm_a).rstrip("X")
    # Return the recovered plaintext and the trace.
    return {"plaintext": plaintext, "intermediate": {"undoSecond": undo_second}}

# Analyze a substitution cipher using frequency analysis.
def substitution_attack(text):
    # Lowercase the text first.
    text = (text or "").lower()
    # Keep only alphabetic characters.
    cleaned = "".join(char for char in text if char in ALPHABET)
    # Count each possible letter.
    counts = {char: 0 for char in ALPHABET}
    # Update the counts for every cleaned character.
    for char in cleaned:
        # Increase the frequency for the current letter.
        counts[char] += 1
    # Sort letters from most common to least common.
    ranked = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    # Build a guessed mapping against typical English frequency.
    guessed = {cipher: ENGLISH_FREQ[index] if index < len(ENGLISH_FREQ) else "?" for index, (cipher, _) in enumerate(ranked)}
    # Prepare a few sample keys for brute-force style scoring.
    sample_keys = ["zyxwvutsrqponmlkjihgfedcba", "qwertyuiopasdfghjklzxcvbnm", "phqgiumeaylnofdxkrcvstzwbj"]
    # Collect candidate decryptions here.
    attempts = []
    # Try each sample key against the ciphertext.
    for key in sample_keys:
        # Build the reverse mapping for the sample key.
        reverse = {key[index]: ALPHABET[index] for index in range(26)}
        # Decode the text with the current key guess.
        candidate = "".join(reverse.get(char, char) for char in text)
        # Score the candidate by common English fragments.
        score = sum(1 for token in [" the ", " and ", " to ", " of ", " is ", " in "] if token in f" {candidate} ")
        # Save the attempt for the result view.
        attempts.append({"key": key, "candidate": candidate, "score": score})
    # Rank the candidate attempts from best to worst.
    attempts.sort(key=lambda item: item["score"], reverse=True)
    # Return the frequency table and brute-force attempts.
    return {
        "frequency": {
            "counts": counts,
            "ranked": [{"ch": char, "count": count} for char, count in ranked],
            "guessedMap": guessed,
        },
        "bruteForce": {"attempts": attempts},
    }
