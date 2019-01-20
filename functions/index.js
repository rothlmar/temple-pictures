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
      // .then(() => change.after.ref.parent.parent.child('cart').set({}))
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

  return _.flatten(cart.map(item => {
    const flatItems = item.lineItems.map(lineItem => ({
      name: `${lineItem.size} ${item.name}, ${lineItem.finish}`,
      quantity: lineItem.quantity.toString(),
      base_price_money: {
	amount: priceDict[lineItem.size][lineItem.finish]*100,
	currency: 'USD'
      }
    }));
    if (flatItems.map(i => i.base_price_money.amount).reduce((a,c) => a + c, 0) < 20) {
      flatItems.push({ name: 'Shipping',
		       quantity: '1',
		       base_price_money: { amount: 5, currency: 'USD' } });
    }
    return flatItems;
  }));
}
