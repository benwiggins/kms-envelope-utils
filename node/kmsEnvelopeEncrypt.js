const crypto = require('crypto');
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');
const meow = require('meow');
const getStdin = require('get-stdin');

(async () => {
  const noStdin = process.stdin.isTTY;

  const cli = meow({
    flags: {
      key: {
        alias: 'k',
        isRequired: true,
      },
      plaintext: {
        alias: 'p',
        isRequired: noStdin,
        default: noStdin ? undefined : await getStdin(),
      },
    },
  });

  const { key, plaintext } = cli.flags;

  const client = new KMSClient();

  const kmsKey = await client
    .send(
      new DecryptCommand({
        CiphertextBlob: Buffer.from(key, 'base64'),
      })
    )
    .then((r) => Buffer.from(r.Plaintext));

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('AES-256-CBC', kmsKey, iv);
  cipher.update(plaintext);
  const encryptedData = cipher.final();

  const output = Buffer.concat([iv, encryptedData]).toString('base64');
  console.log(output);
})();
