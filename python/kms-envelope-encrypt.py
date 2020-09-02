import argparse
import sys
from base64 import b64decode, b64encode

import boto3
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad

no_stdin = sys.stdin.isatty()

parser = argparse.ArgumentParser()
parser.add_argument('--key', '-k', help="KMS Data Key to use to decrypt (base64)", required=True)
parser.add_argument('--plaintext', '-p', help="Plaintext to encrypt. Will attempt to read from stdin", default=(None if no_stdin else sys.stdin), required=no_stdin)
args = parser.parse_args()

key = args.k.encode()
plaintext = args.p.encode()

client = boto3.client('kms')

response = client.decrypt(
    CiphertextBlob=b64decode(key)
)
kms_key = response["Plaintext"]

iv = get_random_bytes(16)
cipher = AES.new(kms_key, AES.MODE_CBC, iv=iv)

encrypted_value = cipher.encrypt(pad(plaintext, 16))
final_value = iv + encrypted_value

output = b64encode(final_value)
print(output)
