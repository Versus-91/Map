var d3; // Minor workaround to avoid error messages in editors

// Waiting until document has loaded
window.onload = () => {
  // YOUR CODE GOES HERE
  console.log("YOUR CODE GOES HERE");

  // Load the data set from the assets folder:
  // select the canvas element created in the html.
  const canvas = document.getElementById("my_dataviz");

  // Actual width and height. No idea if clienWidth would be a better option..?
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  // Set a projection for the US map
  const projection = d3
    .geoAlbersUsa() // Using Albers USA projection for the US map
    .translate([width / 2, height / 2])
    .scale(1000); // You might need to adjust the scale for better display

  // Get the 'context'
  const ctx = canvas.getContext("2d");

  // geographic path generator for given projection and canvas context
  const pathGenerator = d3.geoPath(projection, ctx);

  // Load US states GeoJSON data and plot map and points
  Promise.all([
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ),
  ]).then(function ([us, data]) {
    // Draw US states map
    ctx.beginPath();
    pathGenerator(topojson.feature(us, us.objects.states));
    ctx.fillStyle = "#999";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    // Draw world map in the background
    ctx.beginPath();
    pathGenerator(data);
    ctx.fillStyle = "#ddd";
    ctx.fill();
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    // Plotting points on the US map
    let points = [
      { long: -120.085767, lat: 37.681522 }, // Example points within the US
      { long: -95.568085, lat: 38.260878 },
    ];

    ctx.fillStyle = "red"; // Set color for points

    points.forEach((point) => {
      const [x, y] = projection([point.long, point.lat]); // Project lat/long to x/y
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2); // Draw a circle for each point
      ctx.fill();
    });
  });
};
