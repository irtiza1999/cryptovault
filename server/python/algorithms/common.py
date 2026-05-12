import math

ALPHABET = "abcdefghijklmnopqrstuvwxyz"

def as_int(value, default):
    """Convert a value to an integer with a fallback default."""
    if value is None or value == "":
        return int(default)
    return int(value)

def chunk_text(text, cols):
    """Chunk text into fixed-width rows for transposition ciphers."""
    rows = math.ceil(len(text) / cols) if cols else 0
    matrix = [["X" for _ in range(cols)] for _ in range(rows)]
    for index, char in enumerate(text):
        row = index // cols
        col = index % cols
        matrix[row][col] = char
    return matrix

def flatten(matrix):
    """Flatten a matrix back into a single string."""
    return "".join("".join(row) for row in matrix)

def inverse_permutation(values):
    """Build the inverse of a permutation list."""
    inverse = [0] * len(values)
    for index, value in enumerate(values):
        inverse[value] = index
    return inverse

def parse_permutation(raw_value):
    """Parse a comma-separated permutation string like 2,0,1."""
    values = [int(piece.strip()) for piece in (raw_value or "").split(",") if piece.strip()]
    if sorted(values) != list(range(len(values))):
        raise ValueError("Permutation key must be like 2,0,1")
    return values

def string_to_bits(text):
    """Convert text into an 8-bit binary string."""
    return "".join(format(ord(char), "08b") for char in (text or ""))

def bits_to_string(bits):
    """Convert an 8-bit binary string back into text."""
    output = []
    for index in range(0, len(bits), 8):
        chunk = bits[index : index + 8]
        if len(chunk) == 8:
            output.append(chr(int(chunk, 2)))
    return "".join(output).rstrip("\x00")

def text_to_bytes(text):
    """Convert text into exactly 16 bytes for the AES demo."""
    data = [ord(char) for char in (text or "")][:16]
    while len(data) < 16:
        data.append(0)
    return data

def hex_to_bytes(raw_hex):
    """Convert a hexadecimal string into exactly 16 bytes."""
    cleaned = (raw_hex or "").replace("0x", "")
    output = []
    for index in range(0, len(cleaned), 2):
        piece = cleaned[index : index + 2]
        if len(piece) == 2:
            output.append(int(piece, 16))
    while len(output) < 16:
        output.append(0)
    return output[:16]

def bytes_to_hex(data):
    """Convert a byte list into a hexadecimal string."""
    return "".join(format(byte, "02x") for byte in data)

def abs_int(value):
    """Return the absolute value of an integer."""
    return -value if value < 0 else value

def gcd(left, right):
    """Compute the greatest common divisor."""
    while right:
        left, right = right, left % right
    return left

def egcd(left, right):
    """Compute the extended greatest common divisor."""
    if right == 0:
        return left, 1, 0
    gcd_value, x_value, y_value = egcd(right, left % right)
    return gcd_value, y_value, x_value - (left // right) * y_value

def mod_inverse(value, modulus):
    """Compute a modular inverse."""
    gcd_value, x_value, _ = egcd(value, modulus)
    if gcd_value != 1:
        raise ValueError("No modular inverse")
    return x_value % modulus

def mod(value, modulus):
    """Normalize an integer into the field range."""
    return ((value % modulus) + modulus) % modulus

def mod_inv(value, modulus):
    """Compute a modular inverse inside a finite field."""
    return pow(mod(value, modulus), -1, modulus)
