const CDPCreator = artifacts.require('CDPCreator.sol');
const TUB = artifacts.require('Saitub.sol');
const BigNumber = web3.BigNumber;
const expectEvent = require('./expectEvent');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('CDPCreator', (accounts) => {
    const min = new BigNumber(web3.toWei(1, "ether"));
    const dai = 1000000000000000000;
    let cdpCreator, tub;

    beforeEach(async () => {
        cdpCreator = await CDPCreator.new("0x7ba25f791fa76c3ef40ac98ed42634a8bc24c238",
                                          "0xa6164a2e88e258a663772ed4912a0865af8f6d06",
                                          "0xc226f3cd13d508bc319f4f4290172748199d6612", 
                                          "0xe82ce3d6bf40f2f9414c8d01a35e3d9eb16a1761");
        
        tub = web3.eth.contract(TUB.abi).at("0xe82ce3d6bf40f2f9414c8d01a35e3d9eb16a1761");
    })

    describe('Creation Tests', () => {
        it('Creates a CDP and transfers it to the creator along with drawn DAI', async () => {
            const tx = await cdpCreator.createCDP(min, dai, { value: min, from: accounts[0] });

            expectEvent.inTransaction(tx, 'CDPCreated', {
                creator: accounts[0],
                dai: dai
            });
            
            expectEvent.inTransaction(tx, 'Transfer', {
                src: cdpCreator.address,
                dst: accounts[0],
                wad: min
            });
        });

        it('should not create a CDP and draw a lot of dai', async () => {
            await cdpCreator.createCDP(min, dai*200, { value: min, from: accounts[0]}).should.be.fulfilled;
            await cdpCreator.createCDP(min, dai*300, { value: min, from: accounts[0]}).should.be.rejected;
        })
    });
})