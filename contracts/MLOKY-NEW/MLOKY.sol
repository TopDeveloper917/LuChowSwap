// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Library.sol";

contract MLOKY is IBEP20Extended, Auth {
    using SafeMath for uint256;
    address private constant DEAD = address(0xdead);
    address private constant ZERO = address(0);
    
    string private _name = "MLOKY";
    string private _symbol = "MLOKY";
    uint8 private _decimals = 9;
    uint256 private _totalSupply = 100 * 10 ** 6 * (10 ** _decimals);  // 100 million

    IPancakeRouter02 public router;
    address public pair;
    address public luchowAddress = 0xe4e8e6878718bfe533702D4a6571Eb74D79b0915;
    address public busdAddress = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
    address public autoLiquidityReceiver;
    address payable public marketingFeeReceiver = payable(0xA9Ab72c05a634fA8BbA40FcFe5053639a21A3738);
    address payable public charityFeeReceiver = payable(0x5254dEe93d570aA2b973cd1ea57CcC9627498E3e);

    uint256 public liquidityFee = 200; // 2%
    uint256 public reflectionFeeBUSD = 400; // 4%
    uint256 public reflectionFeeLUCHOW = 200; // 2%
    uint256 public reflectionFee = reflectionFeeBUSD + reflectionFeeLUCHOW;
    uint256 public marketingFee = 300; // 3%
    uint256 public charityFee = 100; // 1%
    uint256 public totalFee = 1200; // 12%
    uint256 public feeDenominator = 10000; // 10000

    DividendDistributor public distributorBUSD;
    DividendDistributor public distributorLUCHOW;

    uint256 public distributorGas = 500000;

    bool public swapEnabled = true;
    uint256 public swapThreshold = _totalSupply / 20000; // 0.005%

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) public isFeeExempt;
    mapping(address => bool) public isDividendExempt;
    event AutoLiquify(uint256 amountBNB, uint256 amountBOG);
    bool inSwap;
    modifier swapping() {
        inSwap = true;
        _;
        inSwap = false;
    }

    constructor (address router_) payable Auth(msg.sender) {
        router = IPancakeRouter02(router_);
        pair = IPancakeFactory(router.factory()).createPair(address(this), router.WETH());
        distributorBUSD = new DividendDistributor(busdAddress, router_);
        distributorLUCHOW = new DividendDistributor(luchowAddress, router_);

        isFeeExempt[msg.sender] = true;
        isDividendExempt[pair] = true;
        isDividendExempt[address(this)] = true;
        isDividendExempt[DEAD] = true;

        autoLiquidityReceiver = msg.sender;

        _allowances[address(this)][address(router)] = _totalSupply;
        _allowances[address(this)][address(pair)] = _totalSupply;

        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    receive() external payable {}

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function allowance(address holder, address spender) external view override returns (uint256) {
        return _allowances[holder][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function approveMax(address spender) external returns (bool) {
        return approve(spender, _totalSupply);
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        return _transferFrom(msg.sender, recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        if (_allowances[sender][msg.sender] != _totalSupply) {
            _allowances[sender][msg.sender] = _allowances[sender][msg.sender]
                .sub(amount, "Insufficient Allowance");
        }
        return _transferFrom(sender, recipient, amount);
    }

    function _transferFrom(address sender, address recipient, uint256 amount) internal returns (bool) {
        if (inSwap) { return _basicTransfer(sender, recipient, amount); }
        if (shouldSwapBack()) { swapBack(); }

        _balances[sender] = _balances[sender].sub(amount, "Insufficient Balance");
        uint256 amountReceived = shouldTakeFee(sender) ? takeFee(sender, amount) : amount;
        _balances[recipient] = _balances[recipient].add(amountReceived);

        if (!isDividendExempt[sender]) {
            try distributorBUSD.setShare(sender, _balances[sender]) {} catch {}
            try distributorLUCHOW.setShare(sender, _balances[sender]) {} catch {}
        }
        if (!isDividendExempt[recipient]) {
            try distributorBUSD.setShare(recipient, _balances[recipient]) {} catch {}
            try distributorLUCHOW.setShare(recipient, _balances[recipient]) {} catch {}
        }

        try distributorBUSD.process(distributorGas) {} catch {}
        try distributorLUCHOW.process(distributorGas) {} catch {}

        emit Transfer(sender, recipient, amountReceived);
        return true;
    }

    function _basicTransfer(address sender, address recipient, uint256 amount) internal returns (bool) {
        _balances[sender] = _balances[sender].sub(amount, "Insufficient Balance");
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function shouldTakeFee(address sender) internal view returns (bool) {
        return !isFeeExempt[sender];
    }

    function takeFee(address sender, uint256 amount) internal returns (uint256) {
        uint256 feeAmount = amount.mul(totalFee).div(feeDenominator);

        _balances[address(this)] = _balances[address(this)].add(feeAmount);
        emit Transfer(sender, address(this), feeAmount);

        return amount.sub(feeAmount);
    }

    function shouldSwapBack() internal view returns (bool) {
        return
            msg.sender != pair &&
            !inSwap &&
            swapEnabled &&
            _balances[address(this)] >= swapThreshold;
    }

    function swapBack() internal swapping {
        uint256 amountToLiquify = swapThreshold.mul(liquidityFee).div(totalFee).div(2);
        uint256 amountToSwap = swapThreshold.sub(amountToLiquify);

        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = router.WETH();
        uint256 balanceBefore = address(this).balance;
        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountToSwap,
            0,
            path,
            address(this),
            block.timestamp
        );
        uint256 amountBNB = address(this).balance.sub(balanceBefore);

        uint256 totalBNBFee = totalFee.sub(liquidityFee.div(2));

        uint256 amountBNBLiquidity = amountBNB.mul(liquidityFee).div(totalBNBFee).div(2);
        uint256 amountBNBReflectionBUSD = amountBNB.mul(reflectionFeeBUSD).div(totalBNBFee);
        uint256 amountBNBReflectionLUCHOW = amountBNB.mul(reflectionFeeLUCHOW).div(totalBNBFee);
        uint256 amountBNBMarketing = amountBNB.mul(marketingFee).div(totalBNBFee);
        uint256 amountBNBCharity = amountBNB.mul(charityFee).div(totalBNBFee);

        try distributorBUSD.deposit{ value: amountBNBReflectionBUSD }() {} catch {}
        try distributorLUCHOW.deposit{ value: amountBNBReflectionLUCHOW }() {} catch {}

        payable(marketingFeeReceiver).transfer(amountBNBMarketing);
        payable(charityFeeReceiver).transfer(amountBNBCharity);

        if (amountToLiquify > 0) {
            router.addLiquidityETH{ value: amountBNBLiquidity }(
                address(this),
                amountToLiquify,
                0,
                0,
                autoLiquidityReceiver,
                block.timestamp
            );
            emit AutoLiquify(amountBNBLiquidity, amountToLiquify);
        }
    }

    function buyTokens(uint256 amount, address to) internal swapping {
        address[] memory path = new address[](2);
        path[0] = router.WETH();
        path[1] = address(this);

        router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(0, path, to, block.timestamp);
    }

    function setIsDividendExempt(address holder, bool exempt) external authorized {
        require(holder != address(this) && holder != pair);
        isDividendExempt[holder] = exempt;
        if (exempt) {
            distributorBUSD.setShare(holder, 0);
            distributorLUCHOW.setShare(holder, 0);
        } else {
            distributorBUSD.setShare(holder, _balances[holder]);
            distributorLUCHOW.setShare(holder, _balances[holder]);
        }
    }

    function setIsFeeExempt(address holder, bool exempt) external authorized {
        isFeeExempt[holder] = exempt;
    }

    function setFees(
        uint256 _liquidityFee,
        uint256 _charityFee,
        uint256 _reflectionFeeBUSD,
        uint256 _reflectionFeeLUCHOW,
        uint256 _marketingFee,
        uint256 _feeDenominator
    ) external authorized {
        liquidityFee = _liquidityFee;
        charityFee = _charityFee;
        reflectionFeeBUSD = _reflectionFeeBUSD;
        reflectionFeeLUCHOW = _reflectionFeeLUCHOW;
        reflectionFee = _reflectionFeeBUSD + _reflectionFeeLUCHOW;
        marketingFee = _marketingFee;
        feeDenominator = _feeDenominator;
        totalFee = _liquidityFee.add(_charityFee).add(reflectionFee).add(_marketingFee);
    }

    function setFeeReceivers(address _autoLiquidityReceiver, address _marketingFeeReceiver, address _charityFeeReceiver) external authorized {
        autoLiquidityReceiver = _autoLiquidityReceiver;
        marketingFeeReceiver = payable(_marketingFeeReceiver);
        charityFeeReceiver = payable(_charityFeeReceiver);
    }

    function changeRouter(address router_) external authorized {
        router = IPancakeRouter02(router_);
        pair = IPancakeFactory(router.factory()).createPair(address(this), router.WETH());
        distributorBUSD = new DividendDistributor(busdAddress, router_);
        distributorLUCHOW = new DividendDistributor(luchowAddress, router_);

        isDividendExempt[pair] = true;

        _allowances[address(this)][address(router)] = _totalSupply;
        _allowances[address(this)][address(pair)] = _totalSupply;
    }

    function setSwapBackSettings(bool _enabled, uint256 _amount) external authorized {
        swapEnabled = _enabled;
        swapThreshold = _amount;
    }

    function setDistributionCriteria(uint256 _minPeriod, uint256 _minDistribution) external authorized {
        distributorBUSD.setDistributionCriteria(_minPeriod, _minDistribution);
        distributorLUCHOW.setDistributionCriteria(_minPeriod, _minDistribution);
    }

    function setDistributorSettings(uint256 gas) external authorized {
        require(gas < 750000, "Gas must be lower than 750000");
        distributorGas = gas;
    }

    function getCirculatingSupply() public view returns (uint256) {
        return _totalSupply.sub(balanceOf(DEAD)).sub(balanceOf(ZERO));
    }

    function getLiquidityBacking(uint256 accuracy) public view returns (uint256) {
        return accuracy.mul(balanceOf(pair).mul(2)).div(getCirculatingSupply());
    }

    function isOverLiquified(uint256 target, uint256 accuracy) public view returns (bool) {
        return getLiquidityBacking(accuracy) > target;
    }

}