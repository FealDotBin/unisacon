// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/TicketVIP.sol";

contract Ticket is ERC20 {

    uint256 private ticketPrice = 3000000000000000; // 0.0030 ETH in Wei
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply) ERC20(name, symbol) {
        _mint(address(this), initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function buyTicket(address ticketVIPAddress) payable external {
        // check if there is any ticket left
        require(balanceOf(address(this)) > 0, "No tickets left!");
        
        // check if the sender has already purchased a ticket or a VIP ticket
        require(balanceOf(tx.origin) == 0, "You've already purchased a ticket!");
        TicketVIP ticketVIP = TicketVIP(ticketVIPAddress);
        require(!ticketVIP.verifyTicket(), "The sender already owns a VIP ticket!");

        // check if sender has enough money
        //require(msg.value == ticketPrice, "Not enough money!"); 

        // // Transfer the ticket price from sender to the contract and the ticket
        // address payable contractAddress = payable(address(this));
        // contractAddress.transfer(ticketPrice);
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

    // TODO: function to withdraw money
}