function TuitionChart(parentPage){
	this.parentPage = parentPage;

	this.svg = d3.select(".barChart");
	this.margin = {top: 20, right: 20, bottom: 100, left: 40};
	this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
	this.height = +this.svg.attr("height") - (this.margin.top * 3) - this.margin.bottom;

	this.yOffset = this.height;

	this.x0 = d3.scale.ordinal()
		.rangeRoundBands([0, this.width],0.1);

	this.x1 = d3.scale.ordinal();

	this.y = d3.scale.linear()
		.range([this.yOffset, 0]);

	this.color = d3.scale.ordinal()
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]),
		c_value = function(d) { return d.name;};
}

TuitionChart.prototype.updateChart = function(selectedCollege) {
	var _self = this;
	d3.select(".barGroup").remove(); 
	
	var filteredData = [];
	var noDataAvailable = [];

	this.parentPage.data.collegeData.forEach(function(d) {
		for(var i=0; i<selectedCollege.length; i++)
		{
			if(d.INSTNM == selectedCollege[i])
			{
				if(d.TUITIONFEE_IN != "NULL" && d.TUITIONFEE_OUT != "NULL")
					filteredData.push(d);
				else
					noDataAvailable.push(selectedCollege[i]);
			}
		}
	});
	
	this.noData(noDataAvailable);
	
	if(filteredData.length != 0){
	var x_axis = d3.svg.axis()
    .scale(this.x0)
    .orient("bottom");
    

	var y_axis = d3.svg.axis()
		.scale(this.y)
		.orient("left")
		.tickFormat(d3.format(".2s"));
		
	var tuitionFee = d3.keys(filteredData[0]).filter(function(key) { return (key == "TUITIONFEE_IN" || key == "TUITIONFEE_OUT"); });

	filteredData.forEach(function(d) {
		d.fees = tuitionFee.map(function(name) {
			var temp = d[name];
			if(d[name] == "NULL")
				temp = 0;
			return {name: name, value: +temp}; 
		})
	});

	var g = this.svg.append("g")
				.attr("transform", "translate(" + (this.margin.left + 10) + "," +this.margin.top * 3 + ")")
				.attr("class", "barGroup");
				  
	this.x0.domain(filteredData.map(function(d) { return d.INSTNM; }));
	this.x1.domain(tuitionFee).rangeRoundBands([0, this.x0.rangeBand()]);
	this.y.domain([0, d3.max(filteredData, function(d) { return d3.max(d.fees, function(d) { return d.value; }); })]);

	g.append("g")
	.attr("class", "xaxis")
	.attr("transform", "translate(0," + this.yOffset + ")")
	.call(x_axis)
	.selectAll(".tick text")
	.style("font-size","12px")
	.call(this.wrap, this.x1.rangeBand());
		  
	var yAxis = g.append("g")
				.attr("class", "yaxis")
				.call(y_axis);
	  
	yAxis.selectAll(".tick text")
	.style("font-size","13px");
	
	yAxis.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.style("font-size","13px")
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("Fees($)");

	var college = g.selectAll(".college")
				.data(filteredData)
				.enter().append("g")
				.attr("class", "college")
				.attr("transform", function(d) { return "translate(" + _self.x0(d.INSTNM)  + ",0)"; });
		   
	college.selectAll("rect")
		.data(function(d) { return d.fees; })
		.enter().append("rect")
		.attr("width", this.x1.rangeBand()-10)
		.attr("x", function(d) { return _self.x1(d.name); })
		.attr("y", function(d) { return _self.y(d.value); })
		.attr("height", function(d) { return _self.yOffset - _self.y(d.value); })
		.style("fill", function(d) { return _self.color(c_value(d)); });
		  
	var legend = this.svg.selectAll(".legend")
				.data(tuitionFee.slice().reverse())
				.enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	legend.append("rect")
		.attr("x", this.width - 108)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", this.color);

	legend.append("text")
		.attr("x", this.width - 88)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
		.style("fill", "black")
		.text(function(d) {
			if(d =="TUITIONFEE_OUT")
				return "Outstate Tuition Fee";
			else
				return "Instate Tuition Fee"; });
	}
}

TuitionChart.prototype.wrap = function(text, width) {
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

TuitionChart.prototype.noData = function(noDataAvailable) {
	var htmlContent = "* Tuition fee data currently not available for ";
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
		$(".noDataTuition").html(htmlContent);
	}else{
		$(".noDataTuition").html("");
	}
}