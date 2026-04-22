from algorithms.common import bits_to_string, bytes_to_hex, hex_to_bytes, mod, mod_inv, string_to_bits, text_to_bytes

# Derive a list of pseudo round keys from the key bits.
def derive_round_keys(bits):
    # Pad the bit string to a fixed 64-bit working area.
    rolling = (bits + "0" * 64)[:64]
    # Store all the round keys here.
    keys = []
    # Build sixteen round keys for the DES-style demo.
    for _ in range(16):
        # Rotate the working bits left by three positions.
        rolling = rolling[3:] + rolling[:3]
        # Keep the first half as the round key.
        keys.append(rolling[:32])
    # Return the full round key schedule.
    return keys

# Apply the toy Feistel round used by the DES-style cipher.
def feistel_round(left, right, round_key):
    # Expand the right side with a small repeated pattern.
    expanded = right + right[:16]
    # Mix the expanded right side with the round key.
    mixed = "".join("0" if a == b else "1" for a, b in zip(expanded[:32], round_key))
    # XOR the mixed data into the left side.
    new_right = "".join("0" if a == b else "1" for a, b in zip(left, mixed))
    # Return the new block ordering.
    return right, new_right

# Process a single 64-bit block through all rounds.
def process_des_block(block, round_keys):
    # Split the block into left and right halves.
    left, right = block[:32], block[32:64]
    # Keep a trace of every round here.
    rounds = []
    # Run the block through each round key.
    for index, round_key in enumerate(round_keys):
        # Apply the Feistel round transformation.
        left, right = feistel_round(left, right, round_key)
        # Save the current round state for inspection.
        rounds.append({"round": index + 1, "left": left, "right": right})
    # Return the final block after the swap.
    return right + left, rounds

# XOR two equal-length bit strings.
def xor_bits(left, right):
    # Combine each bit position with xor semantics.
    return "".join("0" if a == b else "1" for a, b in zip(left, right))

# XOR two equal-length byte lists.
def xor_bytes(left, right):
    # Combine each byte position with xor semantics.
    return [l ^ r for l, r in zip(left, right)]

# Split text into fixed-size blocks and pad the tail with null bytes.
def split_text_blocks(text, block_size):
    # Keep at least one block so empty input still round-trips consistently.
    raw = text or ""
    if not raw:
        raw = "\x00" * block_size
    # Collect block-sized chunks here.
    blocks = []
    # Walk the text block by block.
    for index in range(0, len(raw), block_size):
        # Pad the final chunk to the block size.
        chunk = (raw[index : index + block_size] + "\x00" * block_size)[:block_size]
        blocks.append(chunk)
    # Return the padded block list.
    return blocks

# Split a hexadecimal string into fixed-size blocks.
def split_hex_blocks(raw_hex, block_hex_len):
    # Normalize the incoming hex string.
    cleaned = (raw_hex or "").replace("0x", "").strip().lower()
    # Keep at least one block so empty input still round-trips consistently.
    if not cleaned:
        cleaned = "0" * block_hex_len
    # Collect block-sized chunks here.
    blocks = []
    # Walk the hex string block by block.
    for index in range(0, len(cleaned), block_hex_len):
        # Pad the final chunk to the block size.
        chunk = (cleaned[index : index + block_hex_len] + "0" * block_hex_len)[:block_hex_len]
        blocks.append(chunk)
    # Return the padded block list.
    return blocks

# Convert a bit string to a zero-padded hex block.
def bits_to_block_hex(bits, byte_width):
    # Convert the bit string and left-pad it to the desired size.
    return hex(int(bits or "0", 2))[2:].zfill(byte_width * 2)

# Convert a byte list to readable text while trimming zero padding.
def bytes_to_text(data):
    # Turn each byte back into a character.
    return "".join(chr(byte) for byte in data).rstrip("\x00")

# Normalize a hex IV to a fixed block width.
def normalize_hex_iv(raw_hex, block_hex_len):
    # Strip common prefixes and whitespace.
    cleaned = (raw_hex or "").replace("0x", "").strip().lower()
    # Fall back to zero IV for the demo.
    if not cleaned:
        cleaned = "0" * block_hex_len
    # Pad or trim to the block width.
    return (cleaned + "0" * block_hex_len)[:block_hex_len]

# Convert a hex IV into bytes.
def hex_iv_bytes(raw_hex, block_bytes):
    # Normalize the hex input first.
    cleaned = normalize_hex_iv(raw_hex, block_bytes * 2)
    # Convert the normalized bytes into a list.
    return hex_to_bytes(cleaned)[:block_bytes]

# Split text into fixed-size 8-byte blocks for the DES-style cipher.
def text_to_des_blocks(text):
    # Keep at least one block so empty input still round-trips consistently.
    raw = text or ""
    if not raw:
        raw = "\x00" * 8
    # Collect 8-byte chunks here.
    blocks = []
    # Walk the text eight characters at a time.
    for index in range(0, len(raw), 8):
        # Pad the final chunk with null bytes to a full block.
        chunk = (raw[index : index + 8] + "\x00" * 8)[:8]
        # Convert the block into a 64-bit bit string.
        blocks.append(string_to_bits(chunk))
    # Return the block list.
    return blocks

# Split a DES hex string into 64-bit blocks.
def hex_to_des_blocks(hex_text):
    # Normalize the incoming hex string.
    cleaned = (hex_text or "").replace("0x", "")
    # Keep at least one block so empty input still round-trips consistently.
    if not cleaned:
        return ["0" * 64]
    # Collect 16-digit hex chunks and pad the last one if needed.
    blocks = []
    for index in range(0, len(cleaned), 16):
        # Pad the final chunk to one full block.
        chunk = (cleaned[index : index + 16] + "0" * 16)[:16]
        # Convert the block into a 64-bit bit string.
        blocks.append(bin(int(chunk, 16))[2:].zfill(64))
    # Return the block list.
    return blocks

# Encrypt a short message with the DES-style block cipher.
def des_encrypt(text, key, mode="ecb", iv=None):
    # Turn the key into a bit string.
    key_bits = string_to_bits(key or "secret!!")
    # Build the round key schedule.
    round_keys = derive_round_keys(key_bits)
    # Normalize the requested mode.
    mode = (mode or "ecb").lower()
    # Split the plaintext into fixed-size blocks.
    blocks = split_text_blocks(text, 8)
    # Set up the CBC chain state when needed.
    previous_bits = None
    if mode == "cbc":
        previous_bits = bin(int(normalize_hex_iv(iv, 16), 16))[2:].zfill(64)
    # Encrypt each block independently or as a CBC chain.
    ciphertext_parts = []
    block_traces = []
    rounds = []
    for block_index, chunk in enumerate(blocks):
        # Convert the plaintext block into bits.
        plain_bits = string_to_bits(chunk)
        # Apply CBC chaining when requested.
        chain_bits = xor_bits(plain_bits, previous_bits) if mode == "cbc" else plain_bits
        # Run the block through the Feistel network.
        cipher_bits, block_rounds = process_des_block(chain_bits, round_keys)
        # Store the ciphertext for this block.
        cipher_hex = bits_to_block_hex(cipher_bits, 8)
        ciphertext_parts.append(cipher_hex)
        # Store a block-level trace for the UI.
        block_traces.append({
            "index": block_index + 1,
            "plainBits": plain_bits,
            "chainBits": chain_bits,
            "cipherBits": cipher_bits,
            "plainHex": bits_to_block_hex(plain_bits, 8),
            "chainHex": bits_to_block_hex(chain_bits, 8),
            "cipherHex": cipher_hex,
            "rounds": [{**round_state, "block": block_index + 1} for round_state in block_rounds],
        })
        # Keep the first block trace for the existing insight UI.
        if block_index == 0:
            rounds = block_traces[0]["rounds"]
        # Advance the CBC chain when needed.
        if mode == "cbc":
            previous_bits = cipher_bits
    # Return the full ciphertext and the round trace.
    return {
        "mode": mode.upper(),
        "ivHex": normalize_hex_iv(iv, 16) if mode == "cbc" else None,
        "ciphertextHex": "".join(ciphertext_parts),
        "rounds": rounds,
        "blocks": block_traces,
        "blockCount": len(blocks),
    }

# Decrypt a hex string with the DES-style block cipher.
def des_decrypt(hex_text, key, mode="ecb", iv=None):
    # Turn the key into a bit string.
    key_bits = string_to_bits(key or "secret!!")
    # Rebuild the round keys and reverse their order.
    round_keys = list(reversed(derive_round_keys(key_bits)))
    # Normalize the requested mode.
    mode = (mode or "ecb").lower()
    # Split the ciphertext into fixed-size blocks.
    blocks = split_hex_blocks(hex_text, 16)
    # Set up the CBC chain state when needed.
    previous_bits = None
    if mode == "cbc":
        previous_bits = bin(int(normalize_hex_iv(iv, 16), 16))[2:].zfill(64)
    # Decrypt each block independently or as a CBC chain.
    plaintext_parts = []
    block_traces = []
    rounds = []
    for block_index, chunk in enumerate(blocks):
        # Convert the current ciphertext block into bits.
        cipher_bits = bin(int(chunk, 16))[2:].zfill(64)
        # Run the reversed round schedule.
        chain_bits, block_rounds = process_des_block(cipher_bits, round_keys)
        # Undo the CBC chain when requested.
        plain_bits = xor_bits(chain_bits, previous_bits) if mode == "cbc" else chain_bits
        # Convert the resulting bits back into readable text.
        plaintext_parts.append(bits_to_string(plain_bits))
        # Store a block-level trace for the UI.
        block_traces.append({
            "index": block_index + 1,
            "cipherBits": cipher_bits,
            "chainBits": chain_bits,
            "plainBits": plain_bits,
            "cipherHex": chunk,
            "chainHex": bits_to_block_hex(chain_bits, 8),
            "plainHex": bits_to_block_hex(plain_bits, 8),
            "rounds": [{**round_state, "block": block_index + 1} for round_state in block_rounds],
        })
        # Keep the first block trace for the existing insight UI.
        if block_index == 0:
            rounds = block_traces[0]["rounds"]
        # Advance the CBC chain when needed.
        if mode == "cbc":
            previous_bits = cipher_bits
    # Join the block outputs and strip padding from the tail only.
    plaintext = "".join(plaintext_parts).rstrip("\x00")
    # Return the plaintext and the round trace.
    return {
        "mode": mode.upper(),
        "ivHex": normalize_hex_iv(iv, 16) if mode == "cbc" else None,
        "plaintext": plaintext,
        "rounds": rounds,
        "blocks": block_traces,
        "blockCount": len(blocks),
    }

# Rotate an 8-bit value left by a fixed amount.
def rotate_left(value, shift):
    # Keep the rotated value inside one byte.
    return ((value << shift) | (value >> (8 - shift))) & 0xFF

# Apply the toy S-box transform.
def sbox(value):
    # Mix the byte and then rotate it.
    return rotate_left(value ^ 0x63, 1) ^ 0x1B

# Apply the inverse toy S-box transform.
def inv_sbox(value):
    # Reverse the rotate and mix pattern.
    return rotate_left(value ^ 0x1B, 7) ^ 0x63

# Shift AES rows in the toy 4x4 state matrix.
def shift_rows(state):
    # Copy the state so we can mutate safely.
    output = state[:]
    # Walk each row in the 4x4 layout.
    for row_index in range(4):
        # Extract the row from column-major storage.
        row = [state[row_index], state[row_index + 4], state[row_index + 8], state[row_index + 12]]
        # Rotate the row left by the row index.
        shifted = row[row_index:] + row[:row_index]
        # Write the shifted row back into the state.
        output[row_index], output[row_index + 4], output[row_index + 8], output[row_index + 12] = shifted
    # Return the shifted state.
    return output

# Undo the AES-style row shift.
def inv_shift_rows(state):
    # Copy the state so we can mutate safely.
    output = state[:]
    # Walk each row in the 4x4 layout.
    for row_index in range(4):
        # Extract the row from column-major storage.
        row = [state[row_index], state[row_index + 4], state[row_index + 8], state[row_index + 12]]
        # Rotate the row right by the row index.
        shifted = row[4 - row_index :] + row[: 4 - row_index]
        # Write the shifted row back into the state.
        output[row_index], output[row_index + 4], output[row_index + 8], output[row_index + 12] = shifted
    # Return the restored state.
    return output

# Mix the AES-style columns in the toy state.
def mix_columns(state):
    # Copy the state so we can mutate safely.
    output = state[:]
    # Walk each column in the 4x4 matrix.
    for column in range(4):
        # Compute the starting index for the current column.
        index = column * 4
        # Read the four bytes in the column.
        a0, a1, a2, a3 = state[index], state[index + 1], state[index + 2], state[index + 3]
        # Use a triangular xor mix so the transform remains reversible.
        output[index] = (a0 ^ a1) & 0xFF
        # Mix the next value.
        output[index + 1] = (a1 ^ a2) & 0xFF
        # Mix the third value.
        output[index + 2] = (a2 ^ a3) & 0xFF
        # Keep the tail byte to preserve invertibility.
        output[index + 3] = a3 & 0xFF
    # Return the mixed state.
    return output

# Undo the AES-style column mix.
def inv_mix_columns(state):
    # Copy the state so we can mutate safely.
    output = state[:]
    # Walk each column in the 4x4 matrix.
    for column in range(4):
        # Compute the starting index for the current column.
        index = column * 4
        # Read the four bytes in the column.
        b0, b1, b2, b3 = state[index], state[index + 1], state[index + 2], state[index + 3]
        # Rebuild the original column by undoing the xor chain from the tail.
        output[index + 3] = b3 & 0xFF
        # Rebuild the third byte.
        output[index + 2] = (b2 ^ output[index + 3]) & 0xFF
        # Rebuild the second byte.
        output[index + 1] = (b1 ^ output[index + 2]) & 0xFF
        # Rebuild the first byte.
        output[index] = (b0 ^ output[index + 1]) & 0xFF
    # Return the restored state.
    return output

# Expand a 16-byte AES-style key into 10 round keys.
def expand_key(key_bytes):
    # Store the generated keys here.
    keys = []
    # Start from the original key material.
    current = key_bytes[:]
    # Build ten round keys for the demo cipher.
    for round_index in range(10):
        # Mix the key bytes with the round number.
        current = [sbox(byte ^ ((round_index + 1 + index) & 0xFF)) for index, byte in enumerate(current)]
        # Save the current round key snapshot.
        keys.append(current[:])
    # Return the full round-key list.
    return keys

# Encrypt a single AES-style block.
def aes_encrypt_block(state, key_bytes, round_keys):
    # Apply the initial key whitening.
    state = xor_bytes(state, key_bytes)
    # Keep each round state for the UI.
    rounds = []
    # Run the state through ten rounds.
    for round_index in range(10):
        # Apply the substitution layer.
        state = [sbox(byte) for byte in state]
        # Apply the row shift layer.
        state = shift_rows(state)
        # Skip column mixing on the final round.
        if round_index < 9:
            # Apply the column mixing layer.
            state = mix_columns(state)
        # Apply the round key.
        state = xor_bytes(state, round_keys[round_index])
        # Save the round output as hex.
        rounds.append({"round": round_index + 1, "stateHex": bytes_to_hex(state)})
    # Return the final ciphertext and the full trace.
    return state, rounds

# Decrypt a single AES-style block.
def aes_decrypt_block(state, key_bytes, round_keys):
    # Collect the reverse round trace here.
    rounds = []
    # Walk the rounds in reverse order.
    for round_index in range(9, -1, -1):
        # Remove the round key.
        state = xor_bytes(state, round_keys[round_index])
        # Skip the inverse mix on the last forward round.
        if round_index < 9:
            # Undo the column mixing layer.
            state = inv_mix_columns(state)
        # Undo the row shift layer.
        state = inv_shift_rows(state)
        # Undo the substitution layer.
        state = [inv_sbox(byte) for byte in state]
        # Save the reverse round state.
        rounds.append({"round": 10 - round_index, "stateHex": bytes_to_hex(state)})
    # Remove the initial key whitening.
    state = xor_bytes(state, key_bytes)
    # Return the plaintext block and the trace.
    return state, rounds

# Encrypt a short message with the AES-style demo cipher.
def aes_encrypt(text, key, mode="ecb", iv=None):
    # Convert the key into a 16-byte block.
    key_bytes = text_to_bytes(key or "sixteen-char-key")
    # Generate the round key list.
    round_keys = expand_key(key_bytes)
    # Normalize the requested mode.
    mode = (mode or "ecb").lower()
    # Split the plaintext into fixed-size blocks.
    blocks = split_text_blocks(text, 16)
    # Set up the CBC chain state when needed.
    previous_state = hex_iv_bytes(iv, 16) if mode == "cbc" else None
    # Encrypt each block independently or as a CBC chain.
    ciphertext_parts = []
    block_traces = []
    rounds = []
    for block_index, chunk in enumerate(blocks):
        # Convert the plaintext block into bytes.
        plain_state = text_to_bytes(chunk)
        # Apply CBC chaining when requested.
        chain_state = xor_bytes(plain_state, previous_state) if mode == "cbc" else plain_state
        # Run the block through the AES-style demo cipher.
        cipher_state, block_rounds = aes_encrypt_block(chain_state, key_bytes, round_keys)
        # Append the ciphertext for this block.
        cipher_hex = bytes_to_hex(cipher_state)
        ciphertext_parts.append(cipher_hex)
        # Store a block-level trace for the UI.
        block_traces.append({
            "index": block_index + 1,
            "plainHex": bytes_to_hex(plain_state),
            "chainHex": bytes_to_hex(chain_state),
            "cipherHex": cipher_hex,
            "rounds": block_rounds,
        })
        # Keep the first block trace for compatibility with the current view.
        if block_index == 0:
            rounds = block_rounds
        # Advance the CBC chain when needed.
        if mode == "cbc":
            previous_state = cipher_state[:]
    # Return the final ciphertext and the full trace.
    return {
        "mode": mode.upper(),
        "ivHex": bytes_to_hex(hex_iv_bytes(iv, 16)) if mode == "cbc" else None,
        "ciphertextHex": "".join(ciphertext_parts),
        "rounds": rounds,
        "blocks": block_traces,
        "blockCount": len(blocks),
    }

# Decrypt a hex string with the AES-style demo cipher.
def aes_decrypt(text, key, mode="ecb", iv=None):
    # Convert the key into a 16-byte block.
    key_bytes = text_to_bytes(key or "sixteen-char-key")
    # Generate the same round key list.
    round_keys = expand_key(key_bytes)
    # Normalize the requested mode.
    mode = (mode or "ecb").lower()
    # Split the ciphertext into fixed-size blocks.
    blocks = split_hex_blocks(text, 32)
    # Set up the CBC chain state when needed.
    previous_state = hex_iv_bytes(iv, 16) if mode == "cbc" else None
    # Decrypt each block independently or as a CBC chain.
    plaintext_parts = []
    block_traces = []
    rounds = []
    for block_index, chunk in enumerate(blocks):
        # Convert the current ciphertext block into bytes.
        cipher_state = hex_to_bytes(chunk)
        # Run the reversed round schedule.
        chain_state, block_rounds = aes_decrypt_block(cipher_state[:], key_bytes, round_keys)
        # Undo the CBC chaining when requested.
        plain_state = xor_bytes(chain_state, previous_state) if mode == "cbc" else chain_state
        # Convert the bytes back into text.
        plaintext_parts.append(bytes_to_text(plain_state))
        # Store a block-level trace for the UI.
        block_traces.append({
            "index": block_index + 1,
            "cipherHex": bytes_to_hex(cipher_state),
            "chainHex": bytes_to_hex(chain_state),
            "plainHex": bytes_to_hex(plain_state),
            "rounds": block_rounds,
        })
        # Keep the first block trace for compatibility with the current view.
        if block_index == 0:
            rounds = block_rounds
        # Advance the CBC chain when needed.
        if mode == "cbc":
            previous_state = cipher_state[:]
    # Join the block outputs and strip padding from the tail only.
    plaintext = "".join(plaintext_parts).rstrip("\x00")
    # Return the plaintext and the trace.
    return {
        "mode": mode.upper(),
        "ivHex": bytes_to_hex(hex_iv_bytes(iv, 16)) if mode == "cbc" else None,
        "plaintext": plaintext,
        "rounds": rounds,
        "blocks": block_traces,
        "blockCount": len(blocks),
    }
