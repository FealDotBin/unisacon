var Ticket = artifacts.require("Ticket");
var TicketVIP = artifacts.require("TicketVIP");

module.exports = async function(deployer) {
  await deployer.deploy(Ticket, 'Ticket', 'tickets', '1');
  await deployer.deploy(TicketVIP, 'TicketVIP', 'ticketsVIP', '2');

  var ticket = await Ticket.deployed();
  var ticketVIP = await TicketVIP.deployed();
  ticket.setTicketVIP(ticketVIP.address);
  ticketVIP.setTicket(ticket.address);
};
