// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Pausable} from '@openzeppelin/contracts/security/Pausable.sol';

contract Vault is Ownable, Pausable {
    using SafeERC20 for IERC20;

    /// @notice whitelisted tokens
    mapping(address => bool) public isWhitelisted;

    /// @notice deposited amount for a particular token
    mapping(address => mapping(address => uint256)) public balanceOf;

    /* ======== EVENTS ======== */

    event Deposit(
        address indexed account,
        address indexed token,
        uint256 amount
    );
    event Withdraw(
        address indexed account,
        address indexed token,
        uint256 amount
    );

    /* ======== ERRORS ======== */

    error NOT_WHITELISTED_TOKEN(address token);
    error ZERO_AMOUNT();
    error ZERO_ADDRESS();
    error EXCEED_BALANCE(uint256 amount);

    /* ======== INITIALIZATION ======== */

    constructor() {}

    /* ======== MODIFIERS ======== */

    modifier onlyWhitelistedToken(address _token) {
        if (!isWhitelisted[_token]) revert NOT_WHITELISTED_TOKEN(_token);

        _;
    }

    /* ======== POLICY FUNCTIONS ======== */

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function addToWhiteList(address _token) external onlyOwner {
        if (_token == address(0)) revert ZERO_ADDRESS();

        if (!isWhitelisted[_token]) {
            isWhitelisted[_token] = true;
        }
    }

    function removeFromWhiteList(address _token) external onlyOwner {
        if (_token == address(0)) revert ZERO_ADDRESS();

        if (isWhitelisted[_token]) {
            isWhitelisted[_token] = false;
        }
    }

    /* ======== PUBLIC FUNCTIONS ======== */

    function deposit(
        address _token,
        uint256 _amount
    ) external onlyWhitelistedToken(_token) whenNotPaused {
        if (_amount == 0) revert ZERO_AMOUNT();

        /// token transfer
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        /// @dev total deposited amount is less than token's total supply
        unchecked {
            balanceOf[_token][msg.sender] += _amount;
        }

        /// event
        emit Deposit(msg.sender, _token, _amount);
    }

    function withdraw(
        address _token,
        uint256 _amount
    ) external onlyWhitelistedToken(_token) whenNotPaused {
        if (_amount == 0) revert ZERO_AMOUNT();
        if (balanceOf[_token][msg.sender] < _amount)
            revert EXCEED_BALANCE(_amount);

        /// @dev balance is greater than amount
        unchecked {
            balanceOf[_token][msg.sender] -= _amount;
        }

        /// token transfer
        IERC20(_token).safeTransfer(msg.sender, _amount);

        /// event
        emit Withdraw(msg.sender, _token, _amount);
    }
}
