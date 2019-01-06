const functions = require('firebase-functions');
const uuidv4 = require('uuid/v4');
const axios = require('axios');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const LOCATION = functions.config().squareup.location;
const TOKEN = functions.config().squareup.token;

exports.placeOrder = functions.database.ref('/users/{uid}/orders/{oid}')
  .onWrite((change, context) => {
    if (!change.after.exists()) {
      return null;
    }

    if (change.after.val().status !== 'open') {
      return null;
    }

    const url = `https://connect.squareup.com/v2/locations/${LOCATION}/checkouts`;
    return axios({ url: url,
		   method: 'post',
		   headers: { 'Authorization': `Bearer ${TOKEN}` },
		   data: orderBody(lineItems(change.after.val().cart,
					     context.params.oid)) })
      .then((response) => {
	change.after.ref.set({
	  status: 'placed',
	  url: response.data.checkout.checkout_page_url,
	  checkout: response.data.checkout
	})
      })
      .catch(error => {
	console.log(error.response.data);
	if (error.response) {
	  change.after.ref.set({
	    status: 'error',
	    response: error.response.data
	  })
	}
      })
      .then(() => change.after.ref.parent.parent.child('cart').set({}))
  });

function orderBody(lineItems, referenceId) {
  return {
    idempotency_key: uuidv4(),
    order: {
      reference_id: referenceId,
      line_items: lineItems
    },
    ask_for_shipping_address: true,
    merchant_support_email: "rothlmar@gmail.com",
    redirect_url: "https://tmpl-884c0.firebaseapp.com/confirm/"
  }
}

function lineItems(cart) {
  const priceMap = {
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

  return cart.map(item => {
    return { name: `${item.size} ${item.name}, ${item.finish}`,
	     quantity: item.quantity.toString(),
	     base_price_money: {
	       amount: priceMap[item.size]*100,
	       currency: 'USD'
	     }
	   }
  });
}
