const visObject = {
    options: {
        chart_title: {
            type: "string",
            label: "Chart Title",
            default: "Employee Data"
        }
    },

    create: function(element, config) {
        element.innerHTML = "<h1>Ready to render!</h1>";
    },

    updateAsync: function(data, element, config, queryResponse, details, doneRendering) {


        var margin = {
                top: 50,
                right: 50,
                bottom: 30,
                left: 120
            },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.scaleLinear()
            .range([0, width]);
        var y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1);

        element.innerHTML = "";

        var svg = d3.select("#vis").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        let dataMap = {};

        data.forEach(item => {
            if (!dataMap[item.job_level]) {
                dataMap[item.job_level] = {
                    job_level: item.job_level,
                    headcount: 0,
                    new_hires: 0,
                    leavers: 0
                };
            }

            if (item.employee_status === 'existing') {
                dataMap[item.job_level].headcount += 1;
            } else if (item.employee_status === 'new_hire') {
                dataMap[item.job_level].new_hires += 1;
            } else if (item.employee_status === 'leaver') {
                dataMap[item.job_level].leavers += 1;
            }
        });

        let employeeData = Object.values(dataMap);

        const max_value = d3.max(employeeData, function(d) {
            return d.headcount + d.new_hires + d.leavers;
        });

        x.domain([0, max_value]);
        y.domain(employeeData.map(function(d) {
            return d.job_level;
        }));

        const middlePoint = max_value / 2;

        x.domain([0, max_value]);

        // Calculate the total (headcount + new hires + leavers)
        const total = d3.sum(employeeData, function(d) {
            return d.headcount + d.new_hires + d.leavers;
        });

        x.domain([0, 1]); // Set x domain to represent percentages


        // Add new hires bars (to the left of the central tendency)
        const newHiresBars = svg.selectAll(".new-hires-bar")
            .data(employeeData)
            .enter().append("rect")
            .attr("class", "new-hires-bar")
            .attr("style", "fill: #D0F0C0;")
            .attr("x", 0)
            .attr("y", function(d) {
                return y(d.job_level);
            })
            .attr("width", function(d) {
                return x(d.new_hires / total);
            })
            .attr("height", y.bandwidth() / 2);

        // Add headcount bars (to the right of the central tendency)
        const headcountBars = svg.selectAll(".headcount-bar")
            .data(employeeData)
            .enter().append("rect")
            .attr("class", "headcount-bar")
            .attr("style", "fill: #8fa9dc;")
            .attr("x", function(d) {
                return x(0.5 - (d.headcount / total) / 2);
            }) // Start at the middle point minus half of the headcount bar width
            .attr("y", function(d) {
                return y(d.job_level);
            })
            .attr("width", function(d) {
                return x(d.headcount / total);
            })
            .attr("height", y.bandwidth() / 2);

        // Add leavers bars (to the right of the x-axis)
        const leaversBars = svg.selectAll(".leavers-bar")
            .data(employeeData)
            .enter().append("rect")
            .attr("class", "leavers-bar")
            .attr("style", "fill: #e74c3c;")
            .attr("x", function(d) {
                return x(1 - d.leavers / total);
            }) // Start at the right of the x-axis
            .attr("y", function(d) {
                return y(d.job_level);
            })
            .attr("width", function(d) {
                return x(d.leavers / total);
            })
            .attr("height", y.bandwidth() / 2);

        function addPercentageLabels(bars, property, xOffset, widthFactor) {
            bars.data().forEach((d, i) => {
                svg.append('text')
                    .attr('x', x(xOffset(d)) + x(widthFactor(d)) / 2)
                    .attr('y', y(d.job_level) + y.bandwidth() / 4)
                    .attr('font-size', '12px')
                    .attr('text-anchor', 'middle')
                    .text(((d[property] / total) * 100).toFixed(1) + '%');
            });
        }

        addPercentageLabels(newHiresBars, 'new_hires', d => 0, d => 0.04);
        addPercentageLabels(headcountBars, 'headcount', d => 0.5 - (d.headcount / total) / 2, d => d.headcount / total);
        addPercentageLabels(leaversBars, 'leavers', d => 1 - d.leavers / total, d => d.leavers / total);

        const gap = 10;  // Define a gap size, adjust to your needs
        
        const categoryRects = svg.selectAll(".category-rect")
            .data(employeeData)
            .enter().append("rect")
            .attr("class", "category-rect")
            .attr("fill", "none")  // Make the fill clear
            .attr("stroke", "#8fa9dc")  // Make the border color #8fa9dc
            .attr("x", -margin.left + gap)  // Add a gap to the left side
            .attr("y", function(d) {
                return y(d.job_level);
            })
            .attr("width", margin.left - 2 * gap)  // Subtract the gap from the width
            .attr("height", y.bandwidth() / 2);
        
        // Add text labels for each rectangle
        const categoryLabels = svg.selectAll(".category-label")
            .data(employeeData)
            .enter().append("text")
            .attr("class", "category-label")
            .attr("x", -margin.left / 2)  // Add a gap to the left side
            .attr("y", function(d) {
                return y(d.job_level) + y.bandwidth() / 4;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("style", "fill: black;")
            .text(function(d) {
                return d.job_level;
            });

        

        function addCategoryLabel(xOffset, widthFactor, label) {
            svg.append('text')
                .attr('x', x(xOffset) + x(widthFactor) / 2)
                .attr('y', -15)
                .attr('font-size', '18px')
                .attr('font-weight', 'bold')
                .attr('text-anchor', 'middle')
                .text(label);
        }

        const headcountWidthFactor = employeeData[0].headcount / total;

        addCategoryLabel(0, 0, 'New Hires');
        addCategoryLabel(0.5 - headcountWidthFactor / 2, headcountWidthFactor, 'Headcount');
        addCategoryLabel(1 - employeeData[0].leavers / total, 0, 'Leavers');



        doneRendering();
    }
};

looker.plugins.visualizations.add(visObject);
