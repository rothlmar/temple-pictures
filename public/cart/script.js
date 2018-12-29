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

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    uid = user.uid;
  }
})

function placeOrder() {
  const newOrder = firebase.database().ref(`users/${uid}/orders`).push();
  newOrder.set({ value: true });
  // alert('hello!');
}
