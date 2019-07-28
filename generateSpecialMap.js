// Create the svg invisible (0,0)
function generateSpecialMap() {
  function addSVG() {
    return d3.select("#mySvg")
      .attr("id", "mySvg")
      .attr("height", "0")
      .attr("width", "0")
      .attr("viewBox", "-500 -500 1000 1000");
  };

  var mapSvg = addSVG();

  var params = getMapParamaters();
  doMap(mapSvg, params);
  // Send the map uri to google maps
  svgAsPngUri(document.getElementById("mySvg"), {
    scale: 10,
    left: -500,
    top: -500
  }, function(uri) {
    slicer = new JSlicer(document.getElementById('map'), uri);
    slicer.init();
  });
}
