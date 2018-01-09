import { Meteor } from 'meteor/meteor';

import { Bets } from '../bets.js';

Meteor.publish('openBets', function () {

  return Bets.find({ }, { sort: { createdAt: -1 } })

});

Meteor.publish('betInfo', function (id) {
  check(id, String);
  return Bets.find({ uniqueId: id });

});