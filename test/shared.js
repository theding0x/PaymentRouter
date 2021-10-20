const { assert } = require("chai");
const PaymentRouter = artifacts.require("PaymentRouter");
const run = exports.run = async(accounts) => {
    const router = await PaymentRouter.deployed();
    it("should have MyToken deployed", () => {
        assert(router !== undefined, "PaymentRouter is deployed");
    });
    return { router }
};
contract('Shared', run);