import { init as initWeb3 } from './web3';
import { init as initIPFS } from './ipfs';

const initDependencies = async () => {
  await initWeb3();
  await initIPFS();
};

export { initDependencies };
