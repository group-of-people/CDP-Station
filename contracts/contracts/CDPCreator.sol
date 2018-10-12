pragma solidity ^0.4.24;
import "./SaiTub.sol";

contract CDPCreator {
    ERC20 public weth;
    ERC20 public peth;
    ERC20 public dai;
    SaiTub public tub;

    event CDPCreated(bytes32 id, address creator, uint256 dai);

    constructor(address _weth, address _peth, address _dai, address _tub) public {
        require(_weth != address(0) && _peth != address(0) && _tub != address(0) && _dai != address(0));
        weth = ERC20(_weth);
        peth = ERC20(_peth);
        dai = ERC20(_dai);
        tub = SaiTub(_tub);
    }

    function createCDP(uint256 amountETH, uint256 amountDAI) payable external {
        require(amountETH >= 0.005 ether && msg.value == amountETH);
        bytes32 cupID;

        require(address(weth).call.value(msg.value)());
        weth.approve(tub, amountETH);

        uint256 pethAmount = tub.ask(amountETH);
        tub.join(amountETH);
        cupID = tub.open();
        peth.approve(tub, pethAmount);
        tub.lock(cupID, pethAmount);
        tub.draw(cupID, amountDAI);

        tub.give(cupID, msg.sender);
        dai.transfer(msg.sender, amountDAI);

        emit CDPCreated(cupID, msg.sender, amountDAI);
    }

}