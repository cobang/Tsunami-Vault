import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { Vault } from '../types';

const deployVault: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, ethers } = hre;
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  const vault = await deploy('Vault', {
    from: deployer.address,
    args: [],
    log: true,
  });

  if (hre.network.name !== 'localhost' && hre.network.name !== 'hardhat') {
    console.log('=====> Verifing ....');

    try {
      await hre.run('verify:verify', {
        address: vault.address,
        contract: 'contracts/Vault.sol:Vault',
        constructorArguments: [
        ],
      });
    } catch (_) {}
  }
}

export default deployVault;
deployVault.tags = ['Vault'];
deployVault.dependencies = [];