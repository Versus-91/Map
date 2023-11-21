var d3; // Minor workaround to avoid error messages in editors
var topojson;
// Waiting until document has loaded
window.onload = async () => {
  // YOUR CODE GOES HERE
  console.log("YOUR CODE GOES HERE");

  // Load the data set from the assets folder:
  // select the canvas element created in the html.
  const canvas = document.getElementById("my_dataviz");
  const us = await d3.json("https://d3js.org/us-10m.v2.json");
  const states = us.objects.states;
  const data = topojson.feature(us, us.objects.states).features;
  const colorScale = d3
    .scaleSequential(d3.interpolateBlues) // Change interpolateBlues to any other color scheme you prefer
    .domain([0, d3.max(states.geometries, (d) => parseInt(d.id))]);
  // Step 3. Draw the SVG.
  // First let's create an empty SVG with 960px width and 600px height.
  const width = 960;
  const height = 600;
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create an instance of geoPath.
  const path = d3.geoPath();

  // Use the path to plot the US map based on the geometry data.
  svg
    .append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .style("fill", (d) => {
      const stateName = d.properties.name; // Assuming the state name property is 'name'
      // Find the corresponding data value for the state
      console.log(stateName);

      console.log(states.geometries);

      const stateValue = states.geometries.find(
        (s) => s.properties.name === stateName
      )?.id;
      // Return the color based on the value using the color scale
      console.log(stateValue);
      return stateValue ? colorScale(stateValue) : "gray"; // Default color for missing data
    })
    .attr("d", path);

  // Use the path to plot the US map based on the geometry data.
  d3.select(svg)
    .append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path);
  // Define your points with their coordinates
  const points = [
    { name: "Point 1", coordinates: [ 40.7128, -74.0060] },
    { name: "Point 2", coordinates: [34.0522, -118.2437] },
    // Add more points as needed
  ];

  // Add points to the map as circles
  svg
    .selectAll(".point")
    .data(points)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("r", 5) // Set the radius of the circle
    .attr("cx", (d) => projection(d.coordinates)[0]) // Calculate the X position
    .attr("cy", (d) => projection(d.coordinates)[1]) // Calculate the Y position
    .style("fill", "red")
    .style("opacity", 0.8);

  // You can add labels or tooltips for the points if needed
  svg
    .selectAll(".point-label")
    .data(points)
    .enter()
    .append("text")
    .attr("class", "point-label")
    .attr("x", (d) => projection(d.coordinates)[0] + 10) // Adjust label position
    .attr("y", (d) => projection(d.coordinates)[1] + 5) // Adjust label position
    .text((d) => d.name)
    .style("fill", "black");
};
