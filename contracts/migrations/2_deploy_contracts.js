var CDPCreator = artifacts.require("./CDPCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(CDPCreator,"0xb832275c0a544ca24949f304778f329698516911",
                              "0xa022ed757047e2e5f4c3776403d70fea54ca5e32",
                              "0x3ec63f0d8f5bc684cfe359c0515efd59f656ffad", 
                              "0xed8f47f9bf345c7972e051baadf04c27196fb226");
};