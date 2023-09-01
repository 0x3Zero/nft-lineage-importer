import Web3 from 'web3';

let web3: Web3;

async function init() {
  web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/106d9f764d6c4f248257a5a352e50a74'));
}

export { init, web3 };
