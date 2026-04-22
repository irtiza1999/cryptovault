import random

from algorithms.common import gcd, mod, mod_inv, mod_inverse

# Test whether a number is probably prime.
def is_probable_prime(value):
    # Reject numbers that are too small to matter.
    if value < 2:
        # Small values below 2 are not prime.
        return False
    # Quickly filter against a list of tiny primes.
    for prime in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]:
        # Return true immediately when the value matches a known prime.
        if value == prime:
            return True
        # Reject numbers divisible by the current prime.
        if value % prime == 0:
            return False
    # Write value - 1 as 2^s * d.
    d = value - 1
    # Count how many times the number can be halved.
    s = 0
    # Split out powers of two.
    while d % 2 == 0:
        # Divide the value by two.
        d //= 2
        # Increase the exponent count.
        s += 1
    # Use a small set of bases for the Miller-Rabin style check.
    for base in [2, 3, 5, 7, 11]:
        # Skip bases that are too close to the value.
        if base >= value - 2:
            continue
        # Compute the first witness value.
        witness = pow(base, d, value)
        # Accept the base when it hits the easy cases.
        if witness in [1, value - 1]:
            continue
        # Assume the number is composite until proven otherwise.
        composite = True
        # Repeatedly square the witness value.
        for _ in range(1, s):
            # Update the witness with modular squaring.
            witness = pow(witness, 2, value)
            # Stop when we hit value - 1.
            if witness == value - 1:
                # Mark the number as not composite.
                composite = False
                break
        # Reject the number when no witness works.
        if composite:
            return False
    # Treat the value as probably prime.
    return True

# Generate a random probable prime with the requested bit size.
def generate_prime(bits=16):
    # Compute the lower bound for the chosen bit size.
    lower = 1 << (bits - 1)
    # Compute the upper bound for the chosen bit size.
    upper = (1 << bits) - 1
    # Pick an odd candidate inside the range.
    candidate = random.randrange(lower | 1, upper, 2)
    # Keep moving until a probable prime is found.
    while not is_probable_prime(candidate):
        # Step to the next odd candidate.
        candidate += 2
        # Wrap around when the top of the range is reached.
        if candidate > upper:
            candidate = lower | 1
    # Return the candidate as the generated prime.
    return candidate

# Convert a short message into a large integer.
def string_to_integer(message):
    # Start with a zero accumulator.
    output = 0
    # Encode the message as UTF-8 bytes.
    for byte in (message or "").encode("utf-8"):
        # Shift the current value and append the byte.
        output = (output << 8) | byte
    # Return the combined integer.
    return output

# Convert a large integer back into a readable string.
def integer_to_string(number):
    # Return an empty string for zero.
    if number == 0:
        return ""
    # Collect the bytes in reverse order.
    data = []
    # Work on a temporary copy of the integer.
    current = number
    # Peel off bytes until the integer is exhausted.
    while current > 0:
        # Save the least significant byte.
        data.append(current & 0xFF)
        # Shift the processed byte away.
        current >>= 8
    # Reverse the bytes and decode them.
    return bytes(reversed(data)).decode("utf-8", errors="ignore")

# Add two elliptic-curve points together.
def point_add(point_a, point_b, coefficient, prime):
    # Return the other point when one side is empty.
    if point_a is None:
        return point_b
    # Return the first point when the other side is empty.
    if point_b is None:
        return point_a
    # Read the first point coordinates.
    x1, y1 = int(point_a["x"]), int(point_a["y"])
    # Read the second point coordinates.
    x2, y2 = int(point_b["x"]), int(point_b["y"])
    # Handle the point-at-infinity cancellation case.
    if x1 == x2 and mod(y1 + y2, prime) == 0:
        return None
    # Handle point doubling when the two points are the same.
    if x1 == x2 and y1 == y2:
        slope = mod((3 * x1 * x1 + coefficient) * mod_inv(2 * y1, prime), prime)
    else:
        slope = mod((y2 - y1) * mod_inv(x2 - x1, prime), prime)
    # Compute the x coordinate of the result.
    x3 = mod(slope * slope - x1 - x2, prime)
    # Compute the y coordinate of the result.
    y3 = mod(slope * (x1 - x3) - y1, prime)
    # Return the new point as strings.
    return {"x": str(x3), "y": str(y3)}

# Multiply a curve point by a scalar and keep a step trace.
def scalar_mult_trace(scalar, point, coefficient, prime):
    # Start with no accumulated point.
    result = None
    # Keep the current addend equal to the base point.
    addend = point
    # Keep the trace records here.
    trace = []
    # Work through the scalar bit by bit.
    current = int(scalar)
    # Track the bit position for readability.
    bit_index = 0
    # Continue until all bits are consumed.
    while current > 0:
        # Read the current lowest bit.
        bit = current & 1
        # Save the pre-update state for the UI.
        trace.append({"bit": bit_index, "take": bool(bit), "current": result, "addend": addend})
        # Add the current point when the bit is set.
        if bit:
            result = point_add(result, addend, coefficient, prime)
        # Double the addend for the next bit.
        addend = point_add(addend, addend, coefficient, prime)
        # Shift away the processed bit.
        current >>= 1
        # Increase the bit index for the next loop.
        bit_index += 1
    # Return both the final point and the step trace.
    return result, trace

# Create an RSA key pair from scratch.
def rsa_keygen(bits):
    # Force a minimum bit size for the demo.
    bits = max(16, int(bits or 32))
    # Generate the first prime.
    prime_p = generate_prime(bits // 2)
    # Generate the second prime.
    prime_q = generate_prime(bits // 2)
    # Compute the modulus.
    modulus = prime_p * prime_q
    # Compute Euler's totient.
    phi = (prime_p - 1) * (prime_q - 1)
    # Start with the common public exponent.
    exponent = 65537
    # Fall back to a smaller exponent when necessary.
    if gcd(exponent, phi) != 1:
        exponent = 17
    # Compute the private exponent.
    private_exponent = mod_inverse(exponent, phi)
    # Build a visible step trace for the UI.
    steps = [
        {"step": "Choose prime p", "value": str(prime_p)},
        {"step": "Choose prime q", "value": str(prime_q)},
        {"step": "Compute n = p × q", "value": str(modulus)},
        {"step": "Compute φ(n)", "value": str(phi)},
        {"step": "Select e", "value": str(exponent)},
        {"step": "Compute d = e^-1 mod φ(n)", "value": str(private_exponent)},
    ]
    # Return the key material as strings for JSON transport.
    return {
        "publicKey": {"e": str(exponent), "n": str(modulus)},
        "privateKey": {"d": str(private_exponent), "n": str(modulus)},
        "meta": {"p": str(prime_p), "q": str(prime_q), "phi": str(phi)},
        "steps": steps,
    }

# Encrypt a message with the RSA public key.
def rsa_encrypt(message, public_key):
    # Read the public exponent.
    exponent = int(public_key["e"])
    # Read the modulus.
    modulus = int(public_key["n"])
    # Convert the message into an integer.
    numeric_message = string_to_integer(message)
    # Reject messages that are too large for the modulus.
    if numeric_message >= modulus:
        raise ValueError("Message too large for selected key")
    # Compute the ciphertext using modular exponentiation.
    ciphertext = str(pow(numeric_message, exponent, modulus))
    # Build a visible step trace for the UI.
    steps = [
        {"step": "Convert message to integer", "value": str(numeric_message)},
        {"step": "Apply c = m^e mod n", "formula": f"{numeric_message}^{exponent} mod {modulus}"},
        {"step": "Read ciphertext", "value": ciphertext},
    ]
    # Return the ciphertext as a decimal string.
    return {"ciphertext": ciphertext, "steps": steps}

# Decrypt a ciphertext with the RSA private key.
def rsa_decrypt(ciphertext, private_key):
    # Read the private exponent.
    private_exponent = int(private_key["d"])
    # Read the modulus.
    modulus = int(private_key["n"])
    # Recover the integer message.
    numeric_ciphertext = int(ciphertext)
    # Recover the integer message with the private key.
    numeric_message = pow(numeric_ciphertext, private_exponent, modulus)
    # Build a visible step trace for the UI.
    steps = [
        {"step": "Convert ciphertext to integer", "value": str(numeric_ciphertext)},
        {"step": "Apply m = c^d mod n", "formula": f"{numeric_ciphertext}^{private_exponent} mod {modulus}"},
        {"step": "Recover plaintext", "value": integer_to_string(numeric_message)},
    ]
    # Convert the message integer back into text.
    return {"plaintext": integer_to_string(numeric_message), "steps": steps}

# Compute a public key exchange using elliptic curves.
def ecdh(payload):
    # Read the curve prime.
    prime = int(payload.get("p", "97"))
    # Read the curve coefficient.
    coefficient = int(payload.get("a", "2"))
    # Read the base point.
    generator = payload.get("G", {"x": "3", "y": "6"})
    # Read the first private scalar.
    private_a = int(payload.get("privateA", "5"))
    # Read the second private scalar.
    private_b = int(payload.get("privateB", "7"))

    # Compute public key A from private scalar A.
    public_a, trace_a = scalar_mult_trace(private_a, generator, coefficient, prime)
    # Compute public key B from private scalar B.
    public_b, trace_b = scalar_mult_trace(private_b, generator, coefficient, prime)
    # Compute the shared secret from side A.
    shared_a, shared_trace_a = scalar_mult_trace(private_a, public_b, coefficient, prime)
    # Compute the shared secret from side B.
    shared_b, shared_trace_b = scalar_mult_trace(private_b, public_a, coefficient, prime)
    # Build a visible step trace for the UI.
    steps = [
        {"step": "Compute publicA = privateA × G", "value": public_a},
        {"step": "Compute publicB = privateB × G", "value": public_b},
        {"step": "Compute sharedA = privateA × publicB", "value": shared_a},
        {"step": "Compute sharedB = privateB × publicA", "value": shared_b},
        {"step": "Compare both shared secrets", "value": str(shared_a == shared_b)},
    ]
    # Return the shared key exchange result.
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
