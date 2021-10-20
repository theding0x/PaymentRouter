const PaymentRouter = artifacts.require("PaymentRouter");

module.exports = function (deployer) {
    var tax = '0x8C4B146F7A9155De0A94Ee4eF957818eF0feCc8c';
    var primary = '0x77566d4f9A662BF3E12c8A03Eccdc45E97d13480';
    var savings = '0xcde6A7D43B6ced3Dc844Ec3DDCc41Cae4AcB7729';
    var taxRate = 20
    var savingsRate = 10
    deployer.deploy(PaymentRouter, tax, primary, savings, taxRate, savingsRate);
};
