export default class Approvals {
  mkrApproval: Number;
  daiApproval: Number;
  pethApproval: Number;
  pethCreator: Number;

  constructor(
    mkrApproval: Number,
    daiApproval: Number,
    pethApproval: Number,
    pethCreator: Number
  ) {
    this.mkrApproval = mkrApproval;
    this.daiApproval = daiApproval;
    this.pethApproval = pethApproval;
    this.pethCreator = pethCreator;
  }
}
