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

  const stateCapitalElements = svg.selectAll("g").data(data).join("g");

  const capitalGroups = stateCapitalElements
    .append("g")
    .attr(
      "transform",
      ({ longitude, latitude }) =>
        `translate(${projection([longitude, latitude]).join(",")})`
    );

  capitalGroups.append("circle").attr("r", 2);

  capitalGroups
    .append("text")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "middle")
    .attr("y", -6)
    .text(({ description }) => description);
};
