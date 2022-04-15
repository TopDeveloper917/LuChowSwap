// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import '../pancake-swap-lib/token/BEP20/IBEP20.sol';

// Controller with ReTk in the contracts.
contract ReTkController is Ownable, ReentrancyGuard {
    // The ReTk TOKEN!
    IBEP20 public reTk;
    // The operator can only transfer reward tokens in the contract
    mapping(address=>bool) public operator;
    // Event
    event OperatorTokenRecovery(address tokenRecovered, uint256 amount);
    event SetOperator(address _operator, bool _value);

    modifier onlyOperator() {
        require(operator[_msgSender()], "operator: caller is not the operator");
        _;
    }

    constructor(IBEP20 _reTk) public {
        reTk = _reTk;
        operator[_msgSender()] = true;

        emit SetOperator(_msgSender(), true);
    }

    // Safe ReTk transfer function, just in case if rounding error causes pool to not have enough ReTks.
    function safeReTkTransfer(address _to, uint256 _amount) public onlyOperator nonReentrant returns (uint256) {
        uint256 reTkBal = reTk.balanceOf(address(this));
        if (_amount > reTkBal) { _amount = reTkBal; }
        if (_amount > 0) { reTk.transfer(_to, _amount); }
        return _amount;
    }

    function setOperator(address _operator, bool _value) external onlyOwner {
        operator[_operator] = _value;
        emit SetOperator(_operator, _value);
    }

    /**
     * @notice It allows the operator to recover wrong tokens sent to the contract
     * @param _tokenAddress: the address of the token to withdraw
     * @param _tokenAmount: the number of tokens to withdraw
     * @dev This function is only callable by operator.
     */
    function recoverWrongTokens(address _tokenAddress, uint256 _tokenAmount) external onlyOwner {
        IBEP20(_tokenAddress).transfer(msg.sender, _tokenAmount);
        emit OperatorTokenRecovery(_tokenAddress, _tokenAmount);
    }
}
