pragma solidity ^0.4.24;
import "./SaiTub.sol";

contract CDPCreator {
    ERC20 public weth;
    ERC20 public peth;
    ERC20 public dai;
    SaiTub public tub;
    DSMath public math;

    event CDPCreated(bytes32 id, address creator, uint256 dai);

    constructor(address _weth, address _peth, address _dai, address _tub) public {
        require(_weth != address(0) && _peth != address(0) && _tub != address(0) && _dai != address(0));
        weth = ERC20(_weth);
        peth = ERC20(_peth);
        dai = ERC20(_dai);
        tub = SaiTub(_tub);
    }

    function createCDP(uint256 amountETH, uint256 amountDAI) payable external {
        require(amountETH >= 0.005 ether);
        bytes32 cupID;

        require(address(weth).call.value(msg.value)());
        weth.approve(address(tub), amountETH);

        uint256 rate = (10 ** 18 * amountETH) / (tub.ask(amountETH));
        uint256 pethAmount = (rate * amountETH) / (10 ** 18);
        tub.join(pethAmount);

        cupID = tub.open();
        peth.approve(address(tub), pethAmount);
        tub.lock(cupID, pethAmount);
        tub.draw(cupID, amountDAI);

        tub.give(cupID, msg.sender);
        dai.transfer(msg.sender, amountDAI);

        //weth.transfer(msg.sender, (amountETH - pethAmount));

        emit CDPCreated(cupID, msg.sender, amountDAI);
    }

    function convertETHToPETH(uint256 amountETH) payable external {
        require(msg.value == amountETH);
        require(address(weth).call.value(msg.value)());
        weth.approve(address(tub), amountETH);

        uint256 rate = (10 ** 18 * amountETH) / (tub.ask(amountETH));
        uint256 pethAmount = (rate * amountETH) / (10 ** 18);
        tub.join(pethAmount);

        weth.transfer(msg.sender, (amountETH - pethAmount));
    }

    function convertPETHToETH(uint256 amountPETH) payable external {
        require(peth.transferFrom(msg.sender, address(this), amountPETH));
        
        uint256 bid = tub.bid(amountPETH);
        tub.exit(amountPETH);
        weth.transfer(msg.sender, bid);
    }
}
