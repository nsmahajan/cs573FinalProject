function ChartPage(data, parentPage){
	this.parentPage = parentPage;
	this.data = data;
	this.selectedCollege = [];
	this.selectedStateCode = [];
	this.tuitionChart = new TuitionChart(this);
	this.pieChart = new pieChart(this);
	this.loanChart = new LoanChart(this);
	this.salaryChart = new SalaryChart(this);
	
	this.schoolFilters = {
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
	
	this.populationFilters = {
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
		},
		"null":{
			selected:true
		}
	}
	
	this.assignButtonListeners();
}

ChartPage.prototype.assignButtonListeners = function() {
	var _self = this;
	$(".loanButton").on("click", function() {
		if(_self.selectedCollege.length == 0){
			alert("Please Select a college");
		}else{
			_self.hideAllCharts();
			$(".loanContainer").show();
			_self.loanChart.updateChart(_self.selectedCollege);
		}
    });
	
	$(".tuitionButton").on("click", function() {
		if(_self.selectedCollege.length == 0){
			alert("Please Select a college");
		}else{
			_self.hideAllCharts();
			$(".tuitionContainer").show();
			_self.tuitionChart.updateChart(_self.selectedCollege);
		}
    });
	
	$(".degreeButton").on("click", function() {
		if(_self.selectedCollege.length == 0){
			alert("Please Select a college");
		}else{
			_self.hideAllCharts();
			$(".rankContainer").show();
			_self.pieChart.updateChart(_self.selectedCollege);
		}
    });
	
	$(".salaryButton").on("click", function() {
		if(_self.selectedCollege.length == 0){
			alert("Please Select a college");
		}else{
			_self.hideAllCharts();
			$(".salaryContainer").show();
			_self.salaryChart.updateChart(_self.selectedCollege);
		}
    });
}

ChartPage.prototype.hideAllCharts = function() {
	$(".tuitionContainer").hide();
	$(".loanContainer").hide();
	$(".salaryContainer").hide();
	$(".rankContainer").hide();
}

ChartPage.prototype.showFilters = function() {
	var _self = this;
	var optionHTML = "";
	
	for(var i = 0; i < this.data.usStates.length; i++){
		if(this.data.usStates[i].name == "Massachusetts")
			optionHTML += '<option selected="selected" value="'+ this.data.usStates[i].name + '">' + this.data.usStates[i].name + '</option>';
		else
			optionHTML += '<option value="'+ this.data.usStates[i].name + '">' + this.data.usStates[i].name + '</option>';
		
	}

	$("#state").html(optionHTML);
	
	this.filterApplied();
	
	$( "#state" ).change(function() {
		_self.filterApplied();
	});
	
	$( "#college" ).change(function() {
		_self.validateData();
	});
	
	$('.schoolCheckbox').change(function() {
		_self.schoolFilters[this.value].selected = $(this).is(':checked');
		_self.filterApplied();
		_self.filterSelectedCollege();
    });
	
	$('.populationCheckbox').change(function() {
		_self.populationFilters[this.value].selected = $(this).is(':checked');
		_self.filterApplied();
		_self.filterSelectedCollege();
    });
}

ChartPage.prototype.filterApplied = function() {
	var optionHTML ="";
	
	for(var i = 0; i < this.data.collegeData.length; i++){
		
		if(this.checkStateCode(this.data.collegeData[i]) && this.checkPopulation(this.data.collegeData[i]) && this.checkSchoolType(this.data.collegeData[i])){
			optionHTML += '<option value="'+ this.data.collegeData[i].INSTNM + '">' + this.data.collegeData[i].INSTNM + '</option>';
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
        o.value = arr[i].v;
        $(o).text(arr[i].t);
    });
}

ChartPage.prototype.filterSelectedCollege = function() {	
	var temp = this.selectedCollege;
	this.selectedCollege = [];
	for(var j=0; j<this.data.collegeData.length; j++)
	{
		for(var i = 0; i < temp.length; i++){		
			if(this.data.collegeData[j].INSTNM == temp[i])
			{
				if(this.checkAllStateCode(this.data.collegeData[j]) && this.checkPopulation(this.data.collegeData[j]) && this.checkSchoolType(this.data.collegeData[j])){
					this.selectedCollege.push(temp[i]);					
				}
			}
		}
	}
	
	if(temp.length != this.selectedCollege.length)
	{
	
		$(".listItem").remove();
		for(var i=0; i<this.selectedCollege.length; i++)
		{
			this.updateSelectedCollege(this.selectedCollege[i]);
		}
		this.updateAllCharts();
	}
	
	
}

ChartPage.prototype.checkStateCode = function(collegeRow){
	var selectedState = $( "#state" ).val();
	this.selectedStateCode.push(selectedState);
	var stateCode;
	for(var i = 0; i < this.data.usStates.length; i++){
		if(this.data.usStates[i].name == selectedState){
			stateCode = this.data.usStates[i].code;
			break;
		}
	}
	
	if(collegeRow.STABBR == stateCode)
		return true;
	
	return false;
}

ChartPage.prototype.checkAllStateCode = function(collegeRow){
	var stateCode;
	for(var i = 0; i < this.data.usStates.length; i++){
		for(var j=0; j<this.selectedStateCode.length; j++)
		{
			if(this.data.usStates[i].name == this.selectedStateCode[j]){
				stateCode = this.data.usStates[i].code;
				break;
			}
		}
	}
	
	if(collegeRow.STABBR == stateCode)
		return true;
	
	return false;
}

ChartPage.prototype.checkSchoolType = function(collegeRow){
	if(((this.schoolFilters["privateNonProfit"].selected == true && this.schoolFilters["privateNonProfit"].value == collegeRow.CONTROL)||
		(this.schoolFilters["privateProfit"].selected == true && this.schoolFilters["privateProfit"].value == collegeRow.CONTROL)||
		(this.schoolFilters["public"].selected == true && this.schoolFilters["public"].value == collegeRow.CONTROL))
		|| (this.schoolFilters["privateNonProfit"].selected == false && 
			this.schoolFilters["privateProfit"].selected == false && 
			this.schoolFilters["public"].selected == false))
		return true;
		
	return false;
}

ChartPage.prototype.checkPopulation = function(collegeRow){
	if(((this.populationFilters["small"].selected == true && this.populationFilters["small"].min <= +collegeRow.UGDS && +collegeRow.UGDS < this.populationFilters["small"].max)||
		(this.populationFilters["medium"].selected == true && this.populationFilters["medium"].min <= +collegeRow.UGDS && +collegeRow.UGDS <= this.populationFilters["medium"].max)||
		(this.populationFilters["large"].selected == true && this.populationFilters["large"].min < +collegeRow.UGDS) ||
		(this.populationFilters["null"].selected == true && collegeRow.UGDS == "NULL")) 
		|| (this.populationFilters["small"].selected == false && 
			this.populationFilters["medium"].selected == false && 
			this.populationFilters["large"].selected == false && 
			this.populationFilters["null"].selected == false))
		return true;
		
	return false;
}


ChartPage.prototype.updateSelectedCollege = function(college){
	var _self = this;
	$(".deleteButton").off();
	
	
	var optionHTML = '<div class="listItem"><div class="name" style="width: 93%">' + college + '</div><div class="deleteButton"></div></div>';
	$(".listOfSelectedColleges").append(optionHTML);
	
	$(".deleteButton").on("click", function() {
		var deletedCollege = $(this).parent().find(".name").html();
		$(this).parent().remove();
		_self.collegeRemoved(deletedCollege);
    });
}

ChartPage.prototype.deleteUnSelectedCollege = function(college){
	
	
}

ChartPage.prototype.collegeRemoved = function(collegeName){
	var index = this.selectedCollege.indexOf(collegeName);
	
	if (index > -1) {
		this.selectedCollege.splice(index, 1);
		this.updateAllCharts();
	}
}

ChartPage.prototype.updateAllCharts = function(){
	this.tuitionChart.updateChart(this.selectedCollege);
	this.loanChart.updateChart(this.selectedCollege);
	this.salaryChart.updateChart(this.selectedCollege);
	this.pieChart.updateChart(this.selectedCollege);
}

ChartPage.prototype.validateData = function(){
	var collegeName = $( "#college" ).val();
	
	if(this.selectedCollege.length == 10){
		alert("Maximum 10 colleges can be compared!!!");
	}else if(this.selectedCollege.indexOf(collegeName) != -1)
		alert("You have already selected this college");
	else{
		this.selectedCollege.push(collegeName);
		this.updateSelectedCollege(collegeName);
		this.updateAllCharts();
	}
}