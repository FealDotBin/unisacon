// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Ticket.sol";

contract TestTicket {
    // The address of the Ticket contract to be tested
    Ticket ticket = new Ticket('Ticket', 'tickets', 2);
    TicketVIP ticketVIP = new TicketVIP('TicketVIP', 'ticketsVIP', 1);
    Ticket ticketNoTicket = new Ticket('Ticket', 'tickets', 0);

    // Test no ticket purchased
    function testNoTicketPurchased() public {
        bool result = ticket.verifyTicket();

        Assert.equal(false, result, "You shouldn't have purchased any ticket.");
    }

    // Test buy ticket
    function testBuyTicket() public payable {
        ticket.buyTicket{value: 3000000000000000 wei}(address(ticketVIP));
        bool result = ticket.verifyTicket();

        Assert.equal(true, result, "You should own one ticket.");
    }

    // // Test if it returns "Already Purchased" message
    // function testReturnsAlreadyPurchased() public {
    //     (bool success, bytes memory returnData) = address(ticket).call(abi.encodeWithSignature("buyTicket(address)", address(ticketVIP)));
    //     Assert.isFalse(success, "Function should have reverted");

    //     // TODO: msg catching
    //     // (string memory revertReason) = abi.decode(returnData, (string));
    //     // Assert.equal(revertReason, "You've already purchased a ticket!", "Incorrect revert reason");
    // }

    // // test if it returns "no ticket" message
    // function testNoTicket() public {
    //     (bool success, bytes memory returnData) = address(ticketNoTicket).call(abi.encodeWithSignature("buyTicket(address)", address(ticketVIP)));
    //     Assert.isFalse(success, "Function should have reverted");

    //     // TODO: msg catching
    //     // (string memory revertReason) = abi.decode(returnData, (string));
    //     // Assert.equal(revertReason, "No tickets left!", "Incorrect revert reason");
    // }
}