var config = {
  apiKey: "AIzaSyA_xHNarGdwoye8F7LYfp2TRMx_-1-DUec",
  authDomain: "tmpl-884c0.firebaseapp.com",
  databaseURL: "https://tmpl-884c0.firebaseio.com",
  projectId: "tmpl-884c0",
  storageBucket: "tmpl-884c0.appspot.com",
  messagingSenderId: "842831559552"
};
firebase.initializeApp(config);

firebase.auth().signInAnonymously().catch(console.log);

const states = [
  { 'name': 'Alabama', 'abbreviation': 'AL' },
  { 'name': 'Alaska', 'abbreviation': 'AK' },
  { 'name': 'American Samoa', 'abbreviation': 'AS' },
  { 'name': 'Arizona', 'abbreviation': 'AZ' },
  { 'name': 'Arkansas', 'abbreviation': 'AR' },
  { 'name': 'California', 'abbreviation': 'CA' },
  { 'name': 'Colorado', 'abbreviation': 'CO' },
  { 'name': 'Connecticut', 'abbreviation': 'CT' },
  { 'name': 'Delaware', 'abbreviation': 'DE' },
  { 'name': 'District Of Columbia', 'abbreviation': 'DC' },
  { 'name': 'Federated States Of Micronesia', 'abbreviation': 'FM' },
  { 'name': 'Florida', 'abbreviation': 'FL' },
  { 'name': 'Georgia', 'abbreviation': 'GA' },
  { 'name': 'Guam', 'abbreviation': 'GU' },
  { 'name': 'Hawaii', 'abbreviation': 'HI' },
  { 'name': 'Idaho', 'abbreviation': 'ID' },
  { 'name': 'Illinois', 'abbreviation': 'IL' },
  { 'name': 'Indiana', 'abbreviation': 'IN' },
  { 'name': 'Iowa', 'abbreviation': 'IA' },
  { 'name': 'Kansas', 'abbreviation': 'KS' },
  { 'name': 'Kentucky', 'abbreviation': 'KY' },
  { 'name': 'Louisiana', 'abbreviation': 'LA' },
  { 'name': 'Maine', 'abbreviation': 'ME' },
  { 'name': 'Marshall Islands', 'abbreviation': 'MH' },
  { 'name': 'Maryland', 'abbreviation': 'MD' },
  { 'name': 'Massachusetts', 'abbreviation': 'MA' },
  { 'name': 'Michigan', 'abbreviation': 'MI' },
  { 'name': 'Minnesota', 'abbreviation': 'MN' },
  { 'name': 'Mississippi', 'abbreviation': 'MS' },
  { 'name': 'Missouri', 'abbreviation': 'MO' },
  { 'name': 'Montana', 'abbreviation': 'MT' },
  { 'name': 'Nebraska', 'abbreviation': 'NE' },
  { 'name': 'Nevada', 'abbreviation': 'NV' },
  { 'name': 'New Hampshire', 'abbreviation': 'NH' },
  { 'name': 'New Jersey', 'abbreviation': 'NJ' },
  { 'name': 'New Mexico', 'abbreviation': 'NM' },
  { 'name': 'New York', 'abbreviation': 'NY' },
  { 'name': 'North Carolina', 'abbreviation': 'NC' },
  { 'name': 'North Dakota', 'abbreviation': 'ND' },
  { 'name': 'Northern Mariana Islands', 'abbreviation': 'MP' },
  { 'name': 'Ohio', 'abbreviation': 'OH' },
  { 'name': 'Oklahoma', 'abbreviation': 'OK' },
  { 'name': 'Oregon', 'abbreviation': 'OR' },
  { 'name': 'Palau', 'abbreviation': 'PW' },
  { 'name': 'Pennsylvania', 'abbreviation': 'PA' },
  { 'name': 'Puerto Rico', 'abbreviation': 'PR' },
  { 'name': 'Rhode Island', 'abbreviation': 'RI' },
  { 'name': 'South Carolina', 'abbreviation': 'SC' },
  { 'name': 'South Dakota', 'abbreviation': 'SD' },
  { 'name': 'Tennessee', 'abbreviation': 'TN' },
  { 'name': 'Texas', 'abbreviation': 'TX' },
  { 'name': 'Utah', 'abbreviation': 'UT' },
  { 'name': 'Vermont', 'abbreviation': 'VT' },
  { 'name': 'Virgin Islands', 'abbreviation': 'VI' },
  { 'name': 'Virginia', 'abbreviation': 'VA' },
  { 'name': 'Washington', 'abbreviation': 'WA' },
  { 'name': 'West Virginia', 'abbreviation': 'WV' },
  { 'name': 'Wisconsin', 'abbreviation': 'WI' },
  { 'name': 'Wyoming', 'abbreviation': 'WY' }
];


let uid;
let data = {
  cart: {},
  finishes: ['Lustre', 'Glossy', 'Metallic'],
  states,
  sizes: ['4x6 (Pack of 5)', '5x7', '8x10', '8x12', '12x16',
	  '12x18', '16x20', '16x24', '20x30'],
  shipping: { firstName: '',
	      lastName: '',
	      email: '',
	      address1: '',
	      address2: '',
	      city: '',
	      state: '',
	      zip: ''},
  orderInProgress: false
};

const priceDict = {
  '4x6 (Pack of 5)': { 'Lustre': 8, 'Glossy': 8, 'Metallic': 10 },
  '5x7': { 'Lustre': 4, 'Glossy': 4, 'Metallic': 5 },
  '8x10': { 'Lustre': 6, 'Glossy': 6, 'Metallic': 7 },
  '8x12': { 'Lustre': 7, 'Glossy': 7, 'Metallic': 8 },
  '12x16': { 'Lustre': 20, 'Glossy': 20, 'Metallic': 23 },
  '12x18': { 'Lustre': 22, 'Glossy': 22, 'Metallic': 25 },
  '16x20': { 'Lustre': 30, 'Glossy': 30, 'Metallic': 34 },
  '16x24': { 'Lustre': 36, 'Glossy': 36, 'Metallic': 40 },
  '20x30': { 'Lustre': 60, 'Glossy': 60, 'Metallic': 65 },
}

const computed = {
  prices: function() {
    const priceMap = {};
    Object.entries(this.cart).forEach(entry => {
      priceMap[entry[0]] = entry[1].lineItems.map(lineItem => {
	const price = priceDict[lineItem.size][lineItem.finish];
	const priceTotal = lineItem.quantity >= 0 ? lineItem.quantity*price : 0;
	return { price, priceTotal };
      });
    });
    return priceMap
  },
  totalPrice: function() {
    return Object.values(this.prices)
      .flat()
      .map(i => i.priceTotal)
      .reduce((acc, cur) => acc + cur, 0);
  },
  shippingPrice: function() {
    return this.totalPrice >= 20 ? 0 : 5;
  },
  addressFilledOut: function() {
    const shipping = this.shipping
    return shipping.firstName !== ''
      && shipping.lastName !== ''
      && shipping.email !== ''
      && shipping.address1 !== ''
      && shipping.city !== ''
      && shipping.state !== ''
      && shipping.zip !== ''
  }
};

const defaults = { size: '8x10', quantity: 1, finish: 'Lustre' };

const methods = {
  addLineItem: function(item) {
    item.lineItems.push(Object.assign({}, defaults));
  },
  removeLineItem: function(item, index) {
    item.lineItems.splice(index, 1);
  },
  removeItem: function(key) {
    Vue.delete(this.cart, key);
    firebase.database().ref(`users/${uid}/cart/${key}`).remove();
  },
  placeOrder: function() {
    const order = firebase.database().ref(`users/${uid}/orders`).push();
    firebase.database().ref(`users/${uid}/orders/${order.key}`)
      .on('value', function(snapshot) {
	if (snapshot && snapshot.val().url) {
	  window.location = snapshot.val().url;
	}
      });
    order.set({ status: 'open',
		cart: Object.values(this.cart),
		shipping: this.shipping });
    this.orderInProgress = true;
  }
}

let app = new Vue({ el: '#orders', data, computed, methods });

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    uid = user.uid;
    const items = document.getElementById('items');
    firebase.database().ref(`users/${uid}/cart`).once('value')
      .then(function(snapshot) {
	if (snapshot.val()) {
	  for (let property in snapshot.val()) {
	    const val = snapshot.val()[property];
	    const lineItems = { lineItems: [Object.assign({}, defaults)] };
	    Vue.set(data.cart, property, Object.assign({}, val, lineItems));
	  }
	}
      });
  }
});
