var d3; // Minor workaround to avoid error messages in editors
var topojson;
// Waiting until document has loaded
window.onload = async () => {
  // YOUR CODE GOES HERE
  console.log("YOUR CODE GOES HERE");
  d3.csv(
    "https://cdn.glitch.com/489e63ad-3e39-4120-8308-827b57d31840%2Fairports.csv?v=1606135278302"
  ).then(async function (airports) {
    const us = await d3.json("https://d3js.org/us-10m.v2.json");
    const states = us.objects.states;
    const data = topojson.feature(us, us.objects.states).features;
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues) // Change interpolateBlues to any other color scheme you prefer
      .domain([0, d3.max(states.geometries, (d) => parseInt(d.id))]);
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
        const stateValue = states.geometries.find(
          (s) => s.properties.name === stateName
        )?.id;
        // Return the color based on the value using the color scale
        return stateValue ? colorScale(stateValue) : "gray"; // Default color for missing data
      })
      .attr("d", path);

    airports = airports.filter((m) => m.country === "USA");
    const points = airports.map((m) => ({
      name: m.name,
      latitude: parseFloat(m.latitude),
      longitude: parseFloat(m.longitude),
      description: m.name,
    }));
    const stateCapitalElements = svg.selectAll("g").data(points).join("g");
    const projection = d3
      .geoAlbersUsa()
      .scale(1280)
      .translate([width / 2, height / 2]);

    const capitalGroups = stateCapitalElements
      .append("g")
      .attr("transform", ({ longitude, latitude, name }) => {
        let res = projection([longitude, latitude]);
        if (!res) {
          console.log(longitude, latitude, name);
        }
        return `translate(${projection([longitude, latitude])?.join(",")})`;
      });

    capitalGroups.append("circle").attr("r", 2);
  });
};
