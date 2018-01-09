import { Template } from 'meteor/templating';

import { isChrome } from './functions.js';

Template.registerHelper('isChrome', () => {
  return isChrome();
});

Template.registerHelper('momentFormat', (date, format) => {
  return moment(date).format(format);
});

Template.registerHelper('$eq', (a, b) => {
  return a === b;
});
