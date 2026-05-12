from algorithms.common import ALPHABET, chunk_text, flatten, inverse_permutation, parse_permutation

def normalize_sub_key(key):
    """Normalize and validate the substitution key."""
    key = (key or "").lower()
    if len(key) != 26:
        raise ValueError("Substitution key must have 26 characters")
    if set(key) != set(ALPHABET):
        raise ValueError("Substitution key must be a permutation of a-z")
    return key

def substitution_transform(text, key, decrypt=False):
    """Encrypt or decrypt a monoalphabetic substitution."""
    key = normalize_sub_key(key)
    enc = {ALPHABET[index]: key[index] for index in range(26)}
    dec = {value: name for name, value in enc.items()}
    mapper = dec if decrypt else enc
    output = []
    steps = []
    for index, char in enumerate(text or ""):
        lowered = char.lower()
        if lowered in mapper:
            mapped = mapper[lowered]
            final_char = mapped if char == lowered else mapped.upper()
            output.append(final_char)
            steps.append({"index": index, "in": char, "out": final_char})
        else:
            output.append(char)
            steps.append({"index": index, "in": char, "out": char})
    return {"text": "".join(output), "steps": steps}

def double_trans_encrypt(text, key_a, key_b):
    """Encrypt text with two column transpositions."""
    perm_a = parse_permutation(key_a)
    perm_b = parse_permutation(key_b)
    first_matrix = chunk_text(text or "", len(perm_a))
    first_permuted = [[row[index] for index in perm_a] for row in first_matrix]
    after_first = flatten(first_permuted)
    second_matrix = chunk_text(after_first, len(perm_b))
    second_permuted = [[row[index] for index in perm_b] for row in second_matrix]
    ciphertext = flatten(second_permuted)
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

def reverse_transposition(text, perm):
    """Reverse one transposition step using the inverse permutation."""
    matrix = chunk_text(text, len(perm))
    restored = [[row[index] for index in inverse_permutation(perm)] for row in matrix]
    return flatten(restored)

def double_trans_decrypt(text, key_a, key_b):
    """Decrypt a message that used the double transposition chain."""
    perm_a = parse_permutation(key_a)
    perm_b = parse_permutation(key_b)
    undo_second = reverse_transposition(text or "", perm_b)
    plaintext = reverse_transposition(undo_second, perm_a).rstrip("X")
    return {"plaintext": plaintext, "intermediate": {"undoSecond": undo_second}}

