import { IPFSHTTPClient, create } from 'ipfs-http-client';

let ipfs: IPFSHTTPClient;
async function init() {
  const auth = `Basic ${Buffer.from(`${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_ID}`).toString('base64')}`;

  ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });
}

export { init, ipfs };
