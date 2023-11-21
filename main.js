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

  // Set a projection for the map. Projection = transform a lat/long on a position on the 2d map.
  const projection = d3
    .geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2]);

  // Get the 'context'
  const ctx = canvas.getContext("2d");

  // geographic path generator for given projection and canvas context
  const pathGenerator = d3.geoPath(projection, ctx);

  // Draw a background
  // ctx.fillStyle = '#ddd';
  // ctx.fillRect(0, 0, width, height);

  // Load external data and boot
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ).then(function (data) {
    // initialize the path
    ctx.beginPath();

    // Got the positions of the path
    pathGenerator(data);

    // Fill the paths
    ctx.fillStyle = "#999";
    ctx.fill();

    // Add stroke
    ctx.strokeStyle = "#69b3a2";
    ctx.stroke();
  });
};
