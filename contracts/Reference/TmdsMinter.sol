// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import '../pancake-swap-lib/token/BEP20/IBEP20.sol';

// Minter with TMDS in the contracts.
contract TmdsMinter is Ownable, ReentrancyGuard {
    // The TMDS TOKEN!
    IBEP20 public tmdsToken;

    // The operator can only withdraw wrong tokens in the contract
    address private _operator;

    // Event
    event OperatorTransferred(
        address indexed previousOperator,
        address indexed newOperator
    );
    event OperatorTokenRecovery(address tokenRecovered, uint256 amount);

    modifier onlyOperator() {
        require(
            _operator == msg.sender,
            "operator: caller is not the operator"
        );
        _;
    }

    constructor(IBEP20 _tmdsToken) public {
        tmdsToken = _tmdsToken;
        _operator = _msgSender();

        emit OperatorTransferred(address(0), _operator);
    }

    // Safe TMDS transfer function, just in case if rounding error causes pool to not have enough TMDSs.
    function safeTmdsTransfer(address _to, uint256 _amount)
        public
        onlyOwner
        nonReentrant
    {
        uint256 tmdsBal = tmdsToken.balanceOf(address(this));
        if (_amount > tmdsBal) {
            _amount = tmdsBal;
        }
        if (_amount > 0) {
            tmdsToken.transfer(_to, _amount);
        }
    }

    /**
     * @dev operator of the contract
     */
    function operator() public view returns (address) {
        return _operator;
    }

    /**
     * @dev Transfers operator of the contract to a new account (`newOperator`).
     * Can only be called by the current operator.
     */
    function transferOperator(address newOperator) external onlyOperator {
        require(
            newOperator != address(0),
            "TmdsMinter::transferOperator: new operator is the zero address"
        );
        emit OperatorTransferred(_operator, newOperator);
        _operator = newOperator;
    }

    /**
     * @notice It allows the operator to recover wrong tokens sent to the contract
     * @param _tokenAddress: the address of the token to withdraw
     * @param _tokenAmount: the number of tokens to withdraw
     * @dev This function is only callable by operator.
     */
    function recoverWrongTokens(address _tokenAddress, uint256 _tokenAmount)
        external
        onlyOperator
    {
        IBEP20(_tokenAddress).transfer(msg.sender, _tokenAmount);
        emit OperatorTokenRecovery(_tokenAddress, _tokenAmount);
    }
}
