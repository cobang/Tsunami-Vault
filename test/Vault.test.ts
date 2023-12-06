import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signers';

import { Vault, MockERC20 } from '../types';

describe('Vault', function () {
  let vault: Vault;
  let token: MockERC20;
  let otherToken: MockERC20;

  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  let amount = ethers.utils.parseEther('10000');
  let halfAmount = ethers.utils.parseEther('5000');

  this.beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    /// Vault deploy
    const Vault = await ethers.getContractFactory('Vault');
    vault = (await Vault.deploy()) as Vault;

    /// Token deploy
    const Token = await ethers.getContractFactory('MockERC20');
    token = (await Token.deploy('MockERC20', 'MockERC20')) as MockERC20;
    await token.connect(user).mint(amount);

    otherToken = (await Token.deploy(
      'OtherMockERC20',
      'OtherMockERC20'
    )) as MockERC20;
    await otherToken.connect(user).mint(amount);
  });

  describe('#ownable', () => {
    it('pause', async function () {
      expect(await vault.paused()).to.be.equal(false);

      await expect(vault.connect(user).pause()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );

      await vault.pause();

      expect(await vault.paused()).to.be.equal(true);
    });
    it('unpause', async function () {
      await vault.pause();

      await expect(vault.connect(user).unpause()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );

      await vault.unpause();

      expect(await vault.paused()).to.be.equal(false);
    });
    it('add whitelist token', async function () {
      expect(await vault.isWhitelisted(token.address)).to.be.equal(false);

      await expect(
        vault.connect(user).addToWhiteList(token.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');

      await vault.addToWhiteList(token.address);

      expect(await vault.isWhitelisted(token.address)).to.be.equal(true);
    });
    it('remove whitelist token', async function () {
      await vault.addToWhiteList(token.address);

      await expect(
        vault.connect(user).removeFromWhiteList(token.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');

      await vault.removeFromWhiteList(token.address);

      expect(await vault.isWhitelisted(token.address)).to.be.equal(false);
    });
  });

  describe('#vault', () => {
    beforeEach(async function () {
      await vault.addToWhiteList(token.address);
      await token
        .connect(user)
        .approve(vault.address, ethers.constants.MaxUint256);
      await otherToken
        .connect(user)
        .approve(vault.address, ethers.constants.MaxUint256);
    });

    it('not whitelisted token deposit', async function () {
      await expect(
        vault.deposit(otherToken.address, halfAmount)
      ).to.be.revertedWith(`NOT_WHITELISTED_TOKEN("${otherToken.address}")`);
    });

    it('not whitelisted token withdraw', async function () {
      await expect(
        vault.withdraw(otherToken.address, halfAmount)
      ).to.be.revertedWith(`NOT_WHITELISTED_TOKEN("${otherToken.address}")`);
    });

    it('whitelisted token deposit', async function () {
      await expect(vault.deposit(token.address, 0)).to.be.revertedWith(
        'ZERO_AMOUNT()'
      );

      const tx = await vault.connect(user).deposit(token.address, halfAmount);
      await expect(tx)
        .to.emit(vault, 'Deposit')
        .withArgs(user.address, token.address, halfAmount);
      expect(await vault.balanceOf(token.address, user.address)).to.be.equal(
        halfAmount
      );
      expect(await token.balanceOf(vault.address)).to.be.equal(halfAmount);
      expect(await token.balanceOf(user.address)).to.be.equal(
        amount.sub(halfAmount)
      );
    });

    it('whitelisted token withdraw', async function () {
      await expect(vault.withdraw(token.address, 0)).to.be.revertedWith(
        'ZERO_AMOUNT()'
      );

      await vault.connect(user).deposit(token.address, halfAmount);
      await expect(vault.withdraw(token.address, amount)).to.be.revertedWith(
        `EXCEED_BALANCE(${amount})`
      );

      const tx = await vault.connect(user).withdraw(token.address, halfAmount);
      await expect(tx)
        .to.emit(vault, 'Withdraw')
        .withArgs(user.address, token.address, halfAmount);
      expect(await vault.balanceOf(token.address, user.address)).to.be.equal(0);
      expect(await token.balanceOf(vault.address)).to.be.equal(0);
      expect(await token.balanceOf(user.address)).to.be.equal(amount);
    });
  });
});
