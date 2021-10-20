const PaymentRouter = artifacts.require("PaymentRouter");
const { assert } = require("chai");
const shared = require("./shared.js");
const chai = require("./setupChai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("PaymentRouter", accounts => {
    before(async () => {
        primaryWallet = accounts[3];
        taxWallet = accounts[1];
        savingsWallet = accounts[2];
        taxRate = 10;
        savingsRate = 10;
        this.router = await PaymentRouter.new(taxWallet,primaryWallet,savingsWallet,taxRate,savingsRate);
    });
    it("deploys", async () => {
        assert(this.router !== undefined, "PaymentRouter is not deployed");
    });
    it("splits payments", async () => {
        const payer = accounts[6];
        const primary = accounts[3];
        const tax = accounts[1];
        const savings = accounts[2];

        const taxStart = new BN(await web3.eth.getBalance(tax));
        const savingsStart = new BN(await web3.eth.getBalance(savings));
        const primaryStart = new BN(await web3.eth.getBalance(primary));
        
        const sendAmount = web3.utils.toWei(new BN('1'));
        const taxRate = new BN('10');
        const saveRate = new BN('10');

        let taxAmount = sendAmount.div(taxRate);
        let saveAmount = (sendAmount.sub(taxAmount)).div(saveRate);
        let expectedTax = taxStart.add(taxAmount);
        let expectedSave = savingsStart.add(saveAmount);
        let totalWithheld = taxAmount.add(saveAmount);
        let net = sendAmount.sub(totalWithheld);
        let expectedPrimary = primaryStart.add(net);

        await this.router.send(sendAmount, {from:payer});

        let taxBalance = new BN(await web3.eth.getBalance(tax));
        let saveBalance = new BN(await web3.eth.getBalance(savings));
        let primaryBalance = new BN(await web3.eth.getBalance(primary));

        expect(taxBalance).to.be.a.bignumber.that.equals(expectedTax);
        expect(saveBalance).to.be.a.bignumber.that.equals(expectedSave);
        expect(primaryBalance).to.be.a.bignumber.that.equals(expectedPrimary);
    });
    it ("retrieves wallet information", async () => {
        const tax = accounts[1];
        const savings = accounts[2];
        const primary = accounts[3];

        let taxWallet = await this.router.getWallet(0);
        let savingsWallet = await this.router.getWallet(1);
        let primaryWallet = await this.router.getWallet(2);

        expect(taxWallet.addr).to.equal(tax);
        expect(new BN(taxWallet.rate)).to.be.a.bignumber.that.equals(new BN(taxRate));
        expect(savingsWallet.addr).to.equal(savings);
        expect(new BN(savingsWallet.rate)).to.be.a.bignumber.that.equals(new BN(savingsRate));
        expect(primaryWallet.addr).to.equal(primary);
    });
    it("updates wallet information", async () => {
        const walletId = 0
        await this.router.setWalletAddress(walletId,accounts[5]); 
        let walletInfo = await this.router.getWallet(walletId);
        expect(walletInfo.addr).to.equal(accounts[5]);
    })
    it("sets tax and savings rates", async () => {
        const newTaxRate = 20;
        const newSavingsRate = 30;
        const nwePrimaryRate = newTaxRate + newSavingsRate;

        await this.router.setRates(newTaxRate, newSavingsRate);

        let taxWallet = await this.router.getWallet(0);
        let savingsWallet = await this.router.getWallet(1);
        let primaryWallet = await this.router.getWallet(2);

        expect(new BN(taxWallet.rate)).to.be.a.bignumber.that.equals(new BN(newTaxRate),"Tax rate incorrect");
        expect(new BN(savingsWallet.rate)).to.be.a.bignumber.that.equals(new BN(newSavingsRate),"Savings rate incorrect");
        expect(new BN(primaryWallet.rate)).to.be.a.bignumber.that.equals(new BN(nwePrimaryRate), "Primary rate incorrect");
    });
    it("cannot set tax and savings rates equalling more than 100", async () => {
        const newTaxRate = 60;
        const newSavingsRate = 60;
        await expect(this.router.setRates(newTaxRate,newSavingsRate)).to.eventually.be.rejectedWith("Invalid tax/savings rates");
    });
    it("fails for anyone other than the owner", async () => {
        await expect(this.router.getWallet(0,{from:accounts[8]})).to.eventually.be.rejected;
    });
})