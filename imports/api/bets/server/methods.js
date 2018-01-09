import { Bets } from '../bets.js'
import Web3 from 'web3';


 web3 = new Web3();
 
contractAddress = "0xD36c5BF63ff7E0eAF7668767CBa1143653D7eC93"
ABIArray = [{"constant":false,"inputs":[],"name":"killContract","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_NameA","type":"string"},{"name":"_StockName","type":"string"},{"name":"_startTimeinUnix","type":"uint256"},{"name":"_endTimeinUnix","type":"uint256"},{"name":"_ID","type":"bytes32"}],"name":"NewBet","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"},{"name":"_NameB","type":"string"},{"name":"_StockName","type":"string"}],"name":"JoinBet","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"},{"name":"_winningStock","type":"string"}],"name":"PayWinner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_ID","type":"bytes32"}],"name":"displayBet","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_a","type":"string"},{"name":"_b","type":"string"}],"name":"strCompare","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[],"name":"ContractDeployed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"BetInitiator","type":"address"},{"indexed":false,"name":"IChoose","type":"string"},{"indexed":false,"name":"Betamount","type":"uint256"}],"name":"BetInitiated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"IJoined","type":"address"},{"indexed":false,"name":"IChoose","type":"string"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"BetJoined","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Winner","type":"address"},{"indexed":false,"name":"YourStock","type":"string"}],"name":"YouWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"TransferAmount","type":"uint256"}],"name":"MoneyTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Winnings","type":"uint256"}],"name":"WonAmount","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ID","type":"bytes32"}],"name":"YourID","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ID","type":"bytes32"},{"indexed":false,"name":"Amount","type":"uint256"}],"name":"TotalAmountInBet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"Amount","type":"uint256"}],"name":"TotalContractAmount","type":"event"},{"anonymous":false,"inputs":[],"name":"ContractKilled","type":"event"},{"anonymous":false,"inputs":[],"name":"BetCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"now","type":"uint256"},{"indexed":false,"name":"StartTime","type":"uint256"},{"indexed":false,"name":"EndTime","type":"uint256"}],"name":"TimeStator","type":"event"},{"anonymous":false,"inputs":[],"name":"NoOneWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bettorA","type":"address"},{"indexed":false,"name":"bettorB","type":"address"}],"name":"BettorAddresses","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"NameA","type":"string"},{"indexed":false,"name":"NameB","type":"string"}],"name":"BettorNames","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"StockNameA","type":"string"},{"indexed":false,"name":"StockNameB","type":"string"}],"name":"BettorStocks","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"StartTime","type":"uint256"},{"indexed":false,"name":"EndTime","type":"uint256"}],"name":"BetTime","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"winner","type":"address"},{"indexed":false,"name":"winningStock","type":"string"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"winnerName","type":"string"}],"name":"BetResult","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"betcompleted","type":"bool"},{"indexed":false,"name":"winnerPaid","type":"bool"}],"name":"BetMiscDetails","type":"event"}]
fromAddress = "0xcDBdC768A621aa3343832fFD44A2b444cfe4b527"
//fromAddress2 = "0x68632053d86a0A60cae3607018A965597d3DFCaD"
myContract = web3.eth.contract(ABIArray).at(contractAddress); // only a general declaration. can be more than 1 contract with the same ABI array. So use contract address


ArrUnique = function (value, index, self) { 
  return self.indexOf(value) === index;
}

Meteor.methods({
  'bets.create': function (obj) {
    check(obj, {
      name: String,
      email: String,
      asset: String,
      start: Date,
      end: Date,
      amount:String
    });

    let rec = {
      better1Info: {
        name: obj.name,
        email: obj.email,
        asset: obj.asset
      },
      start: obj.start,
      end: obj.end,
      amount: obj.amount,
      better1Address: obj.email,
      better1Asset: obj.asset
    }

    _.extend(rec, { createdAt: new Date(), status: 'open', uniqueId: Random.id() });
    Bets.insert(rec);

    return true;
  },
  placeBet: function(obj, uniqueId){
    check(obj, {
      name: String,
      email: String,
      asset: String
    });
    check(uniqueId, String);

    let res = Bets.findOne({ uniqueId: uniqueId });

    if( res ){
      
      if( res.status !== "open"){
        throw new Meteor.Error(404,"This bet is closed.");
        return;  
      }else if( res.better1Address === obj.email ){
        throw new Meteor.Error(404,"You cannot bet on your own bet.");
        return;
      }
      else{
        Bets.update({ uniqueId: uniqueId }, { $set: { better2Info: obj, better2Address: obj.email, better2Asset: obj.asset, status: "inflight" } });
        return true;
      }

    }else{
      throw new Meteor.Error(404,"Something went wrong. Please try again.");
      return;
    }

  },
  'bets.remove': function(){
    Bets.remove({});
  },
  getPriceDetails: function (assetNames, duration) {

    check(assetNames, Array);
    check(duration, Object);
    /*
      duration: {
        start: MM/DD/YY HH:mm,
        end: MM/DD/YY HH:mm
      },
      assets: [ BTC, UTC ]
    */

    // check for args
    if( !assetNames || assetNames.length <= 0 || !duration || !duration.start || !duration.end ){

      console.log('Both asset name and duration are compulsory.');
      throw new Meteor.Error(404,"Both asset name and duration are compulsory.");
      return;

    }

    var start = duration.start;
    var end = duration.end;

    //checking dates are in MM/DD/YY HH:mm format
    if( moment(start, "MM/DD/YY HH:mm").format('MM/DD/YY HH:mm') !== start ||
        moment(end, "MM/DD/YY HH:mm").format('MM/DD/YY HH:mm') !== end ){

      throw new Meteor.Error(404,"Dates should be in MM/DD/YY HH:mm format");
      return;

    }

    // If start is after end throws error
    if( moment(start, "MM/DD/YY HH:mm").isAfter( moment(end, "MM/DD/YY HH:mm") )  ){

      throw new Meteor.Error(404,"Start time should be before end time.");
      return;
    }

    // If end is after now
    if( moment().isBefore( moment(end, "MM/DD/YY HH:mm") )  ){

      throw new Meteor.Error(404,"End time should be before current time.");
      return;
    }

    // get pricing from rest end point
    var res = getPrice(assetNames, duration);

    if( res.name === 'Error'){

      return {
        type: "error",
        reason: "We don't have information about "+res.names+". Please edit input and resubmit"
      };
    }else{
      return {
        type: "success",
        name: res.name,
        gain: res.gain
      };

    }
  },  // End of getPriceDetails

  WinnerPay: function(uniqueId, asset) {
 

  iden = uniqueId;
  ass = asset;
  myContract.PayWinner(
        iden,ass,function(err,address) {
          if(!err)
            console.log(address);});
  return ("paid successfully");
} // End of WinnerPay

});



var getPrice = function(assetNames, duration){

  // Rest call
  
  var startData = [], endData = [];

  var hasError = [];

  assetNames.forEach(function (a_name) {
    
    var startUnix = moment(duration.start, "MM/DD/YY HH:mm").unix();

    var startURL = "https://www.cryptocompare.com/api/data/pricehistorical?fsym="+a_name+"&tsyms=USD&ts="+startUnix;
    var start_resp = HTTP.get(startURL);
    // console.log(start_resp);

    var startPrice = undefined;

    if( start_resp.statusCode === 200 ){

      var start_content = start_resp.content;

      start_content = JSON.parse(start_content);

      if( start_content && start_content.Data && start_content.Data[0]){

        startPrice = Number(start_content.Data[0].Price);
      }else{
        hasError.push(a_name);
      }
    }else{
      hasError.push(a_name);
    }
    
    var endUnix = moment(duration.end, "MM/DD/YY HH:mm").unix();

    var startURL = "https://www.cryptocompare.com/api/data/pricehistorical?fsym="+a_name+"&tsyms=USD&ts="+endUnix;
    var end_resp = HTTP.get(startURL);
    // console.log(end_resp);
    
    var endPrice = undefined;

    if( end_resp.statusCode === 200 ){

      var end_content = end_resp.content;
      end_content = JSON.parse(end_content);
      if( end_content && end_content.Data && end_content.Data[0]){

        endPrice = Number(end_content.Data[0].Price);
      }else{
        hasError.push(a_name);
      }
    }else{
      hasError.push(a_name);
    }


    if( startPrice && endPrice){
      
      startData.push({
        name: a_name,
        price: startPrice
      })

      endData.push({
        name: a_name,
        price: endPrice
      })
    }
  });
  
  
  /*

  // Generating random values
  
  assetNames.forEach(function (assetName) {
    
    var obj = {};
    obj.name = assetName;
    obj.gain = Math.floor(Math.random() * 10) + 1;

    startData.push(obj);

  });

  
  assetNames.forEach(function (assetName) {
    
    var obj = {};
    obj.name = assetName;
    obj.gain = Math.floor(Math.random() * 10) + 1;

    endData.push(obj);

  });
  */
  if( hasError && hasError.length > 0){

    var names = hasError.filter(ArrUnique);
    names = names.join(", ");
    return{
      name: 'Error',
      names: names
    }
  }
  var allData = [];

  assetNames.forEach(function (name) {
    
    var startObj = startData.find(function(l){
      return l.name === name;
    })

    var endObj = endData.find(function(l){
      return l.name === name;
    })

    var val = endObj.price - startObj.price;

    var gain = val/startObj.price;

    gain = Number(gain * 100).toFixed(3);

    console.log(name, "Changed from", startObj.price, " to ", endObj.price, " by ", gain);
    var newObj = {
      name: name,
      gain: gain 
    }

    allData.push(newObj)
  });

  function compare(a,b) {
    if (a.gain > b.gain)
      return -1;
    if (a.gain < b.gain)
      return 1;
    return 0;
  }

  var sortedObjs = allData.sort(compare);

  return sortedObjs[0];

}