import math

# Define the lowercase alphabet used by the classical cipher code.
ALPHABET = "abcdefghijklmnopqrstuvwxyz"

# Define the most common English letters for the substitution attack heuristic.
ENGLISH_FREQ = "etaoinshrdlcumwfgypbvkjxqz"

# Convert any value to a safe integer with a default fallback.
def as_int(value, default):
    # Return the default when the incoming value is missing.
    if value is None or value == "":
        return int(default)
    # Convert the value to an integer when it is present.
    return int(value)

# Chunk a string into fixed-width rows for transposition ciphers.
def chunk_text(text, cols):
    # Compute the number of rows required for the grid.
    rows = math.ceil(len(text) / cols) if cols else 0
    # Build a padded matrix that uses X placeholders for missing cells.
    matrix = [["X" for _ in range(cols)] for _ in range(rows)]
    # Place each character into its row and column slot.
    for index, char in enumerate(text):
        # Compute the row index from the flat character position.
        row = index // cols
        # Compute the column index from the flat character position.
        col = index % cols
        # Store the current character in the grid.
        matrix[row][col] = char
    # Return the finished matrix.
    return matrix

# Flatten a matrix back into a single string.
def flatten(matrix):
    # Join each row and then join the rows together.
    return "".join("".join(row) for row in matrix)

# Build the inverse of a permutation list.
def inverse_permutation(values):
    # Create a same-length output list filled with zeroes.
    inverse = [0] * len(values)
    # Walk the permutation and place each index into the inverse slot.
    for index, value in enumerate(values):
        # Store the original index at the permuted position.
        inverse[value] = index
    # Return the reversed permutation list.
    return inverse

# Parse a comma-separated permutation string like 2,0,1.
def parse_permutation(raw_value):
    # Split on commas and strip whitespace around each part.
    values = [int(piece.strip()) for piece in (raw_value or "").split(",") if piece.strip()]
    # Validate that the values really form a permutation.
    if sorted(values) != list(range(len(values))):
        # Raise a clear error when the permutation is invalid.
        raise ValueError("Permutation key must be like 2,0,1")
    # Return the parsed permutation.
    return values

# Convert a normal string into a bit string.
def string_to_bits(text):
    # Encode each character as 8 bits and concatenate the result.
    return "".join(format(ord(char), "08b") for char in (text or ""))

# Convert a bit string back into readable text.
def bits_to_string(bits):
    # Collect decoded characters one byte at a time.
    output = []
    # Walk through the bit string in 8-bit chunks.
    for index in range(0, len(bits), 8):
        # Pull the current 8-bit piece.
        chunk = bits[index : index + 8]
        # Decode only full bytes.
        if len(chunk) == 8:
            # Convert the byte into a character.
            output.append(chr(int(chunk, 2)))
    # Join the decoded characters and trim padding.
    return "".join(output).rstrip("\x00")

# Convert a short text value into exactly 16 bytes for the AES-style demo.
def text_to_bytes(text):
    # Start with the UTF-8 byte values for the input string.
    data = [ord(char) for char in (text or "")][:16]
    # Pad the block with zeroes until it reaches 16 bytes.
    while len(data) < 16:
        data.append(0)
    # Return the fixed-size byte block.
    return data

# Convert a hexadecimal string into exactly 16 bytes.
def hex_to_bytes(raw_hex):
    # Remove a possible 0x prefix first.
    cleaned = (raw_hex or "").replace("0x", "")
    # Collect decoded bytes in a list.
    output = []
    # Read the hex string in two-character chunks.
    for index in range(0, len(cleaned), 2):
        # Grab the current hex pair.
        piece = cleaned[index : index + 2]
        # Decode only complete byte pairs.
        if len(piece) == 2:
            # Convert the hex pair into an integer byte.
            output.append(int(piece, 16))
    # Pad with zeroes until the block is 16 bytes long.
    while len(output) < 16:
        output.append(0)
    # Trim to exactly 16 bytes and return the block.
    return output[:16]

# Convert a byte list into a hexadecimal string.
def bytes_to_hex(data):
    # Format each byte as two hex digits.
    return "".join(format(byte, "02x") for byte in data)

# Compute the absolute value of an integer without importing extra helpers.
def abs_int(value):
    # Return the negated value when it is below zero.
    return -value if value < 0 else value

# Compute the greatest common divisor.
def gcd(left, right):
    # Repeat until the remainder becomes zero.
    while right:
        # Update the pair using Euclid's algorithm.
        left, right = right, left % right
    # Return the last non-zero divisor.
    return left

# Compute the extended greatest common divisor.
def egcd(left, right):
    # If the second value is zero, the base case is reached.
    if right == 0:
        # Return the gcd and the coefficients.
        return left, 1, 0
    # Recurse on the reduced pair.
    gcd_value, x_value, y_value = egcd(right, left % right)
    # Rebuild the coefficients on unwind.
    return gcd_value, y_value, x_value - (left // right) * y_value

# Compute a modular inverse.
def mod_inverse(value, modulus):
    # Expand the gcd result into coefficients.
    gcd_value, x_value, _ = egcd(value, modulus)
    # Reject values that do not have an inverse.
    if gcd_value != 1:
        # Explain the failure clearly.
        raise ValueError("No modular inverse")
    # Normalize the coefficient into the modulus range.
    return x_value % modulus

# Normalize an integer into the field range.
def mod(value, modulus):
    # Keep the result inside the positive modulus interval.
    return ((value % modulus) + modulus) % modulus

# Compute a modular inverse inside a finite field.
def mod_inv(value, modulus):
    # Use Python's modular exponent support for the inverse.
    return pow(mod(value, modulus), -1, modulus)
