var d3; // Minor workaround to avoid error messages in editors
var topojson;
// Waiting until document has loaded
window.onload = async () => {
  // YOUR CODE GOES HERE
  console.log("YOUR CODE GOES HERE");
  async function map() {
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
        .select("#map")
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
          return `translate(${projection([longitude, latitude])?.join(",")})`;
        });

      capitalGroups.append("circle").attr("r", 2);
    });
  }
  async function force_chart() {
    var width = 800;
    var height = 600;
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    d3.csv(
      "https://cdn.glitch.com/489e63ad-3e39-4120-8308-827b57d31840%2Fflights-airport-5000plus.csv?v=1606135273372"
    ).then(async function (items) {
      var label = {
        nodes: [],
        links: [],
      };
      // Extract unique origins and destinations
      const uniqueOrigins = [...new Set(items.map((item) => item.origin))];
      const uniqueDestinations = [
        ...new Set(items.map((item) => item.destination)),
      ];

      // Combine unique origins and destinations to get all unique airports
      const uniqueAirports = [
        ...new Set([...uniqueOrigins, ...uniqueDestinations]),
      ];

      // Create nodes based on unique airports and calculate total flights per airport
      const nodes = uniqueAirports.map((airport) => ({
        id: airport,
        group: 1,
        totalFlights: items.reduce((acc, item) => {
          if (item.origin === airport) acc += +item.count;
          if (item.destination === airport) acc += +item.count;
          return acc;
        }, 0),
      }));

      // Create links with source, target, and value (count of flights)
      const links = items.map((item) => ({
        source: item.origin,
        target: item.destination,
        value: +item.count,
      }));

      const graph = {
        nodes: nodes,
        links: items.map((m) => ({
          source: m.origin,
          target: m.destination,
          value: m.count,
        })),
      };
      graph.nodes.forEach(function (d, i) {
        label.nodes.push({ node: d });
        label.nodes.push({ node: d });
        label.links.push({
          source: i * 2,
          target: i * 2 + 1,
        });
      });

      var labelLayout = d3
        .forceSimulation(label.nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("link", d3.forceLink(label.links).distance(0).strength(2));

      var graphLayout = d3
        .forceSimulation(graph.nodes)
        .force("charge", d3.forceManyBody().strength(-3000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(1))
        .force("y", d3.forceY(height / 2).strength(1))
        .force(
          "link",
          d3
            .forceLink(graph.links)
            .id(function (d) {
              return d.id;
            })
            .distance(50)
            .strength(1)
        )
        .on("tick", ticked);

      var adjlist = [];

      graph.links.forEach(function (d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
      });

      function neigh(a, b) {
        return a == b || adjlist[a + "-" + b];
      }

      var svg = d3.select("#viz").attr("width", width).attr("height", height);
      var container = svg.append("g");

      svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 4])
          .on("zoom", function () {
            container.attr("transform", d3.event.transform);
          })
      );

      var link = container
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", function (d) {
          return Math.sqrt(d.value / 20) - 15;
        });

      var node = container
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", (d) => {
          return Math.sqrt(d.totalFlights / 300);
        })
        .attr("fill", function (d) {
          return color(d.id);
        });

      node.on("mouseover", focus).on("mouseout", unfocus);

      node.call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

      var labelNode = container
        .append("g")
        .attr("class", "labelNodes")
        .selectAll("text")
        .data(label.nodes)
        .enter()
        .append("text")
        .text(function (d, i) {
          return i % 2 == 0 ? "" : d.node.id;
        })
        .style("fill", "#555")
        .style("font-family", "Arial")
        .style("font-size", 12)
        .style("pointer-events", "none"); // to prevent mouseover/drag capture

      node.on("mouseover", focus).on("mouseout", unfocus);

      function ticked() {
        node.call(updateNode);
        link.call(updateLink);

        labelLayout.alphaTarget(0.3).restart();
        labelNode.each(function (d, i) {
          if (i % 2 == 0) {
            d.x = d.node.x;
            d.y = d.node.y;
          } else {
            var b = this.getBBox();

            var diffX = d.x - d.node.x;
            var diffY = d.y - d.node.y;

            var dist = Math.sqrt(diffX * diffX + diffY * diffY);

            var shiftX = (b.width * (diffX - dist)) / (dist * 2);
            shiftX = Math.max(-b.width, Math.min(0, shiftX));
            var shiftY = 16;
            this.setAttribute(
              "transform",
              "translate(" + shiftX + "," + shiftY + ")"
            );
          }
        });
        labelNode.call(updateNode);
      }

      function fixna(x) {
        if (isFinite(x)) return x;
        return 0;
      }

      function focus(d) {
        var index = d3.select(d3.event.target).datum().index;
        node.style("opacity", function (o) {
          return neigh(index, o.index) ? 1 : 0.1;
        });
        labelNode.attr("display", function (o) {
          return neigh(index, o.node.index) ? "block" : "none";
        });
        link.style("opacity", function (o) {
          return o.source.index == index || o.target.index == index ? 1 : 0.1;
        });
      }

      function unfocus() {
        labelNode.attr("display", "block");
        node.style("opacity", 1);
        link.style("opacity", 1);
      }

      function updateLink(link) {
        link
          .attr("x1", function (d) {
            return fixna(d.source.x);
          })
          .attr("y1", function (d) {
            return fixna(d.source.y);
          })
          .attr("x2", function (d) {
            return fixna(d.target.x);
          })
          .attr("y2", function (d) {
            return fixna(d.target.y);
          });
      }

      function updateNode(node) {
        node.attr("transform", function (d) {
          return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        });
      }

      function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) graphLayout.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    });
  }
  let view = 0;
  // Get a reference to your SVG element
  const svgElement = document.getElementById("viz");

  // Function to clear the SVG
  function clearSVG() {
    // Remove all child elements within the SVG
    while (svgElement.firstChild) {
      svgElement.removeChild(svgElement.firstChild);
    }
  }
  // Event listener for the button click
  document
    .getElementById("toggle")
    .addEventListener("click", async function () {
      if (view === 0) {
        d3.select("#map").select("svg").remove();
        clearSVG();
        view = 1;
        await force_chart();
      } else {
        d3.select("#map").select("svg").remove();
        clearSVG();
        view = 0;
        await map();
      }
    });
};
