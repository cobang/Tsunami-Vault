// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol
    ) public ERC20(name, symbol) {}

    function mint(uint256 value) external returns (bool) {
        _mint(msg.sender, value);

        return true;
    }
}
