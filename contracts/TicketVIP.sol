// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/Ticket.sol";

contract TicketVIP is ERC20 {

    address owner;
    Ticket ticket;
    uint256 private ticketPrice = 5900000000000000; // 0.0059 ETH in Wei
    uint256 private upgradePrice = 2900000000000000; // 0.0029 ETH in Wei

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply) ERC20(name, symbol) {
        _mint(address(this), initialSupply);
        owner = msg.sender;
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function setTicket(address ticketAddress) external {
        require(owner == msg.sender);
        ticket = Ticket(ticketAddress);
    }

    function buyTicket() external payable {
        require(msg.sender == tx.origin, "Only EOA can call function!");

        // check if there are any tickets left
        require(balanceOf(address(this)) > 0, "No tickets left!");
        
        // check if the sender has already purchased a VIP ticket
        require(balanceOf(msg.sender) == 0, "You've already purchased a VIP ticket!");

        // check if the sender has already purchased a ticket
        require(!ticket.verifyTicket(msg.sender), "You've already purchased a ticket!");

        // check if sender has enough money
        require(msg.value == ticketPrice, "Not enough money!"); 
        
        // transfer the ticket to the sender
        _transfer(address(this), msg.sender, 1);
    }

    function upgradeTicket() external payable {
        require(msg.sender == tx.origin, "Only EOA can call function!");

        // check if there are any tickets left
        require(balanceOf(address(this)) > 0, "No tickets left!");
        
        // check if the sender has already purchased a VIP ticket
        require(balanceOf(msg.sender) == 0, "You've already purchased a VIP ticket!");
    
        // check if sender has enough money
        require(msg.value == upgradePrice, "Not enough money!");

        // check if the sender owns a regular ticket.
        require(ticket.verifyTicket(msg.sender), "You don't have a regular ticket!");

        // give back the regular ticket to the Ticket.sol contract
        ticket.giveBackTicket(msg.sender);

        // transfer the ticket to the sender
        _transfer(address(this), msg.sender, 1);
    }

    function verifyTicket(address _address) external view returns (bool) {
        return balanceOf(_address) == 1;
    }
    
}