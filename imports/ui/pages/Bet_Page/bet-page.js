import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { isChrome } from '../../helpers/functions.js';
import { Bets } from '../../../api/bets/bets.js';

var iden;
contractAddress = "0xD36c5BF63ff7E0eAF7668767CBa1143653D7eC93"
ABIArray = [{"constant":false,"inputs":[],"name":"killContract","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_NameA","type":"string"},{"name":"_StockName","type":"string"},{"name":"_startTimeinUnix","type":"uint256"},{"name":"_endTimeinUnix","type":"uint256"},{"name":"_ID","type":"bytes32"}],"name":"NewBet","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"},{"name":"_NameB","type":"string"},{"name":"_StockName","type":"string"}],"name":"JoinBet","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"},{"name":"_winningStock","type":"string"}],"name":"PayWinner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"}],"name":"displayBet","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_a","type":"string"},{"name":"_b","type":"string"}],"name":"strCompare","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[],"name":"ContractDeployed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"BetInitiator","type":"address"},{"indexed":false,"name":"IChoose","type":"string"},{"indexed":false,"name":"Betamount","type":"uint256"}],"name":"BetInitiated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"IJoined","type":"address"},{"indexed":false,"name":"IChoose","type":"string"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"BetJoined","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Winner","type":"address"},{"indexed":false,"name":"YourStock","type":"string"}],"name":"YouWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"TransferAmount","type":"uint256"}],"name":"MoneyTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Winnings","type":"uint256"}],"name":"WonAmount","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ID","type":"bytes32"}],"name":"YourID","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ID","type":"bytes32"},{"indexed":false,"name":"Amount","type":"uint256"}],"name":"TotalAmountInBet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Amount","type":"uint256"}],"name":"TotalContractAmount","type":"event"},{"anonymous":false,"inputs":[],"name":"ContractKilled","type":"event"},{"anonymous":false,"inputs":[],"name":"BetCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"now","type":"uint256"},{"indexed":false,"name":"StartTime","type":"uint256"},{"indexed":false,"name":"EndTime","type":"uint256"}],"name":"TimeStator","type":"event"},{"anonymous":false,"inputs":[],"name":"NoOneWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bettorA","type":"address"},{"indexed":false,"name":"bettorB","type":"address"}],"name":"BettorAddresses","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"NameA","type":"string"},{"indexed":false,"name":"NameB","type":"string"}],"name":"BettorNames","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"StockNameA","type":"string"},{"indexed":false,"name":"StockNameB","type":"string"}],"name":"BettorStocks","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"StartTime","type":"uint256"},{"indexed":false,"name":"EndTime","type":"uint256"}],"name":"BetTime","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"winner","type":"address"},{"indexed":false,"name":"winningStock","type":"string"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"winnerName","type":"string"}],"name":"BetResult","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"betcompleted","type":"bool"},{"indexed":false,"name":"winnerPaid","type":"bool"}],"name":"BetMiscDetails","type":"event"}]
//fromAddress = "0xcDBdC768A621aa3343832fFD44A2b444cfe4b527"
//fromAddress2 = "0xC187B70fFedF7D9C87Fca021875858fb95993b5B"
myContract = web3.eth.contract(ABIArray).at(contractAddress); // only a general declaration. can be more than 1 contract with the same ABI array. So use contract address
var val;


Template.Bet_Page.onCreated(function appHomeOnCreated(){
  const tpl = this;
  tpl.dataDict = new ReactiveDict();

  tpl.subscribe('betInfo', FlowRouter.getParam('_id'));
});

Template.Bet_Page.helpers({
  betInfo: function(){
    let res = Bets.findOne({ uniqueId: FlowRouter.getParam("_id") });

    return res;
  },
  assets: function(){
    let assets = [ "BTC", "USD", "GBP" ,"ETH", "LTC", "ZEC", "DASH", "XRP", "XMR", "SLR"];
    
    let res = Bets.findOne({ uniqueId: FlowRouter.getParam("_id") });

    if( res && res.better1Asset ){

      assets = assets.filter( item => item !== res.better1Asset )
      
    }

    return assets;

  }
});

Template.Bet_Page.onRendered(function appHomeOnRendered() {
  

});

Template.Bet_Page.events({
  'submit #place-bet-form': function (e, t) {
    e.preventDefault();

    let allGood = true;

    let obj = {};
    
    obj.name = t.$("#name").val();
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
    if( !obj.asset || !obj.asset.trim()){
      toastr.error("Please select asset", "Error");
      allGood = false;
    }


    if( allGood ){

      t.$(".submit-btn").addClass('loading');


      Meteor.call('placeBet', obj, FlowRouter.getParam('_id'), function (error, result) {
        t.$(".submit-btn").removeClass('loading');
        if(error){
          toastr.error(error.reason);
        }else{
          toastr.success("Bet Placed.", "Success");

        //  iden++;

            FlowRouter.go("/");
        } // else construct
      }); // callback function and meteor.call
      
      val = t.$('#amount').val();
      iden = FlowRouter.getParam('_id');

      myContract.JoinBet.sendTransaction(
          iden,obj.name,obj.asset,{
             to:contractAddress,
             value: val * 1000000000000000000},
          function(err,address) {
             if(!err)
             console.log(address);});

    } // allGood construct

  }
});

Template.Bet_Page.onDestroyed(() => {

});
