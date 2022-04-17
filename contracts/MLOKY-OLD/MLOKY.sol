/**
 *Submitted for verification at BscScan.com on 2021-12-22
*/

/**
 *Submitted for verification at BscScan.com on 2021-12-22
*/

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Auth.sol";
import "./DividendDistributor.sol";
import "./IDEXFactory.sol";

contract MLOKY is IBEP20, Auth {
    using SafeMath for uint256;

    address public WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
   

    string constant _name = "MLOKY";
    string constant _symbol = "MLOKY";
    uint8 constant _decimals = 9;

    uint256 _totalSupply = 100000000 * (10 ** _decimals);
    uint256 public _maxTxAmount = _totalSupply.div(100);

    mapping (address => uint256) _balances;
    mapping (address => mapping (address => uint256)) _allowances;

    mapping (address => bool) isFeeExempt;
    mapping (address => bool) isTxLimitExempt;
    mapping (address => bool) isDividendExempt;

    uint256 liquidityFee = 2;
    uint256 charityFee = 1;
    uint256 reflectionFee = 6;
    uint256 marketingFee = 3;
    uint256 totalFee = 12;
    

    address public autoLiquidityReceiver = address(this);
    address payable public marketingFeeReceiver = payable(0xA9Ab72c05a634fA8BbA40FcFe5053639a21A3738);
    address payable public charityFeeReceiver = payable(0x5254dEe93d570aA2b973cd1ea57CcC9627498E3e);

    IDEXRouter public router;
    address public pair;
   
    DividendDistributor distributor;
    address public distributorAddress;
    address _dexRouter;

    uint256 distributorGas = 500000;

    bool public swapEnabled = true;
    uint256 public swapThreshold = _totalSupply / 2000; // 0.005%
    bool inSwap;
    modifier swapping() { inSwap = true; _; inSwap = false; }

    constructor (
        
    ) Auth() {
      //  _dexRouter = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1;
        _dexRouter = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
        router = IDEXRouter(_dexRouter);
        pair = IDEXFactory(router.factory()).createPair(WBNB, address(this));
        _allowances[address(this)][address(router)] = _totalSupply;
        WBNB = router.WETH();
        distributor = new DividendDistributor(_dexRouter);
        distributorAddress = address(distributor);

        isFeeExempt[owner()] = true;
        isTxLimitExempt[owner()] = true;
        isDividendExempt[pair] = true;
        isDividendExempt[address(this)] = true;
      

        approve(_dexRouter, _totalSupply);
        approve(address(pair), _totalSupply);
        _balances[owner()] = _totalSupply;
        emit Transfer(address(0), owner(), _totalSupply);
    }

    receive() external payable { }

    function totalSupply() external view override returns (uint256) { return _totalSupply; }
    function decimals() external pure override returns (uint8) { return _decimals; }
    function symbol() external pure override returns (string memory) { return _symbol; }
    function name() external pure override returns (string memory) { return _name; }
    function balanceOf(address account) public view override returns (uint256) { return _balances[account]; }
    function allowance(address holder, address spender) external view override returns (uint256) { return _allowances[holder][spender]; }

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
        if(_allowances[sender][msg.sender] != _totalSupply){
            _allowances[sender][msg.sender] = _allowances[sender][msg.sender].sub(amount, "Insufficient Allowance");
        }

        return _transferFrom(sender, recipient, amount);
    }

    function _transferFrom(address sender, address recipient, uint256 amount) internal returns (bool) {
        if(inSwap){ return _basicTransfer(sender, recipient, amount); }

        checkTxLimit(sender, amount);
        //
        if(shouldSwapBack()){ swapBack(); }
     
        _balances[sender] = _balances[sender].sub(amount, "Insufficient Balance");

        uint256 amountReceived = shouldTakeFee(sender) ? takeFee(sender, amount) : amount;

        _balances[recipient] = _balances[recipient].add(amountReceived);

        if(!isDividendExempt[sender]){ try distributor.setShare(sender, _balances[sender]) {} catch {} }
        if(!isDividendExempt[recipient]){ try distributor.setShare(recipient, _balances[recipient]) {} catch {} }

        try distributor.process(distributorGas) {} catch {}

        emit Transfer(sender, recipient, amountReceived);
        return true;
    }

    function _basicTransfer(address sender, address recipient, uint256 amount) internal returns (bool) {
        _balances[sender] = _balances[sender].sub(amount, "Insufficient Balance");
        _balances[recipient] = _balances[recipient].add(amount);
//        emit Transfer(sender, recipient, amount);
        return true;
    }



    function checkTxLimit(address sender, uint256 amount) internal view {
        require(amount <= _maxTxAmount || isTxLimitExempt[sender], "TX Limit Exceeded");
    }

    function shouldTakeFee(address sender) internal view returns (bool) {
        return !isFeeExempt[sender];
    }


    function takeFee(address sender, uint256 amount) internal returns (uint256) {
        uint256 feeAmount = amount.mul(totalFee).div(100);

        _balances[address(this)] = _balances[address(this)].add(feeAmount);
        emit Transfer(sender, address(this), feeAmount);

        return amount.sub(feeAmount);
    }

    function shouldSwapBack() internal view returns (bool) {
        return msg.sender != pair
        && !inSwap
        && swapEnabled
        && _balances[address(this)] >= swapThreshold;
    }

    function swapBack() internal swapping {
       
        uint256 amountToLiquify = swapThreshold.mul(liquidityFee).div(totalFee).div(2);
        uint256 amountToSwap = swapThreshold.sub(amountToLiquify);

        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = WBNB;
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
        uint256 amountBNBReflection = amountBNB.mul(reflectionFee).div(totalBNBFee);
        uint256 amountBNBMarketing = amountBNB.mul(marketingFee).div(totalBNBFee);
        uint256 amountBNBCharity = amountBNB.mul(charityFee).div(totalBNBFee);
        uint256 amountBNBReflectionBUSD = amountBNBReflection.div(2);
        uint256 amountBNBReflectionLUHCOW = amountBNBReflection - amountBNBReflectionBUSD;
        try distributor.depositBUSD{value: amountBNBReflectionBUSD}() {} catch {}
        try distributor.depositLUCHOW{value: amountBNBReflectionLUHCOW}() {} catch {}
        payable(marketingFeeReceiver).transfer(amountBNBMarketing);
        payable(charityFeeReceiver).transfer(amountBNBCharity);
            
        

        if(amountToLiquify > 0){
            router.addLiquidityETH{value: amountBNBLiquidity}(
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

    function setTxLimit(uint256 amount) external authorized {
        _maxTxAmount = amount;
    }

    function setIsDividendExempt(address holder, bool exempt) external authorized {
        require(holder != address(this) && holder != pair);
        isDividendExempt[holder] = exempt;
        if(exempt){
            distributor.setShare(holder, 0);
        }else{
            distributor.setShare(holder, _balances[holder]);
        }
    }

    function setIsFeeExempt(address holder, bool exempt) external authorized {
        isFeeExempt[holder] = exempt;
    }

    function setIsTxLimitExempt(address holder, bool exempt) external authorized {
        isTxLimitExempt[holder] = exempt;
    }

    function setFees(uint256 _liquidityFee, uint256 _charityFee, uint256 _reflectionFee, uint256 _marketingFee) external authorized {
        liquidityFee = _liquidityFee;
        charityFee = _charityFee;
        reflectionFee = _reflectionFee;
        marketingFee = _marketingFee;
        totalFee = _liquidityFee.add(_charityFee).add(_reflectionFee).add(_marketingFee);
       
      
    }

    function setFeeReceivers(address payable _autoLiquidityReceiver, address payable _marketingFeeReceiver, address payable _charityFeeReceiver) external authorized {
        autoLiquidityReceiver = _autoLiquidityReceiver;
        marketingFeeReceiver = _marketingFeeReceiver;
        charityFeeReceiver = _charityFeeReceiver;
    }

    function setSwapBackSettings(bool _enabled, uint256 _amount) external authorized {
        swapEnabled = _enabled;
        swapThreshold = _amount;
    }

    function setDistributionCriteria(uint256 _minPeriod, uint256 _minDistribution) external authorized {
        distributor.setDistributionCriteria(_minPeriod, _minDistribution);
    }

    function setDistributorSettings(uint256 gas) external authorized {
        require(gas < 750000);
        distributorGas = gas;
    }

    function getCirculatingSupply() public view returns (uint256) {
        return _totalSupply;
    }


    event AutoLiquify(uint256 amountBNB, uint256 amountBOG);
   
}