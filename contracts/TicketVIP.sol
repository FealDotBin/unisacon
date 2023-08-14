// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/Ticket.sol";

contract TicketVIP is ERC20 {

    uint256 private ticketPrice = 5900000000000000; // 0.0059 ETH in Wei
    uint256 private upgradePrice = 2900000000000000; // 0.0029 ETH in Wei

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply) ERC20(name, symbol) {
        _mint(address(this), initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function buyTicket(address ticketAddress) external payable {
        // check if there are any tickets left
        require(balanceOf(address(this)) > 0, "No tickets left!");
        
        // check if the sender has already purchased a VIP ticket
        require(balanceOf(tx.origin) == 0, "You've already purchased a VIP ticket!");

        // check if the sender has already purchased a ticket
        Ticket ticket = Ticket(ticketAddress);
        require(!ticket.verifyTicket(), "You've already purchased a ticket!");

        // check if sender has enough money
        require(msg.value == ticketPrice, "Not enough money!"); 
        
        // transfer the ticket to the sender
        _transfer(address(this), tx.origin, 1);
    }

    function upgradeTicket(address ticketAddress) external payable {
        // check if there are any tickets left
        require(balanceOf(address(this)) > 0, "No tickets left!");
        
        // check if the sender has already purchased a VIP ticket
        require(balanceOf(tx.origin) == 0, "You've already purchased a VIP ticket!");
    
        // check if sender has enough money
        require(msg.value == upgradePrice, "Not enough money!");

        // check if the sender owns a regular ticket.
        Ticket ticket = Ticket(ticketAddress);
        require(ticket.verifyTicket(), "You don't have a regular ticket!");

        // give back the regular ticket to the Ticket.sol contract
        ticket.giveBackTicket();

        // transfer the ticket to the sender
        _transfer(address(this), tx.origin, 1);
    }

    function verifyTicket() external view returns (bool) {
        return balanceOf(tx.origin) == 1;
    }
    
}