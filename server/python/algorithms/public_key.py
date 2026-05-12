import random

from algorithms.common import gcd, mod, mod_inv, mod_inverse


def is_probable_prime(value):
    """Test whether a number is probably prime."""
    if value < 2:
        return False
    for prime in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]:
        if value == prime:
            return True
        if value % prime == 0:
            return False
    d = value - 1
    s = 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for base in [2, 3, 5, 7, 11]:
        if base >= value - 2:
            continue
        witness = pow(base, d, value)
        if witness in [1, value - 1]:
            continue
        composite = True
        for _ in range(1, s):
            witness = pow(witness, 2, value)
            if witness == value - 1:
                composite = False
                break
        if composite:
            return False
    return True


def generate_prime(bits=16):
    """Generate a random probable prime with the requested bit size."""
    lower = 1 << (bits - 1)
    upper = (1 << bits) - 1
    candidate = random.randrange(lower | 1, upper, 2)
    while not is_probable_prime(candidate):
        candidate += 2
        if candidate > upper:
            candidate = lower | 1
    return candidate


def string_to_integer(message):
    """Convert a short message into a large integer."""
    output = 0
    for byte in (message or "").encode("utf-8"):
        output = (output << 8) | byte
    return output


def integer_to_string(number):
    """Convert a large integer back into a readable string."""
    if number == 0:
        return ""
    data = []
    current = number
    while current > 0:
        data.append(current & 0xFF)
        current >>= 8
    return bytes(reversed(data)).decode("utf-8", errors="ignore")


def point_add(point_a, point_b, coefficient, prime):
    """Add two elliptic-curve points together."""
    if point_a is None:
        return point_b
    if point_b is None:
        return point_a
    x1, y1 = int(point_a["x"]), int(point_a["y"])
    x2, y2 = int(point_b["x"]), int(point_b["y"])
    if x1 == x2 and mod(y1 + y2, prime) == 0:
        return None
    if x1 == x2 and y1 == y2:
        slope = mod((3 * x1 * x1 + coefficient) * mod_inv(2 * y1, prime), prime)
    else:
        slope = mod((y2 - y1) * mod_inv(x2 - x1, prime), prime)
    x3 = mod(slope * slope - x1 - x2, prime)
    y3 = mod(slope * (x1 - x3) - y1, prime)
    return {"x": str(x3), "y": str(y3)}


def scalar_mult_trace(scalar, point, coefficient, prime):
    """Multiply a curve point by a scalar and keep a step trace."""
    result = None
    addend = point
    trace = []
    current = int(scalar)
    bit_index = 0
    while current > 0:
        bit = current & 1
        trace.append({"bit": bit_index, "take": bool(bit), "current": result, "addend": addend})
        if bit:
            result = point_add(result, addend, coefficient, prime)
        addend = point_add(addend, addend, coefficient, prime)
        current >>= 1
        bit_index += 1
    return result, trace


def rsa_keygen(bits):
    """Create an RSA key pair from scratch."""
    bits = max(16, int(bits or 32))
    prime_p = generate_prime(bits // 2)
    prime_q = generate_prime(bits // 2)
    modulus = prime_p * prime_q
    phi = (prime_p - 1) * (prime_q - 1)
    exponent = 65537
    if gcd(exponent, phi) != 1:
        exponent = 17
    private_exponent = mod_inverse(exponent, phi)
    steps = [
        {"step": "Choose prime p", "value": str(prime_p)},
        {"step": "Choose prime q", "value": str(prime_q)},
        {"step": "Compute n = p * q", "value": str(modulus)},
        {"step": "Compute phi(n)", "value": str(phi)},
        {"step": "Select e", "value": str(exponent)},
        {"step": "Compute d = e^-1 mod phi(n)", "value": str(private_exponent)},
    ]
    return {
        "publicKey": {"e": str(exponent), "n": str(modulus)},
        "privateKey": {"d": str(private_exponent), "n": str(modulus)},
        "meta": {"p": str(prime_p), "q": str(prime_q), "phi": str(phi)},
        "steps": steps,
    }


def rsa_encrypt(message, public_key):
    """Encrypt a message with the RSA public key."""
    exponent = int(public_key["e"])
    modulus = int(public_key["n"])
    numeric_message = string_to_integer(message)
    if numeric_message >= modulus:
        raise ValueError("Message too large for selected key")
    ciphertext = str(pow(numeric_message, exponent, modulus))
    steps = [
        {"step": "Convert message to integer", "value": str(numeric_message)},
        {"step": "Apply c = m^e mod n", "formula": f"{numeric_message}^{exponent} mod {modulus}"},
        {"step": "Read ciphertext", "value": ciphertext},
    ]
    return {"ciphertext": ciphertext, "steps": steps}


def rsa_decrypt(ciphertext, private_key):
    """Decrypt a ciphertext with the RSA private key."""
    private_exponent = int(private_key["d"])
    modulus = int(private_key["n"])
    numeric_ciphertext = int(ciphertext)
    numeric_message = pow(numeric_ciphertext, private_exponent, modulus)
    steps = [
        {"step": "Convert ciphertext to integer", "value": str(numeric_ciphertext)},
        {"step": "Apply m = c^d mod n", "formula": f"{numeric_ciphertext}^{private_exponent} mod {modulus}"},
        {"step": "Recover plaintext", "value": integer_to_string(numeric_message)},
    ]
    return {"plaintext": integer_to_string(numeric_message), "steps": steps}


def ecdh(payload):
    """Compute a public key exchange using elliptic curves."""
    prime = int(payload.get("p", "97"))
    coefficient = int(payload.get("a", "2"))
    generator = payload.get("G", {"x": "3", "y": "6"})
    private_a = int(payload.get("privateA", "5"))
    private_b = int(payload.get("privateB", "7"))

    public_a, trace_a = scalar_mult_trace(private_a, generator, coefficient, prime)
    public_b, trace_b = scalar_mult_trace(private_b, generator, coefficient, prime)
    shared_a, shared_trace_a = scalar_mult_trace(private_a, public_b, coefficient, prime)
    shared_b, shared_trace_b = scalar_mult_trace(private_b, public_a, coefficient, prime)
    steps = [
        {"step": "Compute publicA = privateA * G", "value": public_a},
        {"step": "Compute publicB = privateB * G", "value": public_b},
        {"step": "Compute sharedA = privateA * publicB", "value": shared_a},
        {"step": "Compute sharedB = privateB * publicA", "value": shared_b},
        {"step": "Compare both shared secrets", "value": str(shared_a == shared_b)},
    ]
    return {
        "publicA": public_a,
        "publicB": public_b,
        "sharedA": shared_a,
        "sharedB": shared_b,
        "sharedMatch": shared_a == shared_b,
        "steps": steps,
        "trace": {
            "publicA": trace_a,
            "publicB": trace_b,
            "sharedA": shared_trace_a,
            "sharedB": shared_trace_b,
        },
    }