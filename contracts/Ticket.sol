// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/TicketVIP.sol";

contract Ticket is ERC20 {

    address private owner;
    TicketVIP ticketVIP;
    uint256 private ticketPrice = 3000000000000000; // 0.0030 ETH in Wei
    
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

    function setTicketVIP(address ticketVIPAddress) external {
        require(msg.sender == owner);
        ticketVIP = TicketVIP(ticketVIPAddress);
    }

    function buyTicket() payable external {
        // check if there are any tickets left
        require(balanceOf(address(this)) > 0, "No tickets left!");
        
        // check if the sender has already purchased a ticket
        require(balanceOf(tx.origin) == 0, "You've already purchased a ticket!");

        // check if the sender has already purchased a VIP ticket
        require(!ticketVIP.verifyTicket(), "You've already purchased a VIP ticket!");

        // check if sender has enough money
        require(msg.value == ticketPrice, "Not enough money!"); 

        // transfer the ticket to the sender
        _transfer(address(this), tx.origin, 1);
    }

    function giveBackTicket() external {
        // check if the sender owns a ticket
        require(balanceOf(tx.origin) != 0, "You don't own any ticket!");

        // give back the ticket to the contract
        _transfer(tx.origin, address(this), 1);
    }

    function verifyTicket() external view returns (bool) {
        return balanceOf(tx.origin) == 1;
    }

}