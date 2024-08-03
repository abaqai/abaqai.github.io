// Check if D3, d3-annotation, and topojson are loaded
if (typeof d3 !== 'undefined') {
    console.log('D3 is loaded');
} else {
    console.error('D3 is not loaded');
}

if (typeof d3.annotation !== 'undefined') {
    console.log('d3-annotation is loaded');
} else {
    console.error('d3-annotation is not loaded');
}

if (typeof topojson !== 'undefined') {
    console.log('topojson is loaded');
} else {
    console.error('topojson is not loaded');
}

let currentScene = 0;

// Load the dataset and initialize the scenes
d3.csv("data/nba_player_stats.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.points = +d.points;
        d.rebounds = +d.rebounds;
        d.assists = +d.assists;
    });

    // Define scenes
    const scenes = [
        { id: 'scene1', setup: () => setupScene1(data), annotations: getAnnotations1 },
        { id: 'scene2', setup: () => setupScene2(data), annotations: getAnnotations2 },
        { id: 'scene3', setup: () => setupScene3(data), annotations: getAnnotations3 }
    ];

    // Initialize each scene
    scenes.forEach(scene => {
        scene.setup();
        addAnnotations(scene.id, scene.annotations());
    });

    // Show the first scene
    showScene(currentScene);
}).catch(error => {
    console.error('Error loading or parsing data:', error);
});

function setupScene1(data) {
    const svg = d3.select("#scene1").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 800 600");

    const margin = { top: 50, right: 30, bottom: 70, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    const playerData = data.filter(d => d.player === 'LeBron James');

    x.domain(playerData.map(d => d.season));
    y.domain([0, d3.max(playerData, d => d.points)]);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-65)");

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    const line = d3.line()
        .x(d => x(d.season) + x.bandwidth() / 2)
        .y(d => y(d.points));

    g.append("path")
        .datum(playerData)
        .attr("class", "line")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-width", "2px");

    g.selectAll(".dot")
        .data(playerData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.season) + x.bandwidth() / 2)
        .attr("cy", d => y(d.points))
        .attr("r", 5)
        .style("fill", "steelblue")
        .append("title")
        .text(d => `${d.player}: ${d.points} points`);

    // Add title
    svg.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("LeBron James' Avg Points Per Game 2015-2020");

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${height + margin.top + 50})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Season");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 2 - 20)
        .attr("x", -(height / 2) - margin.top)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Avg Points Per Game");
}

function setupScene2(data) {
    const svg = d3.select("#scene2").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 800 600");

    const margin = { top: 50, right: 30, bottom: 70, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const seasonData = data.filter(d => d.season === '2019-20');

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(seasonData.map(d => d.player));
    y.domain([0, d3.max(seasonData, d => d.points)]);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => d.split(' ')[1]))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-65)");

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    g.selectAll(".bar")
        .data(seasonData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.player))
        .attr("y", d => y(d.points))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.points))
        .style("fill", "steelblue")
        .on("mouseover", function(event, d) {
            const [xPos, yPos] = d3.pointer(event);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.player}<br>Team: ${d.team}<br>Avg Points Per Game: ${d.points}<br>Avg Rebounds Per Game: ${d.rebounds}<br>Avg Assists Per Game: ${d.assists}`)
                .style("left", (xPos + margin.left - 160) + "px")
                .style("top", (yPos + margin.top - 40) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add title
    svg.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Avg Points per Game by Players in 2019-20 Season");

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${height + margin.top + 50})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Player");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 2 - 20)
        .attr("x", -(height / 2) - margin.top)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Avg Points Per Game");
}

function setupScene3(data) {
    const svg = d3.select("#scene3").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 800 600");

    const margin = { top: 50, right: 30, bottom: 70, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const seasonData = data.filter(d => d.season === '2019-20');

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain([0, d3.max(seasonData, d => d.points)]);
    y.domain([0, d3.max(seasonData, d => d.assists)]);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    g.selectAll(".dot")
        .data(seasonData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.points))
        .attr("cy", d => y(d.assists))
        .attr("r", 5)
        .style("fill", "steelblue")
        .append("title")
        .text(d => `${d.player}: ${d.points} points, ${d.assists} assists`);

    // Add title
    svg.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Points vs Assists for Players in 2019-20 Season");

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${height + margin.top + 50})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Avg Points Per Game");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 2 - 20)
        .attr("x", -(height / 2) - margin.top)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Avg Assists Per Game");
}

function addAnnotations(sceneId, annotations) {
    const svg = d3.select(`#${sceneId} svg`);
    const makeAnnotations = d3.annotation().annotations(annotations);
    svg.append("g").call(makeAnnotations);
}

function getAnnotations1() {
    return [
        {
            note: {
                label: "Peak performance in the 2018-19 season",
                wrap: 200,
                align: "middle"
            },
            x: 300,
            y: 70,
            dy: 30,
            dx: 150
        },
        {
            note: {
                label: "Low performance in 2019-20 season",
                wrap: 200,
                align: "middle"
            },
            x: 150,
            y: 100,
            dy: 50,
            dx: 50
        }
    ];
}

function getAnnotations2() {
    return [
        {
            note: {
                label: "James Harden's impressive points",
                wrap: 200,
                align: "middle"
            },
            x: 150,
            y: 100,
            dy: -30,
            dx: 30
        },
        {
            note: {
                label: "Other notable players",
                wrap: 200,
                align: "middle"
            },
            x: 690,
            y: 150,
            dy: -30,
            dx: 30
        }
    ];
}

function getAnnotations3() {
    return [
        {
            note: {
                label: "High points and assists",
                wrap: 200,
                align: "middle"
            },
            x: 650,
            y: 100,
            dy: -30,
            dx: 30
        },
        {
            note: {
                label: "Strong correlation between points and assists",
                wrap: 200,
                align: "middle"
            },
            x: 550,
            y: 310,
            dy: -30,
            dx: 30
        }
    ];
}

function showScene(index) {
    const scenes = document.querySelectorAll('.scene');
    scenes.forEach((scene, i) => {
        scene.style.display = i === index ? 'block' : 'none';
    });
}

function navigate(direction) {
    const scenes = document.querySelectorAll('.scene');
    currentScene += direction;
    if (currentScene < 0) currentScene = scenes.length - 1;
    if (currentScene >= scenes.length) currentScene = 0;
    showScene(currentScene);
}
