var config = {
  apiKey: "AIzaSyA_xHNarGdwoye8F7LYfp2TRMx_-1-DUec",
  authDomain: "tmpl-884c0.firebaseapp.com",
  databaseURL: "https://tmpl-884c0.firebaseio.com",
  projectId: "tmpl-884c0",
  storageBucket: "tmpl-884c0.appspot.com",
  messagingSenderId: "842831559552"
};
firebase.initializeApp(config);

let uid;

firebase.database().ref('/temples').once('value')
  .then(function(snapshot) {
    const gallery = document.getElementById('gallery');
    snapshot.val().map(buildCard).forEach(elt => gallery.appendChild(elt));
  });

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    uid = user.uid;
  }
});

function addItemToCart(metadata) {
  const cart = firebase.database().ref(`users/${uid}/cart`).push();
  cart.set(metadata)
}

firebase.auth().signInAnonymously().catch(console.log);

function buildCard(metadata) {
  const card = document.createElement('div');
  card.className = 'card mb-4 shadow-sm';

  const img = document.createElement('img');
  img.className = 'card-img-top'
  img.src = `/temples/${metadata.thumbnail}`;
  card.appendChild(img);

  const body = document.createElement('div');
  body.className = 'card-body';
  card.appendChild(body);

  const title = document.createElement('h5');
  title.className = 'card-title'
  title.innerHTML = metadata.name;
  body.appendChild(title);

  const text = document.createElement('p');
  text.className='card-text';
  text.innerHTML = metadata.description || '';
  body.appendChild(text);

  const addToCart = document.createElement('button')
  addToCart.className = 'btn btn-primary';
  addToCart.innerHTML = 'Add to Cart';
  addToCart.onclick = function() { addItemToCart(metadata) };
  body.appendChild(addToCart);

  return card;
}
