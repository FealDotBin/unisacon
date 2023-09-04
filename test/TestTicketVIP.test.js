const chai = require('chai');

const Ticket = artifacts.require("Ticket");
const TicketVIP = artifacts.require("TicketVIP");

const ticketPrice = web3.utils.toWei('0.003', 'ether');
const ticketVIPPrice = web3.utils.toWei('0.0059', 'ether');
const ticketUpgradePrice = web3.utils.toWei('0.0029', 'ether');

contract("Test Ticket VIP", (accounts) => {
    let ticket;
    let ticketVIP;

    beforeEach('should setup the contract instance', async () => {
        ticket = await Ticket.new('Ticket', 'tickets', 2);
        ticketVIP = await TicketVIP.new('TicketVIP', 'ticketsVIP', 2);
        await ticket.setTicketVIP(ticketVIP.address);
        await ticketVIP.setTicket(ticket.address);
    });

    // try to buy a ticket out of stock
    it("should throw an error message (No tickets left!)", async () => {
        const expectedError = "No tickets left!";

        // buy 1 VIP ticket
        await ticketVIP.buyTicket(
            {from: accounts[0], value: ticketVIPPrice, gas: 100000}
        );
        
        // buy 1 VIP ticket
        await ticketVIP.buyTicket(
            {from: accounts[1], value: ticketVIPPrice, gas: 100000}
        );
        
        // try to buy 1 VIP ticket
        try {
            await ticketVIP.buyTicket(
                {from: accounts[2], value: ticketVIPPrice, gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }

    });

    // try to buy 2 tickets
    it("should throw an error message (You've already purchased a VIP ticket!)", async () => {
        const expectedError = "You've already purchased a VIP ticket!";

        // buy 1 ticket
        try { 
            await ticketVIP.buyTicket(
                {from: accounts[0], value: ticketVIPPrice, gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }

        // buy 1 ticket
        try {
            await ticketVIP.buyTicket(
                {from: accounts[0], value: ticketVIPPrice, gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // try to buy a VIP ticket, while owning a regular ticket
    it("should throw an error message (You've already purchased a ticket!)", async () => {
        const expectedError = "You've already purchased a ticket!";
        
        // buy a regular ticket 
        await ticket.buyTicket(
            {from: accounts[0], value: ticketPrice, gas: 100000}
        );

        // try to buy a VIP ticket
        try {
            await ticketVIP.buyTicket(
                {from: accounts[0], value: ticketVIPPrice, gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // try to buy a ticket without the right amount of money
    it("should throw an error message (Not enough money!)", async () => {
        const expectedError = "Not enough money!";
        
        // try to buy using less money
        try {
            await ticketVIP.buyTicket(
                {from: accounts[0], value: web3.utils.toWei('0.002', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
        
        // try to buy using more money
        try {
            await ticketVIP.buyTicket(
                {from: accounts[0], value: web3.utils.toWei('0.008', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // test if the user purchase a ticket successfully and the contract has the right balance
    it("should buy a ticket", async () => {
        let expectedHasTicket = true;
        let expectedBalance = ticketVIPPrice;
        let hasTicket;
        let currentBalance;

        // buy 1 ticket
        await ticketVIP.buyTicket(
            {from: accounts[0], value: ticketVIPPrice, gas: 100000}
        );

        // verify ticket and get contract balance
        hasTicket = await ticketVIP.verifyTicket({from: accounts[0]});
        currentBalance = await web3.eth.getBalance(ticketVIP.address);

        assert.equal(hasTicket, expectedHasTicket, "account[0] should own a ticket");
        assert.equal(currentBalance, expectedBalance, "contract should have 0.0059 ETH");
    });

    // try to upgrade a ticket but there're no VIP ticket left
    it("should throw an error message (No tickets left!)", async () => {
        const expectedError = "No tickets left!";
        
        // buy 1 VIP ticket
        await ticketVIP.buyTicket(
            {from: accounts[0], value: ticketVIPPrice, gas: 100000}
        );
        
        // buy 1 VIP ticket
        await ticketVIP.buyTicket(
            {from: accounts[1], value: ticketVIPPrice, gas: 100000}
        );

        // buy 1 regular ticket 
        await ticket.buyTicket(
            {from: accounts[2], value: ticketPrice, gas: 100000}
        );

        // try to upgrade a regular ticket
        try {
            await ticketVIP.upgradeTicket(
                {from: accounts[2], value: ticketUpgradePrice, gas: 100000}
            );
        } catch(error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // try to upgrade a ticket but you already have a VIP ticket
    it("should throw an error message (You've already purchased a VIP ticket!)", async () => {
        const expectedError = "You've already purchased a VIP ticket!";
        
        // buy 1 VIP ticket
        await ticketVIP.buyTicket(
            {from: accounts[0], value: ticketVIPPrice, gas: 100000}
        );

        // try to upgrade a regular ticket (which you don't have)
        try {
            await ticketVIP.upgradeTicket(
                {from: accounts[0], value: ticketUpgradePrice, gas: 100000}
            );
        } catch(error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // try to upgrade a ticket without the right amount of money
    it("should throw an error message (Not enough money!)", async () => {
        const expectedError = "Not enough money!";
        
        // buy 1 regular ticket 
        await ticket.buyTicket(
            {from: accounts[0], value: ticketPrice, gas: 100000}
        );

        // try to upgrade using less money
        try {
            await ticketVIP.upgradeTicket(
                {from: accounts[0], value: web3.utils.toWei('0.002', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
        
        // try to upgrade using more money
        try {
            await ticketVIP.upgradeTicket(
                {from: accounts[0], value: web3.utils.toWei('0.008', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // try to upgrade a ticket without owning a regular ticket
    it("should throw an error message (You don't have a regular ticket!)", async () => {
        const expectedError = "You don't have a regular ticket!";
        
        // try to upgrade your non-existent ticket
        try {
            await ticketVIP.upgradeTicket(
                {from: accounts[0], value: ticketUpgradePrice, gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // test if the user can upgrade their regular ticket successfully
    it("should upgrade their ticket)", async () => {
        let expectedHasTicket = true;
        let expectedBalance = ticketUpgradePrice;
        let hasTicket;
        let currentBalance;

        // buy 1 regular ticket
        await ticket.buyTicket(
            {from: accounts[0], value: ticketPrice, gas: 100000}
        );

        // upgrade your regular ticket
        await ticketVIP.upgradeTicket(
            {from: accounts[0], value: ticketUpgradePrice, gas: 100000}
        );

        // verify ticket and get contract balance
        hasTicket = await ticketVIP.verifyTicket({from: accounts[0]});
        currentBalance = await web3.eth.getBalance(ticketVIP.address);

        assert.equal(hasTicket, expectedHasTicket, "account[0] should own a ticket");
        assert.equal(currentBalance, expectedBalance, "contract should have 0.0029 ETH");
    });
});