// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import '../pancake-swap-lib/math/SafeMath.sol';
import '../pancake-swap-lib/token/BEP20/IBEP20.sol';
import '../pancake-swap-lib/token/BEP20/SafeBEP20.sol';
import '../pancake-swap-lib/access/Ownable.sol';
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ReTkController.sol";

/**
 * LuchowMasterChef is the master of Reward Token(MLOKY) = ReTk(reTk)
 * 
 * Note that it's ownable and the owner wields tremendous power.
 *
 * Have fun reading it. Hopefully it's bug-free. God bless.
 */
contract LuchowMasterChef is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        uint256 rewardLockedUp; // Reward locked up.
        uint256 nextHarvestUntil; // When can the user harvest again.
        uint256 lastDepositedAt; // Last Deposited time
        //
        // We do some fancy math here. Basically, any point in time, the amount of ReTks
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accReTkPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accReTkPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IBEP20 lpToken; // Address of LP token contract.
        uint256 lpSupply; // Pool lp supply
        uint256 allocPoint; // How many allocation points assigned to this pool. ReTks to distribute per block.
        uint256 lastRewardBlock; // Last block number that ReTks distribution occurs.
        uint256 accReTkPerShare; // Accumulated ReTks per share, times 1e21 (1e30 - ReTk's decimals). See below.
        uint16 depositFeeBP; // Deposit fee in basis points
        uint256 harvestInterval; // Harvest interval in seconds
        uint256 withdrawFeeBP; // Withdraw fee in basis points
        uint256 lockPeriod; // Withdraw lock period in seconds
    }

    // The Reword Token!
    IBEP20 public reTk;
    // The reward token controller contract
    ReTkController public reTkController;
    // Deposit Fee address
    address public feeAddress;
    // Reword Tokens created per block.
    uint256 public reTkPerBlock;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when Mative Token mining starts.
    uint256 public startBlock;
    // Total locked up rewards
    uint256 public totalLockedUpRewards;

    // Bonus muliplier for early ReTk makers.
    uint256 public constant BONUS_MULTIPLIER = 1;
    // Max harvest interval: 120 days.
    uint256 public constant MAXIMUM_HARVEST_INTERVAL = 120 days;
    // Max deposit fee: 10%
    uint16 public constant MAXIMUM_DEPOSIT_FEE = 1000;
    // Max withdraw fee: 10%
    uint16 public constant MAXIMUM_WITHDRAW_FEE = 1000;
    // Maximum emission rate
    uint256 public constant MAXIMUM_EMISSON_RATE = 10000;

    event Deposited(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdrawn(address indexed user, uint256 indexed pid, uint256 amount);
    event EmissionRateUpdated(address indexed caller, uint256 oldValue, uint256 newValue);
    event RewardLockedUp(address indexed user, uint256 indexed pid, uint256 amountLockedUp);
    event FeeAddressUpdated(address indexed oldFeeAddress, address indexed newFeeAddress);
    event StartBlockUpdated(uint256 oldBlock, uint256 newBlock);

    constructor(
        IBEP20 _reTk,
        ReTkController _reTkController,
        address _feeAddress,
        uint256 _startBlock,
        uint256 _reTkPerBlock
    ) public {
        reTk = _reTk;
        reTkController = _reTkController;
        startBlock = _startBlock;
        uint256 rewardTokenDecimals = reTk.decimals();
        require(
            _reTkPerBlock <= MAXIMUM_EMISSON_RATE.mul(10**rewardTokenDecimals),
            "Emission rate exceeds limit"
        );
        reTkPerBlock = _reTkPerBlock;

        require(_feeAddress != address(0), "Invalid fee address");
        feeAddress = _feeAddress;
        emit FeeAddressUpdated(address(0), _feeAddress);

        // staking pool
        poolInfo.push(PoolInfo({
            lpToken: _reTk,
            lpSupply: 0,
            allocPoint: 1000,
            lastRewardBlock: startBlock,
            accReTkPerShare: 0,
            depositFeeBP: 0,
            harvestInterval: 0,
            withdrawFeeBP: 0,
            lockPeriod: 0
        }));

        totalAllocPoint = 1000;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    mapping(IBEP20 => bool) public poolExistence;
    modifier nonDuplicated(IBEP20 _lpToken) {
        require(poolExistence[_lpToken] == false, "nonDuplicated: duplicated");
        _;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(
        uint256 _allocPoint, 
        IBEP20 _lpToken, 
        uint16 _depositFeeBP, 
        uint16 _withdrawFeeBP,
        uint256 _harvestInterval, 
        uint256 _lockPeriod,
        bool _withUpdate
    ) public onlyOwner nonDuplicated(_lpToken) {
        require(_depositFeeBP <= MAXIMUM_DEPOSIT_FEE, "add: invalid deposit fee basis points");
        require(_withdrawFeeBP <= MAXIMUM_WITHDRAW_FEE, "add: invalid withdraw fee basis points");
        require(_harvestInterval <= MAXIMUM_HARVEST_INTERVAL, "add: invalid harvest interval");
        if (_withUpdate) { massUpdatePools(); }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolExistence[_lpToken] = true;
        poolInfo.push(PoolInfo({
            lpToken: _lpToken,
            lpSupply: 0,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accReTkPerShare: 0,
            depositFeeBP: _depositFeeBP,
            harvestInterval: _harvestInterval,
            withdrawFeeBP: _withdrawFeeBP,
            lockPeriod: _lockPeriod
        }));
    }

    // Update the given pool's ReTk allocation point and deposit fee. Can only be called by the owner.
    function set(
        uint256 _pid, 
        uint256 _allocPoint, 
        uint16 _depositFeeBP, 
        uint16 _withdrawFeeBP,
        uint256 _harvestInterval, 
        uint256 _lockPeriod,
        bool _withUpdate
    ) public onlyOwner {
        require(_depositFeeBP <= MAXIMUM_DEPOSIT_FEE, "set: invalid deposit fee basis points");
        require(_withdrawFeeBP <= MAXIMUM_WITHDRAW_FEE, "set: invalid withdraw fee basis points");
        require(_harvestInterval <= MAXIMUM_HARVEST_INTERVAL, "set: invalid harvest interval");
        if (_withUpdate) { massUpdatePools(); }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
        poolInfo[_pid].allocPoint = _allocPoint;
        poolInfo[_pid].depositFeeBP = _depositFeeBP;
        poolInfo[_pid].withdrawFeeBP = _withdrawFeeBP;
        poolInfo[_pid].harvestInterval = _harvestInterval;
        poolInfo[_pid].lockPeriod = _lockPeriod;
    }

    // Return reward multiplier over the given _from block to _to block.
    function getMultiplier(uint256 _fromBlock, uint256 _toBlock) public pure returns (uint256) {
        return _toBlock.sub(_fromBlock).mul(BONUS_MULTIPLIER);
    }

    // View function to see pending ReTks on frontend.
    function pendingReTk(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accReTkPerShare = pool.accReTkPerShare;
        uint256 lpSupply = pool.lpSupply;
        if (block.number > pool.lastRewardBlock && lpSupply != 0 && totalAllocPoint > 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 reTkReward = multiplier.mul(reTkPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accReTkPerShare = accReTkPerShare.add(reTkReward.mul(1e21).div(lpSupply));
        }
        uint256 pending = user.amount.mul(accReTkPerShare).div(1e21).sub(user.rewardDebt);
        return pending.add(user.rewardLockedUp);
    }

    // View function to see if user can harvest ReTks.
    function canHarvest(uint256 _pid, address _user) public view returns (bool) {
        UserInfo storage user = userInfo[_pid][_user];
        return block.timestamp >= user.nextHarvestUntil;
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // View function to see if user can withdraw
    function canWithdraw(uint256 _pid, address _user) public view returns (bool) {
        uint256 lastDepositedAt = userInfo[_pid][_user].lastDepositedAt;
        uint256 lockPeriod = poolInfo[_pid].lockPeriod;
        return block.timestamp >= lastDepositedAt.add(lockPeriod);
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) { return; }
        uint256 lpSupply = pool.lpSupply;
        if (lpSupply == 0 || pool.allocPoint == 0) { pool.lastRewardBlock = block.number; return; }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 reTkReward = multiplier.mul(reTkPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
        pool.accReTkPerShare = pool.accReTkPerShare.add(reTkReward.mul(1e21).div(lpSupply));
        pool.lastRewardBlock = block.number;
    }

    // Deposit LP tokens to MasterChef for ReTk allocation.
    function deposit(uint256 _pid, uint256 _amount) public nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        payOrLockupPendingReTk(_pid);

        if (_amount > 0) {
            uint256 balanceBefore = pool.lpToken.balanceOf(address(this));
            pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            _amount = pool.lpToken.balanceOf(address(this)).sub(balanceBefore);

            uint256 depositFee = 0;
            if (pool.depositFeeBP > 0) {
                depositFee = _amount.mul(pool.depositFeeBP).div(10000);
                if (depositFee > 0) {
                    pool.lpToken.safeTransfer(feeAddress, depositFee);
                }
            }
            user.amount = user.amount.add(_amount).sub(depositFee);
            user.lastDepositedAt = block.timestamp;
            pool.lpSupply = pool.lpSupply.add(_amount).sub(depositFee);
        }
        user.rewardDebt = user.amount.mul(pool.accReTkPerShare).div(1e21);
        emit Deposited(msg.sender, _pid, _amount);
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _amount) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(_amount > 0, "Non zero amount");
        require(user.amount >= _amount, "withdraw: not good(user balance not enough)");
        require(pool.lpSupply >= _amount, "withdraw: not good(pool balance not enough)");

        updatePool(_pid);
        payOrLockupPendingReTk(_pid);

        user.amount = user.amount.sub(_amount);
        pool.lpSupply = pool.lpSupply.sub(_amount);

        if (!canWithdraw(_pid, msg.sender)) {
            uint256 withdrawFee = _amount.mul(pool.withdrawFeeBP).div(10000);
            if (withdrawFee > 0) {
                pool.lpToken.safeTransfer(feeAddress, withdrawFee);
                _amount = _amount.sub(withdrawFee);
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount.mul(pool.accReTkPerShare).div(1e21);
        emit Withdrawn(msg.sender, _pid, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 amount = user.amount;
        pool.lpSupply = pool.lpSupply.sub(amount);
        user.amount = 0;
        user.rewardDebt = 0;
        user.rewardLockedUp = 0;
        user.nextHarvestUntil = 0;
        pool.lpToken.safeTransfer(address(msg.sender), amount);
        emit EmergencyWithdrawn(msg.sender, _pid, amount);
    }

    // Pay or lockup pending ReTks.
    function payOrLockupPendingReTk(uint256 _pid) internal {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        if (user.nextHarvestUntil == 0) {
            user.nextHarvestUntil = block.timestamp.add(pool.harvestInterval);
        }
        uint256 pending = user.amount.mul(pool.accReTkPerShare).div(1e21).sub(user.rewardDebt);
        if (canHarvest(_pid, msg.sender)) {
            if (pending > 0 || user.rewardLockedUp > 0) {
                uint256 totalRewards = pending.add(user.rewardLockedUp);
                // send rewards
                uint256 transferredAmount = safeReTkTransfer(msg.sender, totalRewards);
                // reset lockup
                uint256 diff = totalRewards.sub(transferredAmount);
                totalLockedUpRewards = totalLockedUpRewards.sub(user.rewardLockedUp).add(diff);
                user.rewardLockedUp = diff;
                if (transferredAmount > 0) {
                    user.nextHarvestUntil = block.timestamp.add(pool.harvestInterval);
                }
            }
        } else if (pending > 0) {
            user.rewardLockedUp = user.rewardLockedUp.add(pending);
            totalLockedUpRewards = totalLockedUpRewards.add(pending);
            emit RewardLockedUp(msg.sender, _pid, pending);
        }
    }

    // Safe ReTk transfer function, just in case if rounding error causes pool to not have enough ReTks.
    function safeReTkTransfer(address _to, uint256 _amount) internal returns (uint256) {
        return reTkController.safeReTkTransfer(_to, _amount);
    }

    function setFeeAddress(address _feeAddress) external {
        require(msg.sender == feeAddress, "setFeeAddress: FORBIDDEN");
        require(_feeAddress != address(0), "setFeeAddress: ZERO");
        require(feeAddress != _feeAddress, "setFeeAddress: Already Set");
        emit FeeAddressUpdated(feeAddress, _feeAddress);
        feeAddress = _feeAddress;
    }

    function updateStartBlock(uint256 _startBlock) external onlyOwner {
        require(block.number < startBlock, "Farm already started");
        require(block.number < _startBlock, "Invalid start block");
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            PoolInfo storage pool = poolInfo[pid];
            pool.lastRewardBlock = _startBlock;
        }
        emit StartBlockUpdated(startBlock, _startBlock);
        startBlock = _startBlock;
    }

    function updateEmissionRate(uint256 _reTkPerBlock) external onlyOwner {
        uint256 rewardTokenDecimals = reTk.decimals();
        require(
            _reTkPerBlock <= MAXIMUM_EMISSON_RATE.mul(10**rewardTokenDecimals),
            "updateEmissionRate: exceeds emission limit"
        );
        massUpdatePools();
        emit EmissionRateUpdated(msg.sender, reTkPerBlock, _reTkPerBlock);
        reTkPerBlock = _reTkPerBlock;
    }
}