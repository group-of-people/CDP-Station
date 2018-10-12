const CDPCreator = artifacts.require('CDPCreator.sol');
const BigNumber = web3.BigNumber;
const expectEvent = require('./expectEvent');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('CDPCreator', (accounts) => {
    const min = new BigNumber(web3.toWei(1, "ether"));
    const dai = 1000000000000000000;
    let cdpCreator;

    beforeEach(async () => {
        cdpCreator = await CDPCreator.new("0xb832275c0a544ca24949f304778f329698516911",
                                          "0xa022ed757047e2e5f4c3776403d70fea54ca5e32",
                                          "0x3ec63f0d8f5bc684cfe359c0515efd59f656ffad", 
                                          "0xed8f47f9bf345c7972e051baadf04c27196fb226");
    })

    describe('Creation Test', () => {
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

        it('should not create a CDP and draw a fuckton of dai', async () => {
            await cdpCreator.createCDP(min, dai*200, { value: min, from: accounts[0]}).should.be.fulfilled;
            await cdpCreator.createCDP(min, dai*100, { value: min, from: accounts[0]}).should.be.rejected;
        })
    });
})