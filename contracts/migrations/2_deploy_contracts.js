var CDPCreator = artifacts.require("./CDPCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(CDPCreator,"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                              "0xf53AD2c6851052A81B42133467480961B2321C09",
                              "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359", 
                              "0x448a5065aebb8e423f0896e6c5d525c040f59af3");
};