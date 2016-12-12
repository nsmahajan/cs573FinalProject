function TuitionChart(parentPage){
	this.parentPage = parentPage;

	this.svg = d3.select(".barChart");
	this.margin = {top: 20, right: 20, bottom: 200, left: 40};
	this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
	this.height = +this.svg.attr("height") - (this.margin.top * 3) - this.margin.bottom;

	this.yOffset = this.height;

	this.x0 = d3.scale.ordinal()
		//.rangeRoundBands([0, this.width],0.5);

	this.x1 = d3.scale.ordinal();

	this.y = d3.scale.linear()
		.range([this.yOffset, 0]);

	this.color = d3.scale.ordinal()
		.range(["#66c2a5","#fc8d62"]),
		c_value = function(d) { return d.name;};
}

TuitionChart.prototype.updateChart = function(selectedCollege,state,school) {
	var _self = this;
	d3.select(".barGroup").remove(); 
	this.svg.selectAll('.legend').remove();
	
	if(selectedCollege.length > 0)
	{
	
	var filteredData = [];
	var noDataAvailable = [];

	this.parentPage.data.collegeData.forEach(function(d) {
		for(var i=0; i<selectedCollege.length; i++)
		{
			for(var j=0; j<state.length; j++)
			{
				for(var k=0; k<school.length; k++)
				{
				if((d.INSTNM == selectedCollege[i])&&(d.STABBR == state[j]) && d.CONTROL == school[k])
				{
					if(d.TUITIONFEE_IN != "NULL" && d.TUITIONFEE_OUT != "NULL")
						filteredData.push(d);
					else
						noDataAvailable.push(selectedCollege[i]);
				}
			}
			}
		}	
	});
	
	this.noData(noDataAvailable);
	
	if(filteredData.length != 0){
		
		if(filteredData.length < 3){
			this.x0.rangeRoundBands([0, this.width],0.5);
		}else if(filteredData.length >= 3 && filteredData.length < 6){
			this.x0.rangeRoundBands([0, this.width],0.3);
		}else{
			this.x0.rangeRoundBands([0, this.width],0.1);
		}
		
	var tooltip = d3.select('body').append('div')
				.attr('class', 'hidden d3-tip');
				
		
	var x_axis = d3.svg.axis()
    .scale(this.x0)
	.ticks(0)
    .orient("bottom");
    

	var y_axis = d3.svg.axis()
		.scale(this.y)
		.orient("left")
		.tickFormat(d3.format(".2s"));
		
	var tuitionFee = d3.keys(filteredData[0]).filter(function(key) { return (key == "TUITIONFEE_IN" || key == "TUITIONFEE_OUT"); });

	filteredData.sort(function(a,b) {
		return (+a.TUITIONFEE_OUT + +a.TUITIONFEE_IN) - (+b.TUITIONFEE_IN + +b.TUITIONFEE_OUT);});

	
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
	.selectAll("text").remove();
			
	var yAxis = g.append("g")
				.attr("class", "yaxis")
				.call(y_axis);
	  
	yAxis.selectAll(".tick text")
	.style("font-size","0.9em");
	
	yAxis.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.style("font-size","0.9em")
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("Fees($)");

	var college = g.selectAll(".college")
				.data(filteredData)
				.enter().append("g")
				.attr("class", "college")
				.attr("transform", function(d) { return "translate(" + _self.x0(d.INSTNM)  + ",0)"; })
				.on('mousemove', function(d) {
					var mouse = d3.mouse(this);
					tooltip.classed('hidden', false)
						.attr('style', 'left:' + (mouse[0] + 190) +
								'px; top:' + (mouse[1] + 430) + 'px')
						.html(d.INSTNM);
				})
				.on('mouseout', function() {
					tooltip.classed('hidden', true);
				});

		   
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
		.attr("x", this.width - 200)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", this.color);

	legend.append("text")
		.attr("x", this.width - 170)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
		.style("fill", "black")
		.style("font-size","0.9em")
		.text(function(d) {
			if(d =="TUITIONFEE_OUT")
				return "Outstate Tuition Fee";
			else
				return "Instate Tuition Fee"; });
	}
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