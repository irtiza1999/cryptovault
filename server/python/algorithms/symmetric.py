from algorithms.common import bits_to_string, bytes_to_hex, hex_to_bytes, mod, mod_inv, string_to_bits, text_to_bytes

_DES_PC1 = [
    57,49,41,33,25,17, 9,
     1,58,50,42,34,26,18,
    10, 2,59,51,43,35,27,
    19,11, 3,60,52,44,36,
    63,55,47,39,31,23,15,
     7,62,54,46,38,30,22,
    14, 6,61,53,45,37,29,
    21,13, 5,28,20,12, 4,
]

_DES_PC2 = [
    14,17,11,24, 1, 5,
     3,28,15, 6,21,10,
    23,19,12, 4,26, 8,
    16, 7,27,20,13, 2,
    41,52,31,37,47,55,
    30,40,51,45,33,48,
    44,49,39,56,34,53,
    46,42,50,36,29,32,
]

_DES_SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1]

_DES_IP = [
    58,50,42,34,26,18,10, 2,
    60,52,44,36,28,20,12, 4,
    62,54,46,38,30,22,14, 6,
    64,56,48,40,32,24,16, 8,
    57,49,41,33,25,17, 9, 1,
    59,51,43,35,27,19,11, 3,
    61,53,45,37,29,21,13, 5,
    63,55,47,39,31,23,15, 7,
]

_DES_FP = [
    40, 8,48,16,56,24,64,32,
    39, 7,47,15,55,23,63,31,
    38, 6,46,14,54,22,62,30,
    37, 5,45,13,53,21,61,29,
    36, 4,44,12,52,20,60,28,
    35, 3,43,11,51,19,59,27,
    34, 2,42,10,50,18,58,26,
    33, 1,41, 9,49,17,57,25,
]

_DES_E = [
    32, 1, 2, 3, 4, 5,
     4, 5, 6, 7, 8, 9,
     8, 9,10,11,12,13,
    12,13,14,15,16,17,
    16,17,18,19,20,21,
    20,21,22,23,24,25,
    24,25,26,27,28,29,
    28,29,30,31,32, 1,
]

_DES_P = [
    16, 7,20,21,
    29,12,28,17,
     1,15,23,26,
     5,18,31,10,
     2, 8,24,14,
    32,27, 3, 9,
    19,13,30, 6,
    22,11, 4,25,
]

_DES_SBOXES = [
    [14, 4,13, 1, 2,15,11, 8, 3,10, 6,12, 5, 9, 0, 7,
      0,15, 7, 4,14, 2,13, 1,10, 6,12,11, 9, 5, 3, 8,
      4, 1,14, 8,13, 6, 2,11,15,12, 9, 7, 3,10, 5, 0,
     15,12, 8, 2, 4, 9, 1, 7, 5,11, 3,14,10, 0, 6,13],
    [15, 1, 8,14, 6,11, 3, 4, 9, 7, 2,13,12, 0, 5,10,
      3,13, 4, 7,15, 2, 8,14,12, 0, 1,10, 6, 9,11, 5,
      0,14, 7,11,10, 4,13, 1, 5, 8,12, 6, 9, 3, 2,15,
     13, 8,10, 1, 3,15, 4, 2,11, 6, 7,12, 0, 5,14, 9],
    [10, 0, 9,14, 6, 3,15, 5, 1,13,12, 7,11, 4, 2, 8,
     13, 7, 0, 9, 3, 4, 6,10, 2, 8, 5,14,12,11,15, 1,
     13, 6, 4, 9, 8,15, 3, 0,11, 1, 2,12, 5,10,14, 7,
      1,10,13, 0, 6, 9, 8, 7, 4,15,14, 3,11, 5, 2,12],
    [ 7,13,14, 3, 0, 6, 9,10, 1, 2, 8, 5,11,12, 4,15,
     13, 8,11, 5, 6,15, 0, 3, 4, 7, 2,12, 1,10,14, 9,
     10, 6, 9, 0,12,11, 7,13,15, 1, 3,14, 5, 2, 8, 4,
      3,15, 0, 6,10, 1,13, 8, 9, 4, 5,11,12, 7, 2,14],
    [ 2,12, 4, 1, 7,10,11, 6, 8, 5, 3,15,13, 0,14, 9,
     14,11, 2,12, 4, 7,13, 1, 5, 0,15,10, 3, 9, 8, 6,
      4, 2, 1,11,10,13, 7, 8,15, 9,12, 5, 6, 3, 0,14,
     11, 8,12, 7, 1,14, 2,13, 6,15, 0, 9,10, 4, 5, 3],
    [12, 1,10,15, 9, 2, 6, 8, 0,13, 3, 4,14, 7, 5,11,
     10,15, 4, 2, 7,12, 9, 5, 6, 1,13,14, 0,11, 3, 8,
      9,14,15, 5, 2, 8,12, 3, 7, 0, 4,10, 1,13,11, 6,
      4, 3, 2,12, 9, 5,15,10,11,14, 1, 7, 6, 0, 8,13],
    [ 4,11, 2,14,15, 0, 8,13, 3,12, 9, 7, 5,10, 6, 1,
     13, 0,11, 7, 4, 9, 1,10,14, 3, 5,12, 2,15, 8, 6,
      1, 4,11,13,12, 3, 7,14,10,15, 6, 8, 0, 5, 9, 2,
      6,11,13, 8, 1, 4,10, 7, 9, 5, 0,15,14, 2, 3,12],
    [13, 2, 8, 4, 6,15,11, 1,10, 9, 3,14, 5, 0,12, 7,
      1,15,13, 8,10, 3, 7, 4,12, 5, 6,11, 0,14, 9, 2,
      7,11, 4, 1, 9,12,14, 2, 0, 6,10,13,15, 3, 5, 8,
      2, 1,14, 7, 4,10, 8,13,15,12, 9, 0, 3, 5, 6,11],
]

def _permute(bits, table):
    return [bits[i - 1] for i in table]

def _rotate_left_bits(bits, n):
    return bits[n:] + bits[:n]

def _xor_lists(a, b):
    return [x ^ y for x, y in zip(a, b)]

def _list_to_str(bits):
    return "".join(str(b) for b in bits)

def _str_to_list(s):
    return [int(c) for c in s]

def _sbox_lookup(six_bits, box_index):
    row = (six_bits[0] << 1) | six_bits[5]
    col = (six_bits[1] << 3) | (six_bits[2] << 2) | (six_bits[3] << 1) | six_bits[4]
    val = _DES_SBOXES[box_index][row * 16 + col]
    return [(val >> (3 - i)) & 1 for i in range(4)]

def _des_round_function(right_bits, round_key_bits):
    expanded = _permute(right_bits, _DES_E)
    xored = _xor_lists(expanded, round_key_bits)
    sbox_out = []
    for i in range(8):
        sbox_out.extend(_sbox_lookup(xored[i * 6:(i + 1) * 6], i))
    return _permute(sbox_out, _DES_P)

def _des_key_schedule(key_bits_str):
    key_bits = _str_to_list((key_bits_str + "0" * 64)[:64])
    cd = _permute(key_bits, _DES_PC1)
    c, d = cd[:28], cd[28:]
    round_keys = []
    for shift in _DES_SHIFTS:
        c = _rotate_left_bits(c, shift)
        d = _rotate_left_bits(d, shift)
        round_keys.append(_permute(c + d, _DES_PC2))
    return round_keys

def _des_process_block(block_bits_str, round_keys):
    bits = _str_to_list((block_bits_str + "0" * 64)[:64])
    bits = _permute(bits, _DES_IP)
    left, right = bits[:32], bits[32:]
    rounds = []
    for i, rk in enumerate(round_keys):
        f_out = _des_round_function(right, rk)
        new_right = _xor_lists(left, f_out)
        left = right
        right = new_right
        rounds.append({
            "round": i + 1,
            "left": _list_to_str(left),
            "right": _list_to_str(right),
        })
    combined = right + left
    final = _permute(combined, _DES_FP)
    return _list_to_str(final), rounds

def xor_bits(left, right):
    return "".join("0" if a == b else "1" for a, b in zip(left, right))

def xor_bytes(left, right):
    return [l ^ r for l, r in zip(left, right)]

def split_text_blocks(text, block_size):
    raw = text or ""
    if not raw:
        raw = "\x00" * block_size
    blocks = []
    for index in range(0, len(raw), block_size):
        chunk = (raw[index:index + block_size] + "\x00" * block_size)[:block_size]
        blocks.append(chunk)
    return blocks

def split_hex_blocks(raw_hex, block_hex_len):
    cleaned = (raw_hex or "").replace("0x", "").strip().lower()
    if not cleaned:
        cleaned = "0" * block_hex_len
    blocks = []
    for index in range(0, len(cleaned), block_hex_len):
        chunk = (cleaned[index:index + block_hex_len] + "0" * block_hex_len)[:block_hex_len]
        blocks.append(chunk)
    return blocks

def bits_to_block_hex(bits, byte_width):
    return hex(int(bits or "0", 2))[2:].zfill(byte_width * 2)

def bytes_to_text(data):
    return "".join(chr(byte) for byte in data).rstrip("\x00")

def normalize_hex_iv(raw_hex, block_hex_len):
    cleaned = (raw_hex or "").replace("0x", "").strip().lower()
    if not cleaned:
        cleaned = "0" * block_hex_len
    return (cleaned + "0" * block_hex_len)[:block_hex_len]

def hex_iv_bytes(raw_hex, block_bytes):
    cleaned = normalize_hex_iv(raw_hex, block_bytes * 2)
    return hex_to_bytes(cleaned)[:block_bytes]

def des_encrypt(text, key, mode="ecb", iv=None):
    raw_key = (key or "secret!!")[:8].ljust(8, "\x00")
    key_bits = string_to_bits(raw_key)
    round_keys = _des_key_schedule(key_bits)
    mode = (mode or "ecb").lower()
    blocks = split_text_blocks(text, 8)
    previous_bits = None
    if mode == "cbc":
        previous_bits = bin(int(normalize_hex_iv(iv, 16), 16))[2:].zfill(64)
    ciphertext_parts = []
    block_traces = []
    rounds = []
    for block_index, chunk in enumerate(blocks):
        plain_bits = string_to_bits(chunk)
        chain_bits = xor_bits(plain_bits, previous_bits) if mode == "cbc" else plain_bits
        cipher_bits, block_rounds = _des_process_block(chain_bits, round_keys)
        cipher_hex = bits_to_block_hex(cipher_bits, 8)
        ciphertext_parts.append(cipher_hex)
        block_traces.append({
            "index": block_index + 1,
            "plainBits": plain_bits,
            "chainBits": chain_bits,
            "cipherBits": cipher_bits,
            "plainHex": bits_to_block_hex(plain_bits, 8),
            "chainHex": bits_to_block_hex(chain_bits, 8),
            "cipherHex": cipher_hex,
            "rounds": [{**r, "block": block_index + 1} for r in block_rounds],
        })
        if block_index == 0:
            rounds = block_traces[0]["rounds"]
        if mode == "cbc":
            previous_bits = cipher_bits
    return {
        "mode": mode.upper(),
        "ivHex": normalize_hex_iv(iv, 16) if mode == "cbc" else None,
        "ciphertextHex": "".join(ciphertext_parts),
        "rounds": rounds,
        "blocks": block_traces,
        "blockCount": len(blocks),
    }

def des_decrypt(hex_text, key, mode="ecb", iv=None):
    raw_key = (key or "secret!!")[:8].ljust(8, "\x00")
    key_bits = string_to_bits(raw_key)
    round_keys = list(reversed(_des_key_schedule(key_bits)))
    mode = (mode or "ecb").lower()
    blocks = split_hex_blocks(hex_text, 16)
    previous_bits = None
    if mode == "cbc":
        previous_bits = bin(int(normalize_hex_iv(iv, 16), 16))[2:].zfill(64)
    plaintext_parts = []
    block_traces = []
    rounds = []
    for block_index, chunk in enumerate(blocks):
        cipher_bits = bin(int(chunk, 16))[2:].zfill(64)
        chain_bits, block_rounds = _des_process_block(cipher_bits, round_keys)
        plain_bits = xor_bits(chain_bits, previous_bits) if mode == "cbc" else chain_bits
        plaintext_parts.append(bits_to_string(plain_bits))
        block_traces.append({
            "index": block_index + 1,
            "cipherBits": cipher_bits,
            "chainBits": chain_bits,
            "plainBits": plain_bits,
            "cipherHex": chunk,
            "chainHex": bits_to_block_hex(chain_bits, 8),
            "plainHex": bits_to_block_hex(plain_bits, 8),
            "rounds": [{**r, "block": block_index + 1} for r in block_rounds],
        })
        if block_index == 0:
            rounds = block_traces[0]["rounds"]
        if mode == "cbc":
            previous_bits = cipher_bits
    plaintext = "".join(plaintext_parts).rstrip("\x00")
    return {
        "mode": mode.upper(),
        "ivHex": normalize_hex_iv(iv, 16) if mode == "cbc" else None,
        "plaintext": plaintext,
        "rounds": rounds,
        "blocks": block_traces,
        "blockCount": len(blocks),
    }

_AES_SBOX = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
]

_AES_INV_SBOX = [0] * 256
for _i, _v in enumerate(_AES_SBOX):
    _AES_INV_SBOX[_v] = _i

_AES_RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36]

def _build_gf_tables():
    out = {}
    for factor in (2, 3, 9, 11, 13, 14):
        table = []
        for byte in range(256):
            p, a, f = 0, byte, factor
            for _ in range(8):
                if f & 1:
                    p ^= a
                hi = a & 0x80
                a = (a << 1) & 0xff
                if hi:
                    a ^= 0x1b
                f >>= 1
            table.append(p)
        out[factor] = table
    return out

_GF = _build_gf_tables()

def _aes_sub_bytes(state):
    return [_AES_SBOX[b] for b in state]

def _aes_inv_sub_bytes(state):
    return [_AES_INV_SBOX[b] for b in state]

def _aes_shift_rows(state):
    s = state[:]
    s[1],  s[5],  s[9],  s[13] = state[5],  state[9],  state[13], state[1]
    s[2],  s[6],  s[10], s[14] = state[10], state[14], state[2],  state[6]
    s[3],  s[7],  s[11], s[15] = state[15], state[3],  state[7],  state[11]
    return s

def _aes_inv_shift_rows(state):
    s = state[:]
    s[1],  s[5],  s[9],  s[13] = state[13], state[1],  state[5],  state[9]
    s[2],  s[6],  s[10], s[14] = state[10], state[14], state[2],  state[6]
    s[3],  s[7],  s[11], s[15] = state[7],  state[11], state[15], state[3]
    return s

def _aes_mix_columns(state):
    g = _GF
    result = [0] * 16
    for c in range(4):
        a = state[c * 4:(c + 1) * 4]
        result[c*4]   = g[2][a[0]] ^ g[3][a[1]] ^ a[2]       ^ a[3]
        result[c*4+1] = a[0]       ^ g[2][a[1]] ^ g[3][a[2]] ^ a[3]
        result[c*4+2] = a[0]       ^ a[1]        ^ g[2][a[2]] ^ g[3][a[3]]
        result[c*4+3] = g[3][a[0]] ^ a[1]        ^ a[2]       ^ g[2][a[3]]
    return result

def _aes_inv_mix_columns(state):
    g = _GF
    result = [0] * 16
    for c in range(4):
        a = state[c * 4:(c + 1) * 4]
        result[c*4]   = g[14][a[0]] ^ g[11][a[1]] ^ g[13][a[2]] ^ g[9][a[3]]
        result[c*4+1] = g[9][a[0]]  ^ g[14][a[1]] ^ g[11][a[2]] ^ g[13][a[3]]
        result[c*4+2] = g[13][a[0]] ^ g[9][a[1]]  ^ g[14][a[2]] ^ g[11][a[3]]
        result[c*4+3] = g[11][a[0]] ^ g[13][a[1]] ^ g[9][a[2]]  ^ g[14][a[3]]
    return result

def _aes_add_round_key(state, round_key):
    return [s ^ k for s, k in zip(state, round_key)]

def _aes_key_expansion(key_bytes):
    """FIPS 197 key expansion: 16-byte key → 11 × 16-byte round keys."""
    w = [list(key_bytes[i * 4:(i + 1) * 4]) for i in range(4)]
    for i in range(4, 44):
        temp = w[i - 1][:]
        if i % 4 == 0:
            temp = temp[1:] + temp[:1]
            temp = [_AES_SBOX[b] for b in temp]
            temp[0] ^= _AES_RCON[i // 4 - 1]
        w.append([w[i - 4][j] ^ temp[j] for j in range(4)])
    round_keys = []
    for r in range(11):
        rk = []
        for word in w[r * 4:(r + 1) * 4]:
            rk.extend(word)
        round_keys.append(rk)
    return round_keys

def _aes_encrypt_block(state, round_keys):
    """Encrypt one 16-byte block. Returns (ciphertext_bytes, round_traces)."""
    state = _aes_add_round_key(state, round_keys[0])
    rounds = []
    for r in range(1, 11):
        state = _aes_sub_bytes(state)
        state = _aes_shift_rows(state)
        if r < 10:
            state = _aes_mix_columns(state)
        state = _aes_add_round_key(state, round_keys[r])
        rounds.append({"round": r, "stateHex": bytes_to_hex(state)})
    return state, rounds

def _aes_decrypt_block(state, round_keys):
    """Decrypt one 16-byte block. Returns (plaintext_bytes, round_traces)."""
    state = _aes_add_round_key(state, round_keys[10])
    rounds = []
    for r in range(9, -1, -1):
        state = _aes_inv_shift_rows(state)
        state = _aes_inv_sub_bytes(state)
        state = _aes_add_round_key(state, round_keys[r])
        if r > 0:
            state = _aes_inv_mix_columns(state)
        rounds.append({"round": 10 - r, "stateHex": bytes_to_hex(state)})
    return state, rounds

def aes_encrypt(text, key, mode="ecb", iv=None):
    key_bytes = text_to_bytes(key or "sixteen-char-key")
    round_keys = _aes_key_expansion(key_bytes)
    mode = (mode or "ecb").lower()
    blocks = split_text_blocks(text, 16)
    previous_state = hex_iv_bytes(iv, 16) if mode == "cbc" else None
    ciphertext_parts = []
    block_traces = []
    rounds = []
    for block_index, chunk in enumerate(blocks):
        plain_state = text_to_bytes(chunk)
        chain_state = xor_bytes(plain_state, previous_state) if mode == "cbc" else plain_state
        cipher_state, block_rounds = _aes_encrypt_block(chain_state[:], round_keys)
        cipher_hex = bytes_to_hex(cipher_state)
        ciphertext_parts.append(cipher_hex)
        block_traces.append({
            "index": block_index + 1,
            "plainHex": bytes_to_hex(plain_state),
            "chainHex": bytes_to_hex(chain_state),
            "cipherHex": cipher_hex,
            "rounds": block_rounds,
        })
        if block_index == 0:
            rounds = block_rounds
        if mode == "cbc":
            previous_state = cipher_state[:]
    return {
        "mode": mode.upper(),
        "ivHex": bytes_to_hex(hex_iv_bytes(iv, 16)) if mode == "cbc" else None,
        "ciphertextHex": "".join(ciphertext_parts),
        "rounds": rounds,
        "blocks": block_traces,
        "blockCount": len(blocks),
    }

def aes_decrypt(text, key, mode="ecb", iv=None):
    key_bytes = text_to_bytes(key or "sixteen-char-key")
    round_keys = _aes_key_expansion(key_bytes)
    mode = (mode or "ecb").lower()
    blocks = split_hex_blocks(text, 32)
    previous_state = hex_iv_bytes(iv, 16) if mode == "cbc" else None
    plaintext_parts = []
    block_traces = []
    rounds = []
    for block_index, chunk in enumerate(blocks):
        cipher_state = hex_to_bytes(chunk)
        chain_state, block_rounds = _aes_decrypt_block(cipher_state[:], round_keys)
        plain_state = xor_bytes(chain_state, previous_state) if mode == "cbc" else chain_state
        plaintext_parts.append(bytes_to_text(plain_state))
        block_traces.append({
            "index": block_index + 1,
            "cipherHex": bytes_to_hex(cipher_state),
            "chainHex": bytes_to_hex(chain_state),
            "plainHex": bytes_to_hex(plain_state),
            "rounds": block_rounds,
        })
        if block_index == 0:
            rounds = block_rounds
        if mode == "cbc":
            previous_state = cipher_state[:]
    plaintext = "".join(plaintext_parts).rstrip("\x00")
    return {
        "mode": mode.upper(),
        "ivHex": bytes_to_hex(hex_iv_bytes(iv, 16)) if mode == "cbc" else None,
        "plaintext": plaintext,
        "rounds": rounds,
        "blocks": block_traces,
        "blockCount": len(blocks),
    }
