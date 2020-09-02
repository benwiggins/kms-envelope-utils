import argparse
import sys
from base64 import b64decode

import boto3
from Crypto.Cipher import AES

no_stdin = sys.stdin.isatty()

parser = argparse.ArgumentParser()
parser.add_argument('--key', '-k', help="KMS Data Key to use to decrypt (base64)", required=True)
parser.add_argument('--secret', '-s', help="Secret to decrypt (base64). Will attempt to read from stdin", default=(None if no_stdin else sys.stdin), required=no_stdin)
args = parser.parse_args()

client = boto3.client('kms')

response = client.decrypt(
    CiphertextBlob=b64decode(args.key)
)
kms_key = response["Plaintext"]

final_key = b64decode(args.secret)

iv = final_key[:16]
encrypted_value = final_key[16:]

cipher = AES.new(kms_key, AES.MODE_CBC, iv=iv)
decrypted = cipher.decrypt(encrypted_value)

output = decrypted.decode("utf-8")
print(output)
