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

let data = {
  gallery: [],
  cart: [],
  uid: ''
}

firebase.database().ref('/temples').once('value').then(function(snapshot) {
  if (snapshot.val()) {
    data.gallery = Object.values(snapshot.val());
  }
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    data.uid = user.uid;
    firebase.database().ref(`users/${user.uid}/cart`).once('value')
      .then(function(snapshot) {
	if (snapshot.val()) {
	  console.log(snapshot.val());
	  Object.values(snapshot.val()).forEach(item => data.cart.push(item.thumbnail));
	}
      });
  }
});

const methods = {
  addItemToCart: function(metadata) {
    const cart = firebase.database().ref(`users/${this.uid}/cart`).push();
    cart.set(metadata);
    data.cart.push(metadata.thumbnail);
  }
}

let app = new Vue({ el: '#root', data, methods });
