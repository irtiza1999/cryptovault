import math

def shannon_entropy(data):
    """Calculate the Shannon entropy of a string or bytes object."""
    if not data:
        return 0
    entropy = 0
    if isinstance(data, str):
        data = data.encode("utf-8")
    
    length = len(data)
    counts = {}
    for byte in data:
        counts[byte] = counts.get(byte, 0) + 1
    
    for count in counts.values():
        probability = count / length
        entropy -= probability * math.log2(probability)
    
    return entropy
