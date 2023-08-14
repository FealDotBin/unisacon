const chai = require('chai');

const Ticket = artifacts.require("Ticket");
const TicketVIP = artifacts.require("TicketVIP");

contract("Test Ticket", (accounts) => {
    let ticket;
    let ticketVIP;

    beforeEach('should setup the contract instance', async () => {
        ticket = await Ticket.new('Ticket', 'tickets', 2);
        ticketVIP = await TicketVIP.new('TicketVIP', 'ticketsVIP', 2);
    });

    // try to buy a ticket out of stock
    it("should throw an error message (No tickets left!)", async () => {
        const expectedError = "No tickets left!";

        await ticket.buyTicket(
            ticketVIP.address,
            {from: accounts[0], value: web3.utils.toWei('0.003', 'ether'), gas: 100000}
        );
        
        await ticket.buyTicket(
            ticketVIP.address,
            {from: accounts[1], value: web3.utils.toWei('0.003', 'ether'), gas: 100000}
        );
        
        try {
            await ticket.buyTicket(
                ticketVIP.address,
                {from: accounts[2], value: web3.utils.toWei('0.003', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }

    });

    // try to buy 2 tickets
    it("should throw an error message (You've already purchased a ticket!)", async () => {
        const expectedError = "You've already purchased a ticket!";

        // buy 1 ticket
        try { 
            await ticket.buyTicket(
                ticketVIP.address,
                {from: accounts[0], value: web3.utils.toWei('0.003', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }

        // buy 1 ticket
        try {
            await ticket.buyTicket(
                ticketVIP.address,
                {from: accounts[0], value: web3.utils.toWei('0.003', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // try to buy a regular ticket, while owning a VIP ticket
    it("should throw an error message (You've already purchased a VIP ticket!)", async () => {
        const expectedError = "You've already purchased a VIP ticket!";
        
        // buy a VIP ticket
        await ticketVIP.buyTicket(
            ticket.address,
            {from: accounts[0], value: web3.utils.toWei('0.0059', 'ether'), gas: 100000}
        );

        // try to buy a regular ticket
        try {
            await ticket.buyTicket(
                ticketVIP.address,
                {from: accounts[0], value: web3.utils.toWei('0.003', 'ether'), gas: 100000}
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
            await ticket.buyTicket(
                ticketVIP.address,
                {from: accounts[0], value: web3.utils.toWei('0.002', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
        
        // try to buy using more money
        try {
            await ticket.buyTicket(
                ticketVIP.address,
                {from: accounts[0], value: web3.utils.toWei('0.004', 'ether'), gas: 100000}
            );
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });

    // test if the user purchase a ticket successfully and the contract has the right balance
    it("should buy a ticket", async () => {
        let expectedHasTicket = true;
        let expectedBalance = web3.utils.toWei('0.003', 'ether');
        let hasTicket;
        let currentBalance;

        // buy 1 ticket
        await ticket.buyTicket(
            ticketVIP.address,
            {from: accounts[0], value: web3.utils.toWei('0.003', 'ether'), gas: 100000}
        );

        // verify ticket and get contract balance
        hasTicket = await ticket.verifyTicket({from: accounts[0]});
        currentBalance = await web3.eth.getBalance(ticket.address);

        assert.equal(hasTicket, expectedHasTicket, "account[0] should own a ticket");
        assert.equal(currentBalance, expectedBalance, "contract should have 0.003 ETH");

    });

    // try to give back a ticket without owning one
    it("should throw an error message (You don't own any ticket!)", async () => {
        const expectedError = "You don't own any ticket!";
        
        // try to give back a ticket without owning one
        try {
            await ticket.giveBackTicket({from: accounts[0]});
        } catch (error) {
            let contained = error.message.includes(expectedError) ? true : undefined;
            chai.should().exist(contained);
        }
    });
    
    // test if the user can give back the ticket successfully
    it("should give back a ticket", async () => {
        let expectedHasTicket = false;
        let hasTicket;

        // buy 1 ticket
        await ticket.buyTicket(
            ticketVIP.address,
            {from: accounts[0], value: web3.utils.toWei('0.003', 'ether'), gas: 100000}
        );

        // give back the ticket
        await ticket.giveBackTicket({from: accounts[0]});

        // verify you don't have the ticket 
        hasTicket = await ticket.verifyTicket({from: accounts[0]});
        assert.equal(hasTicket, expectedHasTicket, "accounts[0] shouldn't own a ticket");

    });
});