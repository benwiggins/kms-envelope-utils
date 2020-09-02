const crypto = require('crypto');
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');
const meow = require('meow');
const getStdin = require('get-stdin');

const b64Decode = (buffer) => Buffer.from(buffer, 'base64');

(async () => {
  const noStdin = process.stdin.isTTY;

  const cli = meow({
    flags: {
      key: {
        alias: 'k',
        isRequired: true,
      },
      secret: {
        alias: 's',
        isRequired: noStdin,
        default: noStdin ? undefined : await getStdin(),
      },
    },
  });

  const { key, secret } = cli.flags;

  const client = new KMSClient();

  const kmsKey = await client
    .send(
      new DecryptCommand({
        CiphertextBlob: b64Decode(key),
      })
    )
    .then((r) => Buffer.from(r.Plaintext));

  const finalKey = b64Decode(secret);
  const iv = finalKey.slice(0, 16);
  const encryptedValue = finalKey.slice(16);

  const cipher = crypto.createDecipheriv('AES-256-CBC', kmsKey, iv);
  cipher.update(encryptedValue);
  const decrypted = cipher.final().toString();

  console.log(decrypted);
})();
