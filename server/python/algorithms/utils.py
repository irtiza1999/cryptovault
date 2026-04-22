import math

def shannon_entropy(data):
    # Calculate the Shannon entropy of a string or bytes object.
    if not data:
        return 0
    entropy = 0
    # For strings, convert to bytes if necessary or just use character frequencies.
    # We'll treat it as a byte-level entropy calculation.
    if isinstance(data, str):
        data = data.encode("utf-8")
    
    length = len(data)
    # Count frequencies of each byte (0-255).
    counts = {}
    for byte in data:
        counts[byte] = counts.get(byte, 0) + 1
    
    # Compute entropy sum.
    for count in counts.values():
        probability = count / length
        entropy -= probability * math.log2(probability)
    
    return entropy
