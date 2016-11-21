var dataset;
var selectedCollege=[];
var stateData;
var schoolFilters = {
	"privateNonProfit":{
		selected: true,
		value:3
	},
	"privateProfit":{
		selected:true,
		value:2
	},
	"public":{
		selected:true,
		value:1
	}
}

var populationFilters = {
	"small":{
		selected: true,
		min:0,
		max:2000
	},
	"medium":{
		selected:true,
		min:2001,
		max:10000
	},
	"large":{
		selected:true,
		min:10001
	}
}

var g,svg, yOffset, x0, x1, y, margin, width, height, color;
$( document ).ready(function() {
	loadData();
});


function loadData(){
	d3.queue()
  .defer(d3.csv, "collegeData.csv")
  .defer(d3.tsv, "us-state-names.tsv")
  .await(function(error, file1, file2) {
    if (error) {
        console.error('Oh dear, something went wrong: ' + error);
    }
    else {
		
		dataset = file1;
		showBarChart(selectedCollege);
		  
		stateData = file2;
		updateStateMenu(file2); 
    }
  });
}

function updateStateMenu(data){
	var optionHTML = "";
	
	for(var i = 0; i < data.length; i++){
		if(data[i].name == "Massachusetts")
			optionHTML += '<option selected="selected" value="'+ data[i].name + '">' + data[i].name + '</option>';
		else
			optionHTML += '<option value="'+ data[i].name + '">' + data[i].name + '</option>';
		
	}
	
	$("#state").html(optionHTML);
	
	//stateChanged();
	filterApplied();
	
	$( "#state" ).change(function() {
		//stateChanged();
		filterApplied();
	});
	
	$( "#college" ).change(function() {
		selectedCollege.push($( "#college" ).val());
		//updateBarChart();
        slopeChart();
	});
	
	$('.schoolCheckbox').change(function() {
		var schoolType = this.value;
		schoolFilters[schoolType].selected = $(this).is(':checked');
		//filterSchoolType();
		filterApplied();
    });
	
	$('.populationCheckbox').change(function() {
		var populationSize = this.value;
		populationFilters[populationSize].selected = $(this).is(':checked');
		//filterPopulationType();
		filterApplied();
    });
}

/*function filterPopulationType(){
	
}

function filterSchoolType(){
	
}

function stateChanged(){
	var selectedState = $( "#state" ).val();
	var stateCode;
	for(var i = 0; i < stateData.length; i++){
		if(stateData[i].name == selectedState){
			stateCode = stateData[i].code;
			break;
		}
	}
	
	populateUniversityData(stateCode);
}*/

function filterApplied(){
	var optionHTML ="";
	
	for(var i = 0; i < dataset.length; i++){
		if(checkStateCode(dataset[i]) && checkPopulation(dataset[i]) && checkSchoolType(dataset[i])){
			optionHTML += '<option value="'+ dataset[i].INSTNM + '">' + dataset[i].INSTNM + '</option>';
		}
	}
	
	//console.log(optionHTML);
	$("#college").html(optionHTML);
	
	var options = $('select.college option');
    var arr = options.map(function(_, o) {
        return {
            t: $(o).text(),
            v: o.value
        };
    }).get();
    arr.sort(function(o1, o2) {
        return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
    });
    options.each(function(i, o) {
        o.value = arr[i].v;
        $(o).text(arr[i].t);
    });
}

function checkStateCode(collegeRow){
	var selectedState = $( "#state" ).val();
	var stateCode;
	for(var i = 0; i < stateData.length; i++){
		if(stateData[i].name == selectedState){
			stateCode = stateData[i].code;
			break;
		}
	}
	
	if(collegeRow.STABBR == stateCode)
		return true;
	
	return false;
}

function checkSchoolType(collegeRow){
	if((schoolFilters["privateNonProfit"].selected == true && schoolFilters["privateNonProfit"].value == collegeRow.CONTROL)||
		(schoolFilters["privateProfit"].selected == true && schoolFilters["privateProfit"].value == collegeRow.CONTROL)||
		(schoolFilters["public"].selected == true && schoolFilters["public"].value == collegeRow.CONTROL))
		return true;
		
	return false;
}

function checkPopulation(collegeRow){
	if((populationFilters["small"].selected == true && populationFilters["small"].min <= collegeRow.UGDS && collegeRow.UGDS < populationFilters["small"].max)||
		(populationFilters["medium"].selected == true && populationFilters["medium"].min <= collegeRow.UGDS && collegeRow.UGDS <= populationFilters["medium"].max)||
		(populationFilters["large"].selected == true && populationFilters["large"].min < collegeRow.UGDS))
		return true;
		
	return false;
}

/*function populateUniversityData(stateCode){
	var optionHTML = "";
	
	for(var i = 0; i < dataset.length; i++){
		if(dataset[i].STABBR == stateCode){
			optionHTML += '<option value="'+ dataset[i].INSTNM + '">' + dataset[i].INSTNM + '</option>';
		}
	}
	$("#college").html(optionHTML);
	
	var options = $('select.college option');
    var arr = options.map(function(_, o) {
        return {
            t: $(o).text(),
            v: o.value
        };
    }).get();
    arr.sort(function(o1, o2) {
        return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
    });
    options.each(function(i, o) {
        //console.log(i);
        o.value = arr[i].v;
        $(o).text(arr[i].t);
    });
	
}*/

function showBarChart()
{	
		g = d3.select(".barChart"); 
		margin = {top: 20, right: 20, bottom: 100, left: 40};
		width = +g.attr("width") - margin.left - margin.right;
		height = +g.attr("height") - margin.top - margin.bottom;

		yOffset = height - 200;

		x0 = d3.scaleBand()
		.range([0, width])
		.padding(0.1);

		x1 = d3.scaleBand();

		y = d3.scaleLinear()
		.range([yOffset, 0]);

		color = d3.scaleOrdinal()
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
}

function updateBarChart(){
	d3.select(".barGroup").remove(); 
	
	var filteredData = [];

	dataset.forEach(function(d) {
		for(var i=0; i<selectedCollege.length; i++)
		{
			if(d.INSTNM == selectedCollege[i])
			{
				filteredData.push(d);
			}
		}
	});
	
	var tuitionFee = d3.keys(filteredData[0]).filter(function(key) { return (key == "TUITIONFEE_IN" || key == "TUITIONFEE_OUT"); });
    console.log(tuitionFee);

		filteredData.forEach(function(d) {
			d.fees = tuitionFee.map(function(name) {
			var temp = d[name];
			if(d[name] == "NULL")
				temp = 0;
			return {name: name, value: +temp}; 
			})
		});

	svg = g.append("g")
				  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				  .attr("class", "barGroup");
				  
		x0.domain(filteredData.map(function(d) { return d.INSTNM; }));
		x1.domain(tuitionFee).range([0, x0.bandwidth()]);
		y.domain([0, d3.max(filteredData, function(d) { return d3.max(d.fees, function(d) { return d.value; }); })]);

		svg.append("g")
		  .attr("class", "xaxis")
		  .attr("transform", "translate(0," + yOffset + ")")
		  .call(d3.axisBottom(x0))
		  .selectAll(".tick text")
      .call(wrap, x1.bandwidth());
		  
		var yAxis = svg.append("g")
		  .attr("class", "yaxis")
		  .call(d3.axisLeft(y));
		  
		  yAxis.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("Fees($)");

		var college = svg.selectAll(".college")
		  .data(filteredData)
		  .enter().append("g")
		  .attr("class", "college")
		  .attr("transform", function(d) { return "translate(" + x0(d.INSTNM)  + ",0)"; });
		   
		  
		college.selectAll("rect")
		  .data(function(d) { return d.fees; })
		  .enter().append("rect")
		  .attr("width", x1.bandwidth())
		  .attr("x", function(d) { return x1(d.name); })
		  .attr("y", function(d) { return y(d.value); })
		  .attr("height", function(d) { return yOffset - y(d.value); })
		  .style("fill", function(d) { return color(d.name); });
		  
		  var legend = svg.selectAll(".legend")
		  .data(tuitionFee.slice().reverse())
		.enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		  .attr("x", width - 18)
		  .attr("width", 18)
		  .attr("height", 18)
		  .style("fill", color);

		legend.append("text")
		  .attr("x", width - 24)
		  .attr("y", 9)
		  .attr("dy", ".35em")
		  .style("text-anchor", "end")
		  .text(function(d) { return d; });
		
}

function wrap(text, width) {
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
function slopeChart(){
    g = d3.select(".slopeChart");
    margin = {top: 20, right: 20, bottom: 100, left: 40};
    width = +g.attr("width") - margin.left - margin.right;
    height = +g.attr("height") - margin.top - margin.bottom;
    yOffset = height - 150;
    gutter = 50;

    strokeColour = 'black',
        format=d3.format(''),
    sets=0;

    var filteredData = [];

    dataset.forEach(function(d) {
        for(var i=0; i<selectedCollege.length; i++)
        {
            if(d.INSTNM == selectedCollege[i])
            {
                filteredData.push(d);
            }
        }
    });

    var parsed_data=filteredData.map(function (d) {
        return {
            key: d["INSTNM"],
            value: {
                fedpercent: d["PCTFLOAN"],
                bellpercent: d["PCTPELL"]
            }
        }

    });
	console.log(parsed_data);

    sets = parsed_data.length -1;

    yScale = d3.scale.linear()
        .domain([0, 100])
        .range([yOffset, 0]);

    render(parsed_data, 0);

    function render (data, n) {
        console.log("hello");
        if (n < data.length-1 ) {
            lines(data, n);
            middleLabels(data, n);
            return render(data, n+1);
        } else {
            //startLabels(data);
            //endLabels(data);
            return n;
        }
    }

    function lines(data, n) {

        var lines = g.selectAll('.s-line-' + n)
            .data(data);



        lines.enter().append('line');

        console.log(lines);


        lines.attr({
            x1: function () {

                if (n === 0) {
                    return margin.left;
                } else {
                    return ((width / sets) * n) + margin.left/2;
                }
            },
            y1: function() { return yScale(data[n].value.fedpercent); },
            x2: function () {
                if (n === sets-1) {
                    return width - margin.right;
                } else {
                    return ((width / sets) * (n+1)) - gutter;
                }
            },
            y2: function() { return yScale(data[n+1].value.fedpercent); },
            stroke: strokeColour,
            'stroke-width': 1,
            class: function (d, i) { return 'elm s-line-' + n + ' sel-' + i; }
        });
        // lines.exit().remove();
    }

    function middleLabels(data, n) {

        if (n !== sets-1) {
            var middleLabels = svg.selectAll('.m-labels-' + n)
                .data(data);

            middleLabels.enter().append('text')
                .attr({
                    class: function () { return 'labels m-labels-' + n + ' elm ' + 'sel-'; },
                    x: ((width / sets) * (n+1)) + 15,
                    y: function() { return yScale(data[n+1].value.fedpercent) + 4; },
                })

                .text(function () {
                    return format(data[n+1].value.fedpercent);
                })
                .style('text-anchor','end');

            // title
            svg.append('text')
                .attr({
                    class: 's-title',
                    x: ((width / sets) * (n+1)),
                    y: margin.top/2
                })
                .text(data[n].key)
                .style('text-anchor','end');
        }
    }

}






