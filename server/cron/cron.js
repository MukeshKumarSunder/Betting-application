import { Bets } from '../../imports/api/bets/bets.js';

SyncedCron.add({
  name: 'Check bets and take action',
  schedule: function(parser) {
    return parser.text('every 1 hour on the first min');
  },
  job: function() {
    CheckBets();
    return true;
  }
});

// starting the cron job

SyncedCron.start();

CheckBets = function(){

  /*
    1. Check for Status Open and if now > StartTime call processRefund

    2. If status is inflight and now > endTime

      a. call rest service to get winnerasset
      b. call transfer
      c. send emails
  */
  let now = new Date();
  
  let openBets = Bets.find({ $and: [ { status: 'open' }, { start: { $lte: now } }  ] }).fetch();

  console.log("openBets: ", openBets);

  openBets.forEach(function (bet) {
    
    Bets.update({ _id: bet._id }, { $set: { status: 'expired' } });

    // call  refund function from d3
  });

  /*
    2. If status is inflight and now > endTime

      a. call rest service to get winnerasset
      b. call transfer
      c. send emails
  */
  let completedBets = Bets.find({ $and: [ { status: 'inflight' }, { end: { $lte: now } }  ] }).fetch();

  console.log("completedBets: ", completedBets);

  completedBets.forEach(function (bet) {
    
    

    // call rest service to get winner asset

    /*
      args: 

        duration: {
          start: MM/DD/YY HH:mm,
          end: MM/DD/YY HH:mm
        },
        assets: [ BTC, UTC ]
    */

    let duration = {
      start: moment(bet.start).format('MM/DD/YY HH:mm'),
      end: moment(bet.end).format('MM/DD/YY HH:mm')
    }

    let assets = [];
    assets.push(bet.better1Asset);
    assets.push(bet.better2Asset);

    console.log(assets, duration);
    let res = Meteor.call('getPriceDetails', assets, duration);
    console.log(res);

    let payw = Meteor.call('WinnerPay',bet.uniqueId,bet.name);
    console.log(payw);

    if( res.type === "error"){
      
      //call refund function from d3,
      Bets.update({ _id: bet._id }, { $set: { status: 'expired', reason: res.reason } });

    }else{

      Bets.update({ _id: bet._id }, { $set: { status: 'expired' } });

      // call transer from d3

      //send emails

    }


  });
}