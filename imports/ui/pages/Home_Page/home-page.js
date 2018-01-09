import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { isChrome } from '../../helpers/functions.js';
import { Bets } from '../../../api/bets/bets.js';
import lightwallet from '../../../lib/lightwallet.js'
import Web3 from 'web3';
import async from 'async';
import HookedWeb3Provider from 'hooked-web3-provider';

contractAddress = "0xD36c5BF63ff7E0eAF7668767CBa1143653D7eC93"
ABIArray = [{"constant":false,"inputs":[],"name":"killContract","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_NameA","type":"string"},{"name":"_StockName","type":"string"},{"name":"_startTimeinUnix","type":"uint256"},{"name":"_endTimeinUnix","type":"uint256"},{"name":"_ID","type":"bytes32"}],"name":"NewBet","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"},{"name":"_NameB","type":"string"},{"name":"_StockName","type":"string"}],"name":"JoinBet","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"},{"name":"_winningStock","type":"string"}],"name":"PayWinner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"}],"name":"displayBet","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_a","type":"string"},{"name":"_b","type":"string"}],"name":"strCompare","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[],"name":"ContractDeployed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"BetInitiator","type":"address"},{"indexed":false,"name":"IChoose","type":"string"},{"indexed":false,"name":"Betamount","type":"uint256"}],"name":"BetInitiated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"IJoined","type":"address"},{"indexed":false,"name":"IChoose","type":"string"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"BetJoined","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Winner","type":"address"},{"indexed":false,"name":"YourStock","type":"string"}],"name":"YouWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"TransferAmount","type":"uint256"}],"name":"MoneyTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Winnings","type":"uint256"}],"name":"WonAmount","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ID","type":"bytes32"}],"name":"YourID","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ID","type":"bytes32"},{"indexed":false,"name":"Amount","type":"uint256"}],"name":"TotalAmountInBet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Amount","type":"uint256"}],"name":"TotalContractAmount","type":"event"},{"anonymous":false,"inputs":[],"name":"ContractKilled","type":"event"},{"anonymous":false,"inputs":[],"name":"BetCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"now","type":"uint256"},{"indexed":false,"name":"StartTime","type":"uint256"},{"indexed":false,"name":"EndTime","type":"uint256"}],"name":"TimeStator","type":"event"},{"anonymous":false,"inputs":[],"name":"NoOneWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bettorA","type":"address"},{"indexed":false,"name":"bettorB","type":"address"}],"name":"BettorAddresses","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"NameA","type":"string"},{"indexed":false,"name":"NameB","type":"string"}],"name":"BettorNames","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"StockNameA","type":"string"},{"indexed":false,"name":"StockNameB","type":"string"}],"name":"BettorStocks","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"StartTime","type":"uint256"},{"indexed":false,"name":"EndTime","type":"uint256"}],"name":"BetTime","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"winner","type":"address"},{"indexed":false,"name":"winningStock","type":"string"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"winnerName","type":"string"}],"name":"BetResult","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"betcompleted","type":"bool"},{"indexed":false,"name":"winnerPaid","type":"bool"}],"name":"BetMiscDetails","type":"event"}]
//fromAddress = "0xcDBdC768A621aa3343832fFD44A2b444cfe4b527"
//fromAddress2 = "0x68632053d86a0A60cae3607018A965597d3DFCaD"
myContract = web3.eth.contract(ABIArray).at(contractAddress); // only a general declaration. can be more than 1 contract with the same ABI array. So use contract address
//window.name = "false";


var recentBet;
var name1;
var stock1;
var iden;
var stime;
var etime;
var val;
var gktest;
//var fromAddress;
//var flag =0;
//var lock;
//var dummyend;

Template.Home_Page.onCreated(function appHomeOnCreated(){
  web3 = new Web3();
 // window.name="true";
  const tpl = this;
  tpl.dataDict = new ReactiveDict();
  
  // Defaults
  tpl.dataDict.set('walletSeed', undefined);
  tpl.dataDict.set('walletAddress', undefined);

  tpl.subscribe('openBets');

});

Template.Home_Page.helpers({

  openBets() {
    const bets = Bets.find().fetch();
/*
    if (typeof(Storage) !== "undefined") {
      sessionStorage.uiden = "abc123";
      console.log("uniqueId retrieved from sessionStorage variable in home-page.js: ",sessionStorage.uiden);
    } else 
      console.log("Sorry! No Web Storage support..");
  
  */


    //console.log(bets);
    //dummyend = bets[bets.length-1].better1Address;
    console.log("Control inside the helper. Window.Name value: ",window.name);
    if(window.name == "true")
    {
      
      recentBet = bets[0];
      name1 = recentBet.better1Info.name;
      stock1 = recentBet.better1Info.asset;
      iden = recentBet.uniqueId;
      stime = (recentBet.start.getTime())/1000;
      etime = (recentBet.end.getTime())/1000;
      val = recentBet.amount;

      
      console.log("Window name: ",window.name);
      console.log("Name1: ",name1," Stock1: ",stock1," UniqueID: ",iden," STime: ",stime," ETime: ",etime," Amount: ",val);


      window.name = "false";
        console.log("Calling the send transaction function");
        myContract.NewBet.sendTransaction(
        name1,stock1,stime,etime,iden,{
          to: contractAddress,
         // from: t.dataDict.get('walletAddress'),
          value:val * 1000000000000000000},
        function(err,address) {
          if(!err)
            console.log("Bet Placed Successfully at: ",address);
          else
            console.log("Error: ",err);
    });
      //console.log("dummyend : ",dummyend);
      console.log("Finished Calling the send transaction function");

      console.log("Made the window.name as false: ", window.name);
            
      
    }
    
    return bets;
  },
  walletSeed() {
    const t = Template.instance();

    //console.log("In wallet Seed method");
    return t.dataDict.get('walletSeed');
  },
  walletAddress() {
    const t = Template.instance();

    //console.log("In wallet Address method");
    return t.dataDict.get('walletAddress');
  }
});

Template.Home_Page.onRendered(function appHomeOnRendered() {

  console.log(HookedWeb3Provider);
  if( !isChrome() ){
    $('.dimmer').dimmer('show');
  }


  let today = new Date(); // Returns today's date and time
  
  let startTime = new Date(new Date().getTime() + (24 * 60 * 60 * 1000)); // Min start date is 1 day from today

  //getHours() : Returns the hour in the specified date according to local time.
  //getTime() : Returns the numeric value of the specified date as the number of milliseconds since January 1, 1970, 00:00:00 UTC.

  //rounding to nearest hour
  startTime.setHours(startTime.getHours() + Math.round(startTime.getMinutes()/60));
  startTime.setMinutes(0);


  $('#startTime').calendar({
    disableMinute: true,
    minDate: startTime
  });

  $('#endTime').calendar({
    disableMinute: true,
    minDate: new Date( startTime.getTime() + (24 * 60 * 60 * 1000) )  // Min end time is 1 day after the start date
  });

});

Template.Home_Page.events({
  'click #generateWalletModal': (e, t) => {
    $("#GenerateWallet").modal({
      onApprove: function () {
        newWallet(t);
        return false;
      }
    }).modal('show');
  },
  'click #restoreWalletModal': (e, t) => {
    $("#RestoreWallet").modal({
      onApprove: function () {
        setSeed(t);
        return false;
      }
    }).modal('show');
  },
  'submit #place-bet-form': function (e, t) {
    //const tpl = this;
    //tpl.subscribe('openBets');
    
    e.preventDefault();

    let allGood = true;

    let obj = {};
    
    obj.name = t.$("#name").val();
    name1 = obj.name;
    if( !obj.name || !obj.name.trim() || obj.name.length < 6){
      toastr.error("Name should be atleast 6 characters", "Error");
      allGood = false;
    }

    obj.email = t.$("#email").val();
    if( !obj.email || !obj.email.trim() || !validEmail(obj.email)){
      toastr.error("Invalid Email", "Error");
      allGood = false;
    }

    obj.asset = t.$("#asset").val();
    stock1 = obj.asset;
    if( !obj.asset || !obj.asset.trim()){
      toastr.error("Please select asset", "Error");
      allGood = false;
    }

    obj.start = t.$('#startTime').calendar('get date');
    stime = (obj.start.getTime())/1000;
    if( !obj.start){
      toastr.error("Please select start time", "Error");
      allGood = false;
    }

    obj.end = t.$('#endTime').calendar('get date');
    etime = (obj.end.getTime())/1000;
    if( !obj.end){
      toastr.error("Please select end time", "Error");
      allGood = false;
    }

    obj.amount = t.$('#amount').val();
    val = obj.amount;
    if( !obj.amount || !obj.amount.trim()){
      toastr.error("Please enter amount", "Error");
      allGood = false;
    }

    //obj.fromAddress = t.$('#fromAddress').val();
    //fromAdrs = obj.fromAddress;

    // check end time is greater than start time

    if( obj.start && obj.end ){

      if( obj.start.getTime() >= obj.end.getTime() ){
        toastr.error("End time should be after start time", "Error");
        allGood = false;
      }

    }

    if( allGood ){
     

      t.$(".submit-btn").addClass('loading');

      Meteor.call('bets.create', obj, function (error, result) {
        t.$(".submit-btn").removeClass('loading');
        if(error){
          toastr.error(error.reason);
        }else{
          toastr.success("Bet Placed.", "Success");
          

          FlowRouter.go("/");

          
        }

      });
                //iden = FlowRouter.getParam("_id");

      //iden = Bets[Bets.length-1].uniqueId;

      window.name = "true";
      window.location.reload();

      //document.getElementById("uid").innerHTML = sessionStorage.uiden;
      //console.log("uniqueId retrieved from sessionStorage variable in the button: ",sessionStorage.uiden);

//      temp.set(Bets.find().fetch());
      
      //console.log(temp[0].uniqueId);
     /* myContract.NewBet.sendTransaction(
        name1,stock1,stime,etime,iden,{
          from: fromAddress,
          to: contractAddress,
          value:val},
        function(err,address) {
          if(!err)
            console.log(address);});
*/
    }

  },
});

Template.Home_Page.onDestroyed(() => {
  window.name="true";
});
  
var global_keystore;

const newWallet = function (t) {
  console.log("Called new wallet");
  var extraEntropy = document.getElementById('userEntropy').value;
  document.getElementById('userEntropy').value = '';
  var randomSeed = lightwallet.keystore.generateRandomSeed(extraEntropy);
  
  sessionStorage.rndmseed = randomSeed;
  /*console.log("Random seed: ", randomSeed);
  console.log("Session Storage Random Seed: ",sessionStorage.rndmseed);
*/
  t.dataDict.set('walletSeed', randomSeed);
  var infoString = 'Your new wallet seed is: "' + randomSeed +
    '". Please write it down on paper or in a password manager, you will need it to access your wallet. Do not let anyone see this seed or they can take your Ether. ' +
    'Please enter a password to encrypt your seed while in the browser.'
  // var password = prompt(infoString, 'Password');
  var password = document.getElementById('userPass').value;
  document.getElementById('userPass').value = '';

  lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {

    global_keystore = new lightwallet.keystore(randomSeed,pwDerivedKey);
    //gktest =  new lightwallet.keystore(randomSeed,pwDerivedKey);
  

    //sessionStorage.setItem('gkeystore',JSON.stringify(new lightwallet.keystore(randomSeed,pwDerivedKey)));
    //console.log("Global Key Store set: ",global_keystore);
    //console.log("Global Key Test Store set: ",gktest);
    //gks = sessionStorage.gkeystore;
    //gks = gks.replace("\"Object\":", "\"KeyStore\":");

    //console.log("gks value: ",gks);

    newAddresses(password, t);
    //setWeb3Provider(global_keystore);
    //console.log(testweb3);
    //getBalances();
  })
}

const newAddresses = function(password, t, source) {

  if (password == '') {
    password = prompt('Enter password to retrieve addresses', 'Password');
  }

  var numAddr = 1;

  lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {

    
   // gks = JSON.parse(sessionStorage.gkeystore);
   // console.log("gks: ",gks);
   // global_keystore = gks;
   // console.log("global_keystore: ",global_keystore);
   // gks = gks.replace("\"Object\":", "\"KeyStore\":");
   // gks.generateNewAddress(pwDerivedKey, numAddr);

   // console.log("pwDerivedKey : ", pwDerivedKey);
   // console.log("Password: ",password);
    global_keystore.generateNewAddress(pwDerivedKey, numAddr);

    var addresses = global_keystore.getAddresses();

   // gktest.generateNewAddress(pwDerivedKey, numAddr);
   // var addresstestgk = gktest.getAddresses();
   // console.log("GK Test Address : ", addresstestgk);

    console.log("addresses", addresses);
/*
    // My Code
    if (typeof(Storage) !== "undefined") {
      sessionStorage.newwaladdr = "0x" + addresses[0];
      sessionStorage.pswd = password;
   //   sessionStorage.derivedkey = pwDerivedKey;
      
      console.log("Session Storage Address: ",sessionStorage.newwaladdr);
      console.log("Session Storage Password: ",sessionStorage.pswd);
   //   console.log("Session Storage Derived Key set: ",sessionStorage.derivedkey);
      
      //console.log("Session Storage Global Key Store set: ",gks);
    } else 
      console.log("Sorry! No Web Storage support..");

    // My Code end

*/

    t.dataDict.set('walletAddress', addresses[0]);
    $("#GenerateWallet").modal('hide')

    if (source !== 'restore') {
      $("#ShowWalletDetails").modal('show')  
    }
    // getBalances();
  })
}


const getBalances = function() {
  var addresses = global_keystore.getAddresses();
  //document.getElementById('addr').innerHTML = 'Retrieving addresses...'
  console.log("Retrieving addresses...");
   async.map(addresses, web3.eth.getBalance, function(err, balances) {
    async.map(addresses, web3.eth.getTransactionCount, function(err, nonces) {
     // document.getElementById('addr').innerHTML = ''
      for (var i=0; i<addresses.length; ++i) {
        //document.getElementById('addr').innerHTML += '<div>' + addresses[i] + ' (Bal: ' + (balances[i] / 1.0e18) + ' ETH, Nonce: ' + nonces[i] + ')' + '</div>'
        console.log("Address: ",addresses[i], " Balance: ", (balances[i] / 1.0e18), " ETH, Nonce: ", nonces[i]);
      }
    })
  })
}

const setWeb3Provider = function(keystore) {
  var web3Provider = new HookedWeb3Provider({
    host: "http://localhost:8545",
    transaction_signer: keystore
  });

  web3.setProvider(web3Provider);
  console.log("setWeb3Provider set");
}

const setSeed = function(t) {
  let seed = $("#seed").val();
  let password = $("#seedPassword").val();

  lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {

    global_keystore = new lightwallet.keystore(seed,pwDerivedKey);

    newAddresses(password, t, 'restore');
    setWeb3Provider(global_keystore);

    //getBalances();
  })
}

const sendEth = function(t) {
    var fromAddr = t.dataDict.get('walletAddress');
    var toAddr = '0xa2411d8ab3b28c5c7497d7cbc0efb073eff1d007';
    var valueEth = document.getElementById('amount').value
    var value = parseFloat(valueEth)*1.0e18
    var gasPrice = 50000000000;
    var gas = 50000;
    web3.eth.sendTransaction({from: fromAddr, to: toAddr, value: value, gasPrice: gasPrice, gas: gas}, function (err, txhash) {
      if (err) {
        toastr.error("transaction error", err);
      } else {
        toastr.success('Transaction success', txhash)
      }
      console.log('error: ' + err)
      console.log('txhash: ' + txhash)
    })
  }
