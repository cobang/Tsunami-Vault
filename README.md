# Vault Project

## Overview

The Vault project is a decentralized smart contract allowing users to deposit and withdraw ERC-20 tokens in a secure and controlled manner.
It is designed to be easy to use by any number of users while providing administrators with essential functionalities.

## Features

- Deposit and withdraw ERC-20 tokens.
- Pause and unpause functionality to control new deposits and withdrawals.
- Whitelist tokens for added security</li>

## Smart Contract Details

The main smart contract is implemented in contracts/Vault.sol .
The contract is built using Solidity and is tested using Hardhat with TypeScript.

## Getting Started

Follow these steps to set up and test the project locally:

1. Clone the Repository:

```sh
git clone git@github.com:cobang/Tsunami-Vault.git
```

2. Install Dependencies:

```sh
yarn
```

3. Compile Contracts:

```sh
npx hardhat compile
```

4. Run Tests:

```sh
npx hardhat test
```

5. Deploy Smart Contract:

Modify the deployment script in scripts/deploy.js with your deployment parameters, and then run:

```sh
npx hardhat deploy --network mainnet --tags Vault
```
