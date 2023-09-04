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
        require(msg.sender == tx.origin, "Only EOA can call function!");

        // check if there are any tickets left
        require(balanceOf(address(this)) > 0, "No tickets left!");
        
        // check if the sender has already purchased a ticket
        require(balanceOf(msg.sender) == 0, "You've already purchased a ticket!");

        // check if the sender has already purchased a VIP ticket
        require(!ticketVIP.verifyTicket(msg.sender), "You've already purchased a VIP ticket!");

        // check if sender has enough money
        require(msg.value == ticketPrice, "Not enough money!"); 

        // transfer the ticket to the sender
        _transfer(address(this), msg.sender, 1);
    }

    function giveBackTicket(address _address) external {
        require(msg.sender == address(ticketVIP)); // only ticketVIP contract can call this function

        // check if _address owns a ticket
        require(balanceOf(_address) != 0, "You don't own any ticket!");

        // give back the ticket to the contract
        _transfer(_address, address(this), 1);
    }

    function verifyTicket(address _address) external view returns (bool) {
        require(msg.sender == address(ticketVIP) || msg.sender == _address); // only ticketVIP contract or _address can call this function

        return balanceOf(_address) == 1;
    }

}