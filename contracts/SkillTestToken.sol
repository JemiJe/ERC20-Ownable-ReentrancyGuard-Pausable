// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SkillTestToken is ERC20, Ownable, ReentrancyGuard, Pausable {
    address public feeWallet;
    uint256 public constant FEE_PERCENTAGE = 2;
    uint256 public constant TOTAL_SUPPLY = 1_000_000;
    
    mapping(address => bool) public blacklisted;

    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);

    constructor(address _feeWallet) 
        ERC20("SkillTest Token", "STT") 
        Ownable(msg.sender)
    {
        require(_feeWallet != address(0), "fee wallet cannot be zero address");
        feeWallet = _feeWallet;
        _mint(msg.sender, TOTAL_SUPPLY * 10**18);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function blacklistAddress(address account) external onlyOwner {
        require(account != address(0), "cannot blacklist zero address");
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklistAddress(address account) external onlyOwner {
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused 
        nonReentrant 
        returns (bool) 
    {
        require(!blacklisted[msg.sender], "sender is blacklisted");
        require(!blacklisted[to], "recipient is blacklisted");
        
        uint256 fee = (amount * FEE_PERCENTAGE) / 100;
        uint256 amountAfterFee = amount - fee;

        _transfer(msg.sender, feeWallet, fee);
        _transfer(msg.sender, to, amountAfterFee);
        
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) 
        public 
        virtual 
        override 
        whenNotPaused 
        nonReentrant 
        returns (bool) 
    {
        require(!blacklisted[from], "sender is blacklisted");
        require(!blacklisted[to], "recipient is blacklisted");

        uint256 fee = (amount * FEE_PERCENTAGE) / 100;
        uint256 amountAfterFee = amount - fee;

        _spendAllowance(from, msg.sender, amount);
        _transfer(from, feeWallet, fee);
        _transfer(from, to, amountAfterFee);
        
        return true;
    }

    function setFeeWallet(address _feeWallet) external onlyOwner {
        require(_feeWallet != address(0), "fee wallet cannot be zero address");
        feeWallet = _feeWallet;
    }
}