function SalaryChart(parentPage){
	this.parentPage = parentPage;
	
	this.svg = d3.select(".salaryChart"), 
	this.margin = {top: 20, right: 20, bottom: 100, left: 40},
	this.width = +this.svg.attr("width") - this.margin.left - this.margin.right,
	this.height = +this.svg.attr("height") - (this.margin.top * 3) - this.margin.bottom;

	this.yOffset = this.height;

	this.x = d3.scale.ordinal()
			.rangeRoundBands([0, this.width],0.1);

	this.y = d3.scale.linear()
			.range([this.yOffset, 0]);

	this.color = d3.scale.ordinal()
			.range(["#98abc5"]);
}

SalaryChart.prototype.updateChart = function(selectedCollege) {
	var _self = this;
	d3.select(".barChartGroup").remove(); 

	var yAxisLabel = "Dollars ($)";
	var columnName = "MN_EARN_WNE_P10";
	
	var filteredData = [];
	var noDataAvailable = [];
	
	this.parentPage.data.collegeData.forEach(function(d) {
		for(var i=0; i<selectedCollege.length; i++)
		{
			if(d.INSTNM == selectedCollege[i])
			{
				if(d.MN_EARN_WNE_P10 != "NULL" && d.MN_EARN_WNE_P10 != "PrivacySuppressed"){
					filteredData.push(d);
				}else{
					noDataAvailable.push(selectedCollege[i]);
				}
			}
		}
	});
	
	this.noData(noDataAvailable);
	
	if(filteredData.length != 0){
	var x_axis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom");
    

	var y_axis = d3.svg.axis()
		.scale(this.y)
		.orient("left")
		.tickFormat(d3.format(".2s"));

	
	var g = this.svg.append("g")
				.attr("transform", "translate(" + (this.margin.left + 10) + "," + this.margin.top * 3 + ")")
				.attr("class", "barChartGroup");
				
	var values = d3.keys(filteredData[0]).filter(function(key) { return (key == columnName); });

	filteredData.forEach(function(d) {
		d.fees = values.map(function(name) {
			var temp = d[name];
			if(d[name] == "NULL")
				temp = 0;
			return {name: name, value: +temp}; 
		})
	});


	this.x.domain(filteredData.map(function(d) { return d.INSTNM; }));
	this.y.domain([0, d3.max(filteredData, function(d) { return d3.max(d.fees, function(d) { return d.value; }); })]);

	g.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + this.yOffset + ")")
	.call(x_axis)
	.selectAll(".tick text")
	.style("font-size","12px")
	.call(this.wrap, this.x.rangeBand());
		  
	g.append("g")
	.attr("class", "y axis")
	.call(y_axis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", "0.71em")
	.style("text-anchor", "end")
	.style("fill","black")
	.text(yAxisLabel);

	var college = g.selectAll(".college")
				.data(filteredData)
				.enter().append("g")
				.attr("class", "college")
				.attr("transform", function(d) { return "translate(" + _self.x(d.INSTNM)  + ",0)"; });
		   
		  
	college.selectAll("rect")
		.data(function(d) { return d.fees; })
		.enter().append("rect")
		.attr("width", this.x.rangeBand())
		.attr("x", function(d) { return _self.x(d.name); })
		.attr("y", function(d) { return _self.y(d.value); })
		.attr("height", function(d) { return _self.yOffset - _self.y(d.value); })
		.style("fill", function(d) { return _self.color(d.name); });
		
	var legend = g.selectAll(".salaryLegend")
				.data(values.slice().reverse())
				.enter().append("g")
				.attr("class", "salaryLegend")
				.attr("transform", function(d, i) { return "translate(0," + i * 40 + ")"; });

	legend.append("rect")
		.attr("x", this.width - 130)
		.attr("y", -25)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", this.color);

	legend.append("text")
		.attr("x", this.width - 105)
		.attr("y", -20)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
		.text("Average Earnings");
	}
}

SalaryChart.prototype.wrap = function(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

SalaryChart.prototype.noData = function(noDataAvailable) {
	var htmlContent = "* Salary data currently not available for ";
	for(var i = 0; i < noDataAvailable.length; i++){
		htmlContent += noDataAvailable[i];
		
		if(i == noDataAvailable.length - 2 && noDataAvailable.length > 1){
			htmlContent += " and "
		}else if(i == noDataAvailable.length - 1){
			htmlContent += ".";
		}else {
			htmlContent += ", ";
		}
	}
	
	if(noDataAvailable.length != 0){
		$(".noDataSalary").html(htmlContent);
	}else{
		$(".noDataSalary").html("");
	}
}