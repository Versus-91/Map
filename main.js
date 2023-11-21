var d3; // Minor workaround to avoid error messages in editors
var topojson;
// Waiting until document has loaded
window.onload = async () => {
  // YOUR CODE GOES HERE
  console.log("YOUR CODE GOES HERE");

  // Load the data set from the assets folder:
  // select the canvas element created in the html.
const width = 960;
const height = 600;

// Append an SVG element to the #map div
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define the projection for the map (Albers USA)
const projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]) // center the map in the SVG
  .scale(1100);

// Create a path generator
const path = d3.geoPath().projection(projection);

// Fetch the US states GeoJSON data
d3.json("https://d3js.org/us-10m.v1.json").then(function(us) {
  // Extract the features (states) from the GeoJSON data
  const states = us.objects.states;

  // Draw the states on the map
  svg.append("g")
    .selectAll("path")
    .data(topojson.feature(us, states).features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", function(d) {
      // Example: Color the states randomly
      return d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    });
});
};
