// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./libs/IERC20.sol";
import "./libs/SafeERC20.sol";
import "./libs/IKeyReferral.sol";
import "./libs/Ownable.sol";
import "./libs/ReentrancyGuard.sol";

import "./MintableERC20.sol";

// MasterChef is the master of KEY. He can make KEY and he is a fair guy.
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once KEY is sufficiently
// distributed and the community can show to govern itself.
//
// Have fun reading it. Hopefully it's bug-free. God bless.
contract KeyMasterChef is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for MintableERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided
        uint256 rewardLockedUp; // Reward locked up
        uint256 lastHarvestedAt; // Last harvested time
        uint256 lastDepositedAt; // Last deposited time
        uint256 lastRewardBlock; // Last reward calculated block
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken; // Address of LP token contract.
        uint256 lpSupply; // Total staked supply
        uint256 rewardPerBlock; // Fixed reward per block per 1 lpToken
        uint256 harvestInterval; // Harvest interval in seconds
        uint256 lockPeriod; // Withdraw lock period in second
        uint16 depositFeeBP; // Deposit fee in basis points
        uint16 withdrawFeeBP; // Withdraw fee in basis points
        bool referralEnabled; // Referral reward is enabled
    }

    MintableERC20 public keyToken; // The KEY TOKEN!
    address public devAddress; // Dev address.
    address public feeAddress; // Deposit Fee address

    PoolInfo[] public poolInfo; // Info of each pool.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo; // Info of each user that stakes LP tokens.

    // The block number when KEY mining starts.
    uint256 public startBlock;
    uint256 public totalLockedUpRewards; // Total locked up rewards
    IKeyReferral public keyReferral; // KEY referral contract address.
    uint16 public referralCommissionRate = 0; // Referral commission rate in basis points.

    address constant DEAD = 0x000000000000000000000000000000000000dEaD;
    uint256 constant MINT_STOP_SUPPLY = 2 * 10**27; // mint stops when reaches 2 billion
    uint16 public constant MAX_REFERRAL_COMMISSION_RATE = 1000; // Max referral commission rate: 10%.
    uint16 public constant MAX_DEPOSIT_FEE = 1000; // Max deposit fee: 10%
    uint16 public constant MAX_WITHDRAW_FEE = 1000; // Max withdraw fee: 10%
    uint256 public constant MAX_HARVEST_INTERVAL = 30 days; // Max harvest interval
    uint256 public constant MAX_LOCK_PERIOD = 60 days; // Max lock period

    event Deposited(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvested(address indexed user, uint256 amount);
    event ReferralCommissionPaid(
        address indexed user,
        address indexed referrer,
        uint256 amount
    );
    event RewardLockedUp(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );
    event EmergencyWithdrawn(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );
    event MintLimited();

    constructor(
        MintableERC20 _keyToken,
        address _devAddr,
        address _feeAddr,
        uint256 _startBlock
    ) {
        require(address(_keyToken) != address(0), "Invalid reward token");
        keyToken = _keyToken;
        startBlock = _startBlock;

        devAddress = _devAddr;
        feeAddress = _feeAddr;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    function add(
        IERC20 _lpToken,
        uint256 _rewardPerBlock,
        uint16 _depositFeeBP,
        uint16 _withdrawFeeBP,
        uint256 _harvestInterval,
        uint256 _lockPeriod,
        bool _referralEnabled
    ) external onlyOwner {
        require(address(_lpToken) != address(0), "Invalid lp token");
        _lpToken.balanceOf(address(this));
        require(_depositFeeBP <= MAX_DEPOSIT_FEE, "Too big deposit fee");
        require(_withdrawFeeBP <= MAX_WITHDRAW_FEE, "Too big withdraw fee");
        require(
            _harvestInterval <= MAX_HARVEST_INTERVAL,
            "Too long harvest interval"
        );
        require(_lockPeriod <= MAX_LOCK_PERIOD, "Too long lock period");

        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                lpSupply: 0,
                rewardPerBlock: _rewardPerBlock,
                depositFeeBP: _depositFeeBP,
                withdrawFeeBP: _withdrawFeeBP,
                harvestInterval: _harvestInterval,
                lockPeriod: _lockPeriod,
                referralEnabled: _referralEnabled
            })
        );
    }

    // Update the given pool's configuration
    function set(
        uint256 _pid,
        uint256 _rewardPerBlock,
        uint16 _depositFeeBP,
        uint16 _withdrawFeeBP,
        uint256 _harvestInterval,
        uint256 _lockPeriod,
        bool _referralEnabled
    ) external onlyOwner {
        require(_depositFeeBP <= MAX_DEPOSIT_FEE, "Too big deposit fee");
        require(_withdrawFeeBP <= MAX_WITHDRAW_FEE, "Too big withdraw fee");
        require(
            _harvestInterval <= MAX_HARVEST_INTERVAL,
            "Too long harvest interval"
        );
        require(_lockPeriod <= MAX_LOCK_PERIOD, "Too long lock period");

        poolInfo[_pid].rewardPerBlock = _rewardPerBlock;
        poolInfo[_pid].depositFeeBP = _depositFeeBP;
        poolInfo[_pid].withdrawFeeBP = _withdrawFeeBP;
        poolInfo[_pid].harvestInterval = _harvestInterval;
        poolInfo[_pid].lockPeriod = _lockPeriod;
        poolInfo[_pid].referralEnabled = _referralEnabled;
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to)
        internal
        view
        returns (uint256)
    {
        if (_from >= _to) {
            return 0;
        }
        if (_to <= startBlock) {
            return 0;
        }
        if (_from < startBlock) {
            return _to.sub(startBlock);
        }
        return _to.sub(_from);
    }

    // View function to see pending KEYs on frontend.
    function pendingReward(uint256 _pid, address _user)
        public
        view
        returns (uint256)
    {
        uint256 rewardPerBlock = poolInfo[_pid].rewardPerBlock;
        IERC20 lpToken = poolInfo[_pid].lpToken;
        UserInfo storage user = userInfo[_pid][_user];

        uint256 multiplier = getMultiplier(user.lastRewardBlock, block.number);
        uint256 PRECISION_FACTOR = 10**(lpToken.decimals());
        uint256 pending = user.amount.mul(multiplier).mul(rewardPerBlock).div(
            PRECISION_FACTOR
        );
        return pending.add(user.rewardLockedUp);
    }

    // View function to see if user can harvest KEYs.
    function canHarvest(uint256 _pid, address _user)
        public
        view
        returns (bool)
    {
        uint256 lastHarvestedAt = userInfo[_pid][_user].lastHarvestedAt;
        uint256 harvestInterval = poolInfo[_pid].harvestInterval;
        return block.timestamp >= lastHarvestedAt.add(harvestInterval);
    }

    // View function to see if user can withdraw
    function canWithdraw(uint256 _pid, address _user)
        public
        view
        returns (bool)
    {
        uint256 lastDepositedAt = userInfo[_pid][_user].lastDepositedAt;
        uint256 lockPeriod = poolInfo[_pid].lockPeriod;
        return block.timestamp >= lastDepositedAt.add(lockPeriod);
    }

    // Deposit LP tokens to MasterChef for KEY allocation.
    function deposit(
        uint256 _pid,
        uint256 _amount,
        address _referrer
    ) external nonReentrant {
        address sender = _msgSender();
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][sender];

        if (
            _amount > 0 &&
            address(keyReferral) != address(0) &&
            pool.referralEnabled
        ) {
            keyReferral.recordReferrer(sender, _referrer);
        }

        payOrLockupPendingReward(_pid);

        if (_amount > 0) {
            uint256 balanceBefore = pool.lpToken.balanceOf(address(this));
            pool.lpToken.safeTransferFrom(
                address(sender),
                address(this),
                _amount
            );
            _amount = pool.lpToken.balanceOf(address(this)).sub(balanceBefore);
            if (pool.depositFeeBP > 0) {
                uint256 depositFee = _amount.mul(pool.depositFeeBP).div(10000);
                if (depositFee > 0) {
                    pool.lpToken.safeTransfer(feeAddress, depositFee);
                    _amount = _amount.sub(depositFee);
                }
            }
            user.amount = user.amount.add(_amount);
            user.lastDepositedAt = block.timestamp;
            pool.lpSupply = pool.lpSupply.add(_amount);
            emit Deposited(sender, _pid, _amount);
        }
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _amount) external nonReentrant {
        address sender = _msgSender();
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][sender];

        require(_amount > 0, "Non zero amount");
        require(user.amount >= _amount, "Exceeds user staked amount");
        require(pool.lpSupply >= _amount, "Exceeds pool lp supply");

        payOrLockupPendingReward(_pid);

        user.amount = user.amount.sub(_amount);
        pool.lpSupply = pool.lpSupply.sub(_amount);

        if (!canWithdraw(_pid, sender)) {
            uint256 withdrawFee = _amount.mul(pool.withdrawFeeBP).div(10000);
            if (withdrawFee > 0) {
                pool.lpToken.safeTransfer(feeAddress, withdrawFee);
                _amount = _amount.sub(withdrawFee);
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransfer(sender, _amount);
        }

        emit Withdrawn(sender, _pid, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) external nonReentrant {
        address sender = _msgSender();
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][sender];
        uint256 amount = user.amount;
        pool.lpSupply = pool.lpSupply.sub(amount);
        totalLockedUpRewards = totalLockedUpRewards.sub(user.rewardLockedUp);
        user.amount = 0;
        user.rewardLockedUp = 0;
        user.lastHarvestedAt = 0;
        user.lastDepositedAt = 0;
        user.lastRewardBlock = 0;
        pool.lpToken.safeTransfer(sender, amount);
        emit EmergencyWithdrawn(sender, _pid, amount);
    }

    // Pay or lockup pending KEYs.
    function payOrLockupPendingReward(uint256 _pid) internal {
        address sender = _msgSender();
        UserInfo storage user = userInfo[_pid][sender];

        if (user.lastHarvestedAt == 0) {
            user.lastHarvestedAt = block.timestamp;
        }

        uint256 pending = pendingReward(_pid, sender);
        user.lastRewardBlock = block.number;
        if (pending == 0) {
            return;
        }

        // reset lockup
        totalLockedUpRewards = totalLockedUpRewards.sub(user.rewardLockedUp);
        if (canHarvest(_pid, sender)) {
            user.rewardLockedUp = 0;
            user.lastHarvestedAt = block.timestamp;
            // mint rewards
            safeRewardMint(devAddress, pending.div(10)); // 10% mint to dev address
            safeRewardMint(sender, pending);
            emit Harvested(sender, pending);
            // pay referral commission
            if (poolInfo[_pid].referralEnabled) {
                payReferralCommission(sender, pending);
            }
        } else {
            user.rewardLockedUp = pending;
            totalLockedUpRewards = totalLockedUpRewards.add(pending);
            emit RewardLockedUp(sender, _pid, pending);
        }
    }

    // Safe KEY transfer function, just in case if rounding error causes pool to not have enough KEYs.
    function safeRewardMint(address _to, uint256 _amount) internal {
        uint256 totalSupply = keyToken.totalSupply();
        uint256 burnedSupply = keyToken.balanceOf(DEAD);
        uint256 circuitSupply = totalSupply.sub(burnedSupply);
        // Once KEY token supply reaches 2 billion, it stops minting
        if (circuitSupply.add(_amount) > MINT_STOP_SUPPLY) {
            emit MintLimited();
            return;
        }
        keyToken.mint(_to, _amount);
    }

    /**
     * @notice Update reward start block
     */
    function updateStartBlock(uint256 _blockNumber) external onlyOwner {
        require(_blockNumber > block.number, "Only future block");
        require(startBlock > block.number, "Already started");
        startBlock = _blockNumber;
    }

    // Update dev address by the previous dev.
    function setDevAddress(address _devAddress) external onlyOwner {
        require(_devAddress != address(0), "setDevAddress: ZERO");
        devAddress = _devAddress;
    }

    function setFeeAddress(address _feeAddress) external onlyOwner {
        require(_feeAddress != address(0), "setFeeAddress: ZERO");
        feeAddress = _feeAddress;
    }

    // Update the KEY referral contract address by the owner
    function setKeyReferral(IKeyReferral _keyReferral) external onlyOwner {
        require(address(_keyReferral) != address(0), "Invalid address");
        keyReferral = _keyReferral;
    }

    // Update referral commission rate by the owner
    function setReferralCommissionRate(uint16 _rate) public onlyOwner {
        require(
            _rate > 0 && _rate <= MAX_REFERRAL_COMMISSION_RATE,
            "Invalid value"
        );
        referralCommissionRate = _rate;
    }

    // Pay referral commission to the referrer who referred this user.
    function payReferralCommission(address _user, uint256 _pending) internal {
        if (address(keyReferral) != address(0) && referralCommissionRate > 0) {
            address referrer = keyReferral.getReferrer(_user);
            uint256 commissionAmount = _pending.mul(referralCommissionRate).div(
                10000
            );

            if (referrer != address(0) && commissionAmount > 0) {
                safeRewardMint(referrer, commissionAmount);
                keyReferral.addReferralReward(referrer, commissionAmount);
                emit ReferralCommissionPaid(_user, referrer, commissionAmount);
            }
        }
    }
}
