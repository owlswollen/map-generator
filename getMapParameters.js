// Get map parameters from the user controls
function getMapParamaters() {
  return {
    extent: defaultExtent,
    generator: generateCoast,
    npts: d3.select("#npts").node().value,
    ncities: d3.select("#ncities").node().value,
    nterrs: d3.select("#nterrs").node().value,
    fontsizes: {
      region: 40,
      city: 25,
      town: 20
    }
  };
}
