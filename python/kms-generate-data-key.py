import sys
from base64 import b64encode

import boto3

client = boto3.client('kms')

if len(sys.argv) != 2:
    print('Usage: {} <keyId|alias>'.format(sys.argv[0]))
    sys.exit(1)

response = client.generate_data_key_without_plaintext(
    KeyId=sys.argv[1],
    KeySpec='AES_256',
    GrantTokens=[
        'string'
    ]
)

data_key = b64encode(response["CiphertextBlob"]).decode('utf-8')
print(data_key)
