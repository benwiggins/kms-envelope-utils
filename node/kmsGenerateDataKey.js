const path = require('path');

const { argv } = process;
const { KMSClient, GenerateDataKeyCommand } = require('@aws-sdk/client-kms');

const client = new KMSClient();

if (argv.length !== 3) {
  const [node, script] = argv.slice(0, 2).map((p) => path.parse(p).base);
  console.log(`Usage: ${node} ${script} <kmsKeyId|alias>`);
  process.exit(1);
}

client
  .send(
    new GenerateDataKeyCommand({
      KeyId: argv[2],
      KeySpec: 'AES_256',
    })
  )
  .then((result) => {
    const dataKey = Buffer.from(result.CiphertextBlob).toString('base64');
    console.log(dataKey);
  });
