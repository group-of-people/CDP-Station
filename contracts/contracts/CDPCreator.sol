pragma solidity ^0.4.24;
import "./SaiTub.sol";
import "./WETH.sol";

contract CDPCreator {
    WETH9 public weth;
    ERC20 public peth;
    ERC20 public dai;
    SaiTub public tub;
    DSMath public math;

    event CDPCreated(bytes32 id, address creator, uint256 dai);

    constructor(address _weth, address _peth, address _dai, address _tub) public {
        require(_weth != address(0) && _peth != address(0) && _tub != address(0) && _dai != address(0));
        weth = WETH9(_weth);
        peth = ERC20(_peth);
        dai = ERC20(_dai);
        tub = SaiTub(_tub);
    }

    function createCDP(uint256 amountETH, uint256 amountDAI) payable external {
        require(amountETH >= 0.005 ether);
        require(msg.value == amountETH);
        require(address(weth).call.value(msg.value)());

        weth.approve(address(tub), amountETH);

        uint256 amountPETH = (amountETH ** 2) / (tub.ask(amountETH));
        tub.join(amountPETH);

        bytes32 cupID = tub.open();
        peth.approve(address(tub), amountPETH);
        tub.lock(cupID, amountPETH);
        tub.draw(cupID, amountDAI);

        tub.give(cupID, msg.sender);
        dai.transfer(msg.sender, amountDAI);

        emit CDPCreated(cupID, msg.sender, amountDAI);
    }

    function convertETHToPETH(uint256 amountETH) payable external {
        require(msg.value == amountETH);
        require(address(weth).call.value(msg.value)());
        weth.approve(address(tub), amountETH);

        uint256 amountPETH = (amountETH ** 2) / (tub.ask(amountETH));
        tub.join(amountPETH);
        peth.transfer(msg.sender, amountPETH);
    }

    function convertPETHToETH(uint256 amountPETH) external {
        require(peth.transferFrom(msg.sender, address(this), amountPETH));
        
        peth.approve(address(tub), amountPETH);
        uint256 bid = tub.bid(amountPETH);
        tub.exit(amountPETH);
        weth.withdraw(bid);
        msg.sender.transfer(bid);
    }

    function () payable external {
        //only accept payments from WETH withdrawal
        require(msg.sender == address(weth));
    }
}