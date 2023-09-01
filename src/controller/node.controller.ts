import { catchAsync } from '../utils';
import { encode } from 'bs58';
import SHA256 from 'crypto-js/sha256';
import { web3 } from '../config/web3';
import { ed25519 } from '@noble/curves/ed25519';
import crypto from 'crypto';
import { ArrayBufferToHex, hexToUint8Array, signMessage } from '../utils/ed25519.util';
import fetch from 'node-fetch-commonjs';
import { ERC721_ABI } from '../data/erc721-abi';

async function fetchAndHandleIPFSContent(ipfsHash: string) {
  const response = await fetch(`https://0x3zero.infura-ipfs.io/ipfs/${ipfsHash}`);
  return await response.json();

  // TODO: remove later
  /*   try {
    const chunks = [];
    for await (const item of ipfs.ls(ipfsHash)) {
      if (item.type === 'file') {
        console.log('item', item);
        //@ts-ignore
        const fileContent = await ipfs.cat(item?.hash);
        console.log(fileContent);
        chunks.push(fileContent);
        // files.push({ name: item.name, content: fileContent.toString() });
      }
    }

    console.log(chunks);
    const chunks = []

    // for await (const chunk of ipfs.cat("QmZULkCELmmk5XNfCgTnCyFgAVxBRBXyDHGGMVoLFLiXEN", {timeout: 1000})) {
    //   chunks.push(chunk)
    // }
    // console.log(Buffer.concat(chunks).toString());
    return chunks;
  } catch (error) {
    console.error('Error fetching content:', error);
  } */
  //end TODO
}

function extractIPFSHash(uri: string): string | null {
  const ipfsHashRegex = /^ipfs:\/\/([a-zA-Z0-9]+)/; // Regular expression to capture the hash

  const match = uri.match(ipfsHashRegex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

export function formatDataKey(chain_id: String, address: String, token_id: String) {
  const input = `${chain_id}${address}${token_id}`;
  const sha256Hash = SHA256(input).toString();
  const uint8Array = hexToUint8Array(sha256Hash);
  return encode(uint8Array);
}

async function generateEd25519KeyPair() {
  let MSPPS: {
    privateKey: Uint8Array;
    privateKeyHex: string;
    publicKeyHex: string;
    KypHex: string;
    signatureHex: string;
    signatureBase64: string;
  } = {
    privateKey: new Uint8Array(),
    privateKeyHex: '',
    publicKeyHex: '',
    KypHex: '',
    signatureHex: '',
    signatureBase64: '',
  };

  MSPPS.privateKey = crypto.getRandomValues(new Uint8Array(32));
  MSPPS.privateKeyHex = await ArrayBufferToHex(MSPPS.privateKey);
  let k = ed25519.utils.getExtendedPublicKey(MSPPS.privateKey);
  MSPPS.publicKeyHex = k.point.toHex().toUpperCase();
  MSPPS.KypHex = MSPPS.privateKey + MSPPS.publicKeyHex;

  return MSPPS;
}

enum Network {
  ARBITRUM = 'arbitrum',
  BINANCE = 'bsc',
  CELO = 'celo',
  MAINNET = 'homestead',
  MATIC = 'matic',
  SOLANA = 'solana',
  NEAR = 'near',
}

function networkToChainId(network: Network) {
  switch (network) {
    case Network.ARBITRUM:
      return '42161';
    case Network.BINANCE:
      return '56';
    case Network.CELO:
      return '42220';
    case Network.MAINNET:
      return '1';
    case Network.MATIC:
      return '137';
    case Network.SOLANA:
      return 'solana';
    case Network.NEAR:
      return 'near';
  }
}

function serializeMetadata(arg: any): string {
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg);
  return '';
}

async function promiseInBatches<T>(promises: Promise<T>[], batchSize: number): Promise<Awaited<T>[]> {
  let batches: Array<Promise<T>[]> = [];

  for (let i = 0; i < promises.length; i += batchSize) {
    const chunk = promises.slice(i, i + batchSize);
    batches.push(chunk);
  }

  const results: Array<Awaited<T>>[] = [];

  while (batches.length) {
    const batch = batches.shift();

    if (batch) {
      const result = await Promise.all(batch);
      results.push(result);
    }
  }

  return results.flat();
}

type GenerateTxData = Pick<Transaction, 'chain_id' | 'public_key' | 'token_address' | 'token_id'> & {
  privateKey: Uint8Array;
  contract: any;
};

type Transaction = {
  alias: string;
  chain_id: string;
  data: string;
  mcdata: string;
  meta_contract_id: string;
  method: 'metadata';
  public_key: string;
  signature: string;
  token_address: string;
  token_id: string;
  version: string;
};

async function generateTxData(data: GenerateTxData): Promise<Transaction> {
  const { chain_id, contract, privateKey, public_key, token_address, token_id } = data;

  const uri: string = await contract.methods.tokenURI(token_id).call();
  const ipfsHash = extractIPFSHash(uri);
  const response = await fetchAndHandleIPFSContent(`${ipfsHash}/${token_id}`);
  const metadata = serializeMetadata(response);

  const { hex: signatureHex } = await signMessage(metadata, privateKey);

  return {
    alias: '',
    chain_id,
    data: metadata,
    mcdata: JSON.stringify({ loose: 0 }),
    meta_contract_id: process.env.META_CONTRACT_ID as string,
    method: 'metadata',
    public_key,
    signature: `0x${signatureHex}`,
    token_address,
    token_id,
    version: '',
  };
}

const publishBatchTxs = catchAsync(async (req, res) => {
  let { network, token_address, contract_address } = req.body;

  const contract = new web3.eth.Contract(ERC721_ABI, contract_address);
  const totalSupply = Number(await contract.methods.totalSupply().call());

  const { privateKey, publicKeyHex } = await generateEd25519KeyPair();
  const chainId = networkToChainId(network);
  const promises: Promise<Transaction>[] = [];

  for (let i = 1, total = totalSupply + 1; i < total; i++) {
    let tx = generateTxData({
      contract,
      privateKey,
      chain_id: chainId,
      public_key: `0x${publicKeyHex}`,
      token_address,
      token_id: `${i}`,
    });

    promises.push(tx);
  }

  let txs = await promiseInBatches(promises, 50);
  console.log('Total tx: ', txs.length);

  let response = await fetch(`${process.env.LINEAGE_NODE_URL}/api/v0/json-rpc`, {
    method: 'post',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'publish_batch',
      params: txs,
      id: '1',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.send({ success: true, data: response });
});

/* 
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));

    const publicKeyBase64 = Buffer.from(keypair.publicKey).toString('base64');
    const privateKeyBase64 = Buffer.from(keypair.secretKey).toString('base64');

    console.log('mnemonic', mnemonic);
    console.log('seed', seed);
    console.log('Generated public key', publicKeyBase64);
    console.log('Generated private key', privateKeyBase64);

    const signature = nacl.sign.detached(new TextEncoder().encode(JSON.stringify(response)), keypair.secretKey);
    console.log('b64 signature', Buffer.from(signature).toString('base64')); */

export default { publishBatchTxs };
