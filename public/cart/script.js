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

let uid;
let data = {
  cart: {},
  finishes: ['Lustre', 'Glossy', 'Metallic'],
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
  '4x6 (Pack of 5)': 10,
  '5x7': 5,
  '8x10': 10,
  '8x12': 12,
  '12x16': 15,
  '12x18': 17,
  '16x20': 25,
  '16x24': 30,
  '20x30': 50
}

const computed = {
  prices: function() {
    const priceMap = {};
    Object.entries(this.cart).forEach(entry => {
      priceMap[entry[0]] = entry[1].lineItems.map(lineItem => {
	const price = priceDict[lineItem.size];
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
