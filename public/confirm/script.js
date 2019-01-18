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
let cart;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    uid = user.uid;
    const urlParams = new URLSearchParams(window.location.search);
    const referenceId = urlParams.get('referenceId');
    const checkoutId = urlParams.get('checkoutId');
    const orderId = urlParams.get('orderId');
    const transactionId = urlParams.get('transactionId');
    firebase.database()
      .ref(`users/${uid}/orders/${referenceId}`)
      .update({ checkoutId, orderId, transactionId });
    firebase.database().ref(`users/${uid}/cart`).remove();
  }
});

function buildItem(metadata) {
  const item = document.createElement('tr');
  const name = document.createElement('td');
  name.innerHTML = metadata.name;
  item.appendChild(name);

  const uuid = document.createElement('td');
  uuid.innerHTML = metadata.thumbnail;;
  item.appendChild(uuid);

  return item;
}

function placeOrder() {
  const order = firebase.database().ref(`users/${uid}/orders`).push();
  firebase.database().ref(`users/${uid}/orders/${order.key}`)
    .on('value', function(snapshot) {
      if (snapshot && snapshot.val().url) {
	window.location = snapshot.val().url;
      }
    });
  order.set({ status: 'open', cart: cart });
}
