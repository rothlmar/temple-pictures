const functions = require('firebase-functions');
const uuidv4 = require('uuid/v4');
const axios = require('axios');
const _ = require('lodash');

const LOCATION = functions.config().squareup.location;
const TOKEN = functions.config().squareup.token;

exports.placeOrder = functions.database.ref('/users/{uid}/orders/{oid}')
  .onWrite((change, context) => {
    if (!change.after.exists()) {
      return null;
    }

    const val = change.after.val();

    if (val.status !== 'open') {
      return null;
    }

    const url = `https://connect.squareup.com/v2/locations/${LOCATION}/checkouts`;
    return axios({ url: url,
		   method: 'post',
		   headers: { 'Authorization': `Bearer ${TOKEN}` },
		   data: orderBody(lineItems(val.cart),
				   context.params.oid,
				   val.shipping.email,
				   transformAddress(val.shipping)) })
      .then((response) => {
	change.after.ref.update({
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

function orderBody(lineItems, referenceId, buyerEmail, address) {
  return {
    idempotency_key: uuidv4(),
    order: { reference_id: referenceId, line_items: lineItems },
    ask_for_shipping_address: false,
    pre_populate_buyer_email: buyerEmail,
    merchant_support_email: "rothlmar@gmail.com",
    ask_for_shipping_address: true,
    pre_populate_shipping_address: address,
    redirect_url: "https://tmpl-884c0.firebaseapp.com/confirm/"
  }
}

function transformAddress(shipping) {
  return {
    first_name: shipping.firstName,
    last_name: shipping.lastName,
    address_line_1: shipping.address1,
    address_line_2: shipping.address2,
    locality: shipping.city,
    administrative_district_level_1: shipping.state,
    postal_code: shipping.zip,
    country: 'US'
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

  return _.flatten(cart.map(item => {
    return item.lineItems.map(lineItem => ({
      name: `${lineItem.size} ${item.name}, ${lineItem.finish}`,
      quantity: lineItem.quantity.toString(),
      base_price_money: {
	amount: priceMap[lineItem.size]*100,
	currency: 'USD'
      }
    }))
  }));
}
