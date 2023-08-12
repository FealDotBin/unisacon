App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.ajaxSetup({
      async: false
    });
    
    $.getJSON('Ticket.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var TicketArtifact = data;
      App.contracts.Ticket = TruffleContract(TicketArtifact);

      // Set the provider for our contract.
      App.contracts.Ticket.setProvider(App.web3Provider);
    });

    $.getJSON('TicketVIP.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var TicketVIPArtifact = data;
      App.contracts.TicketVIP = TruffleContract(TicketVIPArtifact);

      // Set the provider for our contract.
      App.contracts.TicketVIP.setProvider(App.web3Provider);
    });

    $.ajaxSetup({
      async: true
    });

    App.getTicket();

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#buy-ticket-button', App.handleBuyTicket);
    $(document).on('click', '#buy-ticket-vip-button', App.handleBuyTicketVIP);
    $(document).on('click', '#upgrade-ticket-button', App.handleUpgradeTicket);
  },

  handleBuyTicket: function(event) {
    event.preventDefault();

    var TicketInstance;
    var TicketVIPInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Ticket.deployed().then(function(instance) {
        TicketInstance = instance;
        
        App.contracts.TicketVIP.deployed().then(function(instance) {
          TicketVIPInstance = instance;
  
          return TicketInstance.buyTicket(TicketVIPInstance.address, {from: account, 
            value: web3.toWei('0.003', 'ether'),
            gas: 100000});
        }).then(function(result) {
          alert('Purchase Successful!');
          return App.getTicket();
        }).catch(function(err) {
          console.log(err.message);
        });

      }).catch(function(err) {
        console.log(err.message);
      });
    });

      
  },

  handleBuyTicketVIP: function(event) {
    event.preventDefault();

    var TicketInstance;
    var TicketVIPInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Ticket.deployed().then(function(instance) {
        TicketInstance = instance;
        
        App.contracts.TicketVIP.deployed().then(function(instance) {
          TicketVIPInstance = instance;
  
          return TicketVIPInstance.buyTicket(TicketInstance.address, {from: account, 
            value: web3.toWei('0.0059', 'ether'),
            gas: 100000});
        }).then(function(result) {
          alert('Purchase Successful!');
          return App.getTicket();
        }).catch(function(err) {
          console.log(err.message);
        });

      }).catch(function(err) {
        console.log(err.message);
      });
    });

  },

  handleUpgradeTicket: function(event) {
    event.preventDefault();

    var TicketInstance;
    var TicketVIPInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Ticket.deployed().then(function(instance) {
        TicketInstance = instance;
        
        App.contracts.TicketVIP.deployed().then(function(instance) {
          TicketVIPInstance = instance;
  
          return TicketVIPInstance.upgradeTicket(TicketInstance.address, {from: account, 
            value: web3.toWei('0.0029', 'ether'),
            gas: 100000});
        }).then(function(result) {
          alert('Purchase Successful!');
          return App.getTicket();
        }).catch(function(err) {
          console.log(err.message);
        });

      }).catch(function(err) {
        console.log(err.message);
      });
    });

  },

  getTicket: function() {
    console.log('Getting ticket...');

    var TicketInstance;
    var TicketVIPInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      // check if user has purchased regular ticket
      App.contracts.Ticket.deployed().then(function(instance) {
        TicketInstance = instance;

        return TicketInstance.verifyTicket({from: account});
      }).then(function(result) {
        if(result) {
          $('#ticket-image').attr('src', 'img/ticket-regular.png');
          $('#buy-ticket-button').hide();
          $('#buy-ticket-vip-button').hide();
          $('#upgrade-ticket-button').show();
          $('#ticket-description').text('1x Regular ticket');
        }
      }).catch(function(err) {
        console.log(err.message);
      });

      // check if user has purchased VIP ticket
      App.contracts.TicketVIP.deployed().then(function(instance) {
        TicketVIPInstance = instance;

        return TicketVIPInstance.verifyTicket({from: account});
      }).then(function(result) {
        if(result) {
          $('#ticket-image').attr('src', 'img/ticket-vip.png');
          $('#buy-ticket-button').hide();
          $('#buy-ticket-vip-button').hide();
          $('#upgrade-ticket-button').hide();
          $('#ticket-description').text('1x VIP ticket');
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
  
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
