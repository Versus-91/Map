//force graph ref:https://gist.github.com/heybignick/3faf257bbbbc7743bb72310d03b86ee8#file-miserables-json
//tooltip ref https://gramener.github.io/d3js-playbook/tooltips.html
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
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
      const width = 960;
      const height = 600;
      const svg = d3.select("#map").append("svg");
      const items = await d3.csv(
        "https://cdn.glitch.com/489e63ad-3e39-4120-8308-827b57d31840%2Fflights-airport-5000plus.csv?v=1606135273372"
      );
      // Create a map of airports for easy access
      const airportMap = new Map(
        airports.map((airport) => [airport.iata, airport])
      );

      // Filter flights that have both origin and destination in the airports list
      const validFlights = items.filter(
        (flight) =>
          airportMap.has(flight.origin) && airportMap.has(flight.destination)
      );

      // Create edges connecting airports based on valid flights
      const edges = validFlights.map((flight) => ({
        source: airportMap.get(flight.origin),
        target: airportMap.get(flight.destination),
        count: +flight.count, // Assuming 'count' represents the number of flights between the airports
      }));
      const path = d3.geoPath();
      svg
        .append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .style("fill", (d) => {
          const stateName = d.properties.name;
          const stateValue = states.geometries.find(
            (s) => s.properties.name === stateName
          )?.id;
          return colorScale(stateValue);
        })

        .attr("d", path);
      const validDestinations = [
        ...new Set(items.map((item) => item.destination)),
      ];
      const validOrigins = [...new Set(items.map((item) => item.origin))];

      airports = airports.filter((m) => m.iata === "USA");
      const points = airports.map((m) => ({
        name: m.name,
        region: m.state,
        latitude: parseFloat(m.latitude),
        longitude: parseFloat(m.longitude),
        description: m.name,
      }));
      const projection = d3
        .geoAlbersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);

      var tip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      svg
        .selectAll("g")
        .data(points)
        .join("g")
        .append("g")
        .attr("transform", ({ longitude, latitude, name }) => {
          let res = projection([longitude, latitude]);
          return `translate(${projection([longitude, latitude])?.join(",")})`;
        })
        .append("circle")
        .attr("r", 2)
        .attr("fill", "black")
        .on("mouseover", function (d) {
          tip
            .style("opacity", 1)
            .html("name : " + d.name + "<br/> state: " + d.region)
            .style("left", d3.event.pageX - 25 + "px")
            .style("top", d3.event.pageY - 75 + "px");
        })
        .on("mouseout", function (d) {
          tip.style("opacity", 0);
        });

      // Draw edges (lines connecting airports)
      svg
        .selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .attr(
          "x1",
          (d) => projection([d.source.longitude, d.source.latitude])[0]
        )
        .attr(
          "y1",
          (d) => projection([d.source.longitude, d.source.latitude])[1]
        )
        .attr(
          "x2",
          (d) => projection([d.target.longitude, d.target.latitude])[0]
        )
        .attr(
          "y2",
          (d) => projection([d.target.longitude, d.target.latitude])[1]
        )
        .attr("stroke", "black")
        .attr("stroke-width", (d) => Math.sqrt(d.value / 20) - 20);
    });
  }
  async function force_chart() {
    var width = 960;
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
      console.log(links);
      const graph = {
        nodes: nodes,
        links: items.map((m) => ({
          source: m.origin,
          target: m.destination,
          value: m.count,
        })),
      };
      var svg = d3
        .select("#viz")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      var color = d3.scaleOrdinal(d3.schemeCategory10);

      var simulation = d3
        .forceSimulation()
        .force(
          "link",
          d3.forceLink().id(function (d) {
            return d.id;
          })
        )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

      var link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke-width", function (d) {
          return Math.sqrt(d.value / 20) - 20;
        });

      var node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g");

      var circles = node
        .append("circle")
        .attr("r", (d) => {
          return Math.sqrt(d.totalFlights / 500);
        })
        .attr("fill", function (d) {
          return color(d.id);
        });

      // Create a drag handler and append it to the node object instead
      var drag_handler = d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

      drag_handler(node);

      var lables = node
        .append("text")
        .text(function (d) {
          return d.id;
        })
        .attr("x", 6)
        .attr("y", 3);

      node.append("title").text(function (d) {
        return d.id;
      });

      simulation.nodes(graph.nodes).on("tick", ticked);

      simulation
        .force("link")
        .links(graph.links)
        .distance(function (d) {
          return d.value / 100;
        });

      function ticked() {
        link
          .attr("x1", function (d) {
            return d.source.x;
          })
          .attr("y1", function (d) {
            return d.source.y;
          })
          .attr("x2", function (d) {
            return d.target.x;
          })
          .attr("y2", function (d) {
            return d.target.y;
          });

        node.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    });
  }
  let view = 0;
  // Get a reference to your SVG element

  // Function to clear the SVG
  function clearSVG(id) {
    const svgElement = document.getElementById(id);
    // Remove all child elements within the SVG
    while (svgElement.firstChild) {
      svgElement.removeChild(svgElement.firstChild);
    }
  }
  const mapSvg = document.getElementById("map");
  const vizSvg = document.getElementById("viz");
  // Event listener for the button click
  document
    .getElementById("toggle")
    .addEventListener("click", async function () {
      if (view === 0) {
        clearSVG("viz");
        clearSVG("map");
        view = 1;
        mapSvg.style.display = "none";
        vizSvg.style.display = "block";
        await force_chart();
      } else {
        clearSVG("viz");
        clearSVG("map");
        mapSvg.style.display = "block";
        vizSvg.style.display = "none";
        view = 0;
        await map();
      }
    });
  clearSVG("viz");
  clearSVG("map");
  view = 1;
  mapSvg.style.display = "none";
  vizSvg.style.display = "block";
  await force_chart();
};
