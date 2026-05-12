from algorithms.classical import double_trans_decrypt, double_trans_encrypt, substitution_transform
from algorithms.public_key import ecdh, rsa_decrypt, rsa_encrypt, rsa_keygen
from algorithms.symmetric import aes_decrypt, aes_encrypt, des_decrypt, des_encrypt

def dispatch(operation, payload):
    """Dispatch an operation string to the matching Python algorithm."""
    payload = payload or {}
    if operation == "classical/substitution/encrypt":
        return substitution_transform(payload.get("text", ""), payload.get("key", ""), decrypt=False)
    if operation == "classical/substitution/decrypt":
        return substitution_transform(payload.get("text", ""), payload.get("key", ""), decrypt=True)
    if operation == "classical/transposition/encrypt":
        return double_trans_encrypt(payload.get("text", ""), payload.get("keyA", "2,0,1"), payload.get("keyB", "1,2,0"))
    if operation == "classical/transposition/decrypt":
        return double_trans_decrypt(payload.get("text", ""), payload.get("keyA", "2,0,1"), payload.get("keyB", "1,2,0"))
    if operation == "symmetric/des/encrypt":
        return des_encrypt(payload.get("text", ""), payload.get("key", "secret!!"), payload.get("mode", "ecb"), payload.get("iv"))
    if operation == "symmetric/des/decrypt":
        return des_decrypt(payload.get("text", ""), payload.get("key", "secret!!"), payload.get("mode", "ecb"), payload.get("iv"))
    if operation == "symmetric/aes/encrypt":
        return aes_encrypt(payload.get("text", ""), payload.get("key", "sixteen-char-key"), payload.get("mode", "ecb"), payload.get("iv"))
    if operation == "symmetric/aes/decrypt":
        return aes_decrypt(payload.get("text", ""), payload.get("key", "sixteen-char-key"), payload.get("mode", "ecb"), payload.get("iv"))
    if operation == "public/rsa/keygen":
        return rsa_keygen(payload.get("bitSize", 32))
    if operation == "public/rsa/encrypt":
        return rsa_encrypt(payload.get("message", ""), payload.get("publicKey", {}))
    if operation == "public/rsa/decrypt":
        return rsa_decrypt(payload.get("ciphertext", "0"), payload.get("privateKey", {}))
    if operation == "public/ecc/ecdh":
        return ecdh(payload)
    raise ValueError(f"Unsupported operation: {operation}")
