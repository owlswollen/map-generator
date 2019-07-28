// Create seed for the random number generator
function Seedmatic() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var randomlength = Math.random() * 45 + 5;
  for (var i = 0; i < randomlength; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
// Get the seed and generate a new map
function getSeed() {
  if (d3.select("#seed").node().value) {
    Math.seedrandom(d3.select("#seed").node().value);
  } else {
    my_seed = Seedmatic();
    Math.seedrandom(my_seed);
    d3.select("#seed").node().value = my_seed;
  }
  generateSpecialMap();
}
