from algorithms.classical import double_trans_decrypt, double_trans_encrypt, substitution_transform
from algorithms.public_key import ecdh, rsa_decrypt, rsa_encrypt, rsa_keygen
from algorithms.symmetric import aes_decrypt, aes_encrypt, des_decrypt, des_encrypt

# Dispatch an operation string to the matching Python algorithm.
def dispatch(operation, payload):
    # Normalize the incoming payload object.
    payload = payload or {}
    # Route classical substitution encryption.
    if operation == "classical/substitution/encrypt":
        return substitution_transform(payload.get("text", ""), payload.get("key", ""), decrypt=False)
    # Route classical substitution decryption.
    if operation == "classical/substitution/decrypt":
        return substitution_transform(payload.get("text", ""), payload.get("key", ""), decrypt=True)
    # Route double transposition encryption.
    if operation == "classical/transposition/encrypt":
        return double_trans_encrypt(payload.get("text", ""), payload.get("keyA", "2,0,1"), payload.get("keyB", "1,2,0"))
    # Route double transposition decryption.
    if operation == "classical/transposition/decrypt":
        return double_trans_decrypt(payload.get("text", ""), payload.get("keyA", "2,0,1"), payload.get("keyB", "1,2,0"))
    # Route DES encryption.
    if operation == "symmetric/des/encrypt":
        return des_encrypt(payload.get("text", ""), payload.get("key", "secret!!"), payload.get("mode", "ecb"), payload.get("iv"))
    # Route DES decryption.
    if operation == "symmetric/des/decrypt":
        return des_decrypt(payload.get("text", ""), payload.get("key", "secret!!"), payload.get("mode", "ecb"), payload.get("iv"))
    # Route AES encryption.
    if operation == "symmetric/aes/encrypt":
        return aes_encrypt(payload.get("text", ""), payload.get("key", "sixteen-char-key"), payload.get("mode", "ecb"), payload.get("iv"))
    # Route AES decryption.
    if operation == "symmetric/aes/decrypt":
        return aes_decrypt(payload.get("text", ""), payload.get("key", "sixteen-char-key"), payload.get("mode", "ecb"), payload.get("iv"))
    # Route RSA key generation.
    if operation == "public/rsa/keygen":
        return rsa_keygen(payload.get("bitSize", 32))
    # Route RSA encryption.
    if operation == "public/rsa/encrypt":
        return rsa_encrypt(payload.get("message", ""), payload.get("publicKey", {}))
    # Route RSA decryption.
    if operation == "public/rsa/decrypt":
        return rsa_decrypt(payload.get("ciphertext", "0"), payload.get("privateKey", {}))
    # Route ECC ECDH.
    if operation == "public/ecc/ecdh":
        return ecdh(payload)
    # Reject unsupported operation names.
    raise ValueError(f"Unsupported operation: {operation}")
