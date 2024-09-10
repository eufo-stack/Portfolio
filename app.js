function assignment7(){
    var filePath="data.csv";
    question0(filePath);
    question1(filePath);
    question2(filePath);
    question3(filePath);
//    question4(filePath);
}

var question0=function(filePath){
    d3.csv(filePath).then(function(data){
        console.log(data[0])
    });
}

var question1=function(filePath){
    d3.csv(filePath).then(function(data){
        //prep data
        let furniture = data.filter(function(d){
            return d.Category == 'Furniture' && +d['Order Date'].slice(-4) > 2016
        })
        let furniture2 = Object.fromEntries(d3.rollup(furniture,
                                    v=> Object.fromEntries(['Profit','Sales'].map(col => [col, d3.sum(v, d => +d[col])])),
                                    d=> d.State))
        const transformedData = Object.keys(furniture2).map(state => {
            return {
                State: state,
                Profit: furniture2[state].Profit,
                Sales: furniture2[state].Sales
            }
        })
        let minval = d3.min(transformedData,function(d){
            return d.Sales
        })
        let maxval = d3.max(transformedData,function(d){
            return d.Sales
        })
        let maxprof = d3.max(transformedData,function(d){
            return d.Profit
        })
            //console.log(maxval)
            //console.log(minval)
            //console.log(Object.keys(furniture2))
        //canvas
        let margin = {top: 20, right:30, bottom:130, left:60}
        let width = 800 - margin.left - margin.right
        let height = 500 - margin.top - margin.bottom
        let svg = d3.select("#q1_plot")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //scales
        let x = d3.scaleBand()
                    .domain(Object.keys(furniture2))
                    .range([margin.left, width])
        svg.append("g")
            .attr("transform","translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform","translate(-10,0)rotate(-45)")
            .style("text-anchor","end")
        let y = d3.scaleLinear()
                    .domain([maxval + maxprof, minval])
                    .range([margin.top, height])
        svg.append("g")
            .attr("transform","translate(60,0)")
            .call(d3.axisLeft(y))
        let color = d3.scaleOrdinal()
                        .domain(['Sales','Profit'])
                        .range(['lightgrey', 'green'])
        //stacking
        let stacked = d3.stack()
                        //.offset(d3.stackOffsetSilhouette)
                        .keys(['Sales','Profit'])
                        (transformedData)
            //console.log(transformedData)
        //areas
        svg.selectAll("layers")
            .data(stacked)
            .enter()
            .append("path")
            .style("fill", d=>color(d.key))
            .attr("d", d3.area()
                .x(function(d,i){
                    return x(d.data.State)
                })
                .y0(function(d){
                    return y(d[0])
                })
                .y1(function(d){
                    return y(d[1])
                }))
        //text titles
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width - 300)
            .attr("y", height + margin.top + 80)
            .text("US States")
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 50)
            .attr("x", -150)
            .text("Quantity")
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width - 200)
            .attr("y", margin.top - 20)
            .text("Profit and Sales Streamgraph Per US State")
        //legend
        svg.append("circle").attr("cx",600).attr("cy",130).attr("r", 6).style("fill", "green")
        svg.append("circle").attr("cx",600).attr("cy",160).attr("r", 6).style("fill", "lightgrey")
        svg.append("text").attr("x", 620).attr("y", 130).text("Profit").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 620).attr("y", 160).text("Sales").style("font-size", "15px").attr("alignment-baseline","middle")
    });

}

var question2=function(filePath){
    d3.csv(filePath).then(function(data){
        //prep data
        let tech = data.filter(function(d){
            return d.Category == 'Technology' && +d['Order Date'].slice(-4) > 2016
        })
        let grouped = d3.group(tech, d=>d.State, d=>d['Sub-Category'])
        function convertMapToObject(map) {
            const obj = {};
            for (const [key, value] of map) {
              if (value instanceof Map) {
                obj[key] = convertMapToObject(value);
              } else {
                obj[key] = value;
              }
            }
            return obj;
        }
        const transformedData = Object.entries(convertMapToObject(grouped)).map(([state, sales]) => {
            const salesByCategory = {};
            Object.entries(sales).forEach(([category, salesArray]) => {
              const totalSales = salesArray.reduce(
                (sum, { Sales }) => sum + parseInt(Sales),
                0
              );
              salesByCategory[category] = totalSales;
            });
            return { State: state, ...salesByCategory };
          });
            //console.log(transformedData)
        //creating canvas
        var margin = {top:40, right:30, bottom:90, left:70}
        var width = 700 - margin.left - margin.right
        var height = 500 - margin.top - margin.bottom
        var svg = d3.select("#q2_plot")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //scales
        const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
        const y = d3.scaleLinear()
        .range([height, 0]);
        const color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);
        //stack
        const stack = d3.stack()
        .keys(["Accessories", "Phones", "Machines", "Copiers"]);
        const stackedData = stack(transformedData.map(d => {
            // Check if each category exists and set default value of 0 if it doesn't
            return {
              State: d.State,
              Accessories: d.Accessories || 0,
              Phones: d.Phones || 0,
              Machines: d.Machines || 0,
              Copiers: d.Copiers || 0
            };
        }));
        //domain scales
        x.domain(transformedData.map(d => d.State));
        y.domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))]);
        //add bars
        svg.selectAll(".bar")
        .data(stackedData)
        .enter().append("g")
        .attr("class", "bar")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => x(d.data.State))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());
        //x axis
        svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform","translate(-10,0)rotate(-45)")
        .style("text-anchor","end");
        //y axis
        svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));
        //text titles
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width - 300)
            .attr("y", height + margin.top + 40)
            .text("US States")
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -150)
            .text("Quantity")
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width - 200)
            .attr("y", margin.top - 50)
            .text("Sales per Subcategory for Each State")
        //legend
        svg.append("circle")
            .attr("cx",450)
            .attr("cy",130)
            .attr("r", 6)
            .style("fill", "#98abc5")
        svg.append("circle")
            .attr("cx",450)
            .attr("cy",160)
            .attr("r", 6)
            .style("fill", "#8a89a6")
        svg.append("circle")
            .attr("cx",450)
            .attr("cy",190)
            .attr("r", 6)
            .style("fill", "#7b6888")
        svg.append("circle")
            .attr("cx",450)
            .attr("cy",220)
            .attr("r", 6)
            .style("fill", "#6b486b")
        svg.append("text")
            .attr("x", 470)
            .attr("y", 130)
            .text("Accessories")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")
        svg.append("text")
            .attr("x", 470)
            .attr("y", 160)
            .text("Phones")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")
         svg.append("text")
            .attr("x", 470)
            .attr("y", 190)
            .text("Machines")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle") 
        svg.append("text")
            .attr("x", 470)
            .attr("y", 220)
            .text("Copiers")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")             
    });

      
}
var question3=function(filePath){
    var width=1000;
    var height=800;
    var margin=50;
    //var rowConverter = function(d){
    // Add rowConverter here
    //}
    d3.csv(filePath).then(function(data){ //removed row converter
        var width = 960;
        var height = 500;
        // State Symbol dictionary for conversion of names and symbols.
        var stateSym = {
        AZ: 'Arizona',
        AL: 'Alabama',
        AK: 'Alaska',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PA: 'Pennsylvania',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
    };
    //data setup
    let groupsum = d3.rollup(data, v => Math.log(d3.sum(v, d => d.Sales)), d => d.State)
    const transformed = Object.entries(Object.fromEntries(groupsum)).map(([state, sales]) => ({
        State: state,
        Sales: sales
    }));
    const transformedData = transformed.map(({ State, Sales }) => ({
        State: Object.keys(stateSym).find(key => stateSym[key] === State),
        Sales
    }));
        //console.log(transformedData)
    //map
    const statesmap = d3.json("us-states.json")
    console.log(statesmap)
    var path = d3.geoPath()
                .projection(d3.geoAlbersUsa())
    //canvas
    var svg = d3.select("#q3_plot")
                .append("svg")
                .attr("width", width + margin + margin)
                .attr("height", height + margin + margin)
    //drawing actual map
    const colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain(d3.extent(transformedData, d => d.Sales));
    statesmap.then(function(map){
        svg.selectAll("path")
            .data(map.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => {
                const stateData = transformedData.find(s => s.State === d.properties.name);
                return colorScale(stateData.Sales);
            });
    })
    //legend
    console.log(colorScale.domain())
    const legend = d3.legendColor()
        .scale(colorScale)
        .title("Log Scaled Sales")
        //.labelFormat(d3.format(".0f"))
        .labels(["[0,6.8]", "[6.8,8.4]", "[8.4, 9.9]", "[9.9, 11.5]", "[11.5, 13.0"])
        .shapePadding(5)
        .shapeWidth(30)
        .shapeHeight(20);
    svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(20, 400)")
        .call(legend);
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width - 400)
        .attr("y", margin - 20)
        .text("Sales for Each State")
    });
      
}

