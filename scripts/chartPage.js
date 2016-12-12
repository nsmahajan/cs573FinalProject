function ChartPage(data, parentPage){
	this.parentPage = parentPage;
	this.data = data;
	this.selectedCollege = [];
	this.selectedStateCode = [];
	this.selectedSchoolType = [];
	this.tuitionChart = new TuitionChart(this);
	this.tableChart = new TableChart(this);
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
	this.selectedSchoolType.push(1);
	this.selectedSchoolType.push(2);
	this.selectedSchoolType.push(3);
	this.loadFilter();
	this.showTableChart();
}

ChartPage.prototype.loadFilter = function() {
	var _self = this;
	var optionHTML = "";
	
	for(var i = 0; i < this.data.usStates.length - 9; i++){
			this.selectedStateCode.push(this.data.usStates[i].code);
			optionHTML += '<option selected = "selected" value="'+ this.data.usStates[i].name + '">' + this.data.usStates[i].name + '</option>';
	}
	$("#state").html(optionHTML);
	
	var temp=[];

	$('#state').multiselect({
			maxHeight: 300,
			includeSelectAllOption: true,
            enableClickableOptGroups: true
    });
		
	$( "#state" ).change(function() {
		var temp =($( "#state" ).val());
		_self.updateSelectedStateCode(temp);
	});
	$('.schoolCheckbox').change(function() {
		var temp = _self.selectedSchoolType;
		_self.selectedSchoolType =[];
		_self.schoolFilters[this.value].selected = $(this).is(':checked');
		
			if((_self.schoolFilters['privateNonProfit'].selected== true))
			{				
				_self.selectedSchoolType.push(3);
			}
			if((_self.schoolFilters['privateProfit'].selected== true))
			{
				_self.selectedSchoolType.push(2);
			}
			if((_self.schoolFilters['public'].selected == true))
			{
				_self.selectedSchoolType.push(1);
			}
			if(_self.selectedSchoolType.length == 0)
			{
				_self.selectedSchoolType.push(1);
				_self.selectedSchoolType.push(2);
				_self.selectedSchoolType.push(3);
			}
		_self.updateSelectedSchoolType();
		_self.showTableChart();
		_self.updateAllCharts();
		
    });
}

ChartPage.prototype.updateSelectedStateCode = function(temp) {
	var _self = this;
	this.selectedStateCode = [];
	if(temp != null)
	{
		for(var i = 0; i < this.data.usStates.length; i++){
			for(var j=0; j<temp.length; j++)
			{
				if(this.data.usStates[i].name == temp[j]){
					this.selectedStateCode.push(this.data.usStates[i].code);				
				}
			}
		}
		
		this.showTableChart();
		this.updateAllCharts();
	}
	
	if(temp == null)
	{
		_self.showTableChart();
		_self.updateAllCharts();
		
	}
		
	if(this.selectedCollege != null)
	{
		var temp = this.selectedCollege;
		this.selectedCollege = [];
		for(var i = 0; i < this.selectedStateCode.length; i++){
			
			for(var j=0; j<temp.length; j++)
			{
				for(var k=0; k<this.data.collegeData.length; k++)
				{
					for(var l=0; l<this.selectedSchoolType.length; l++){
						if((this.selectedStateCode[i] == this.data.collegeData[k].STABBR) && (temp[j] == this.data.collegeData[k].INSTNM) && ((this.selectedSchoolType[l] == this.data.collegeData[k].CONTROL))){
							this.selectedCollege.push(this.data.collegeData[k].INSTNM);				
						}
					}
				}
			}
		}
	}
	
	if(this.selectedCollege.length != temp.length)
	{
		$(".listItem").remove();
		for(var i=0; i<this.selectedCollege.length; i++)
		{
			this.updateSelectedCollegeList(this.selectedCollege[i]);
		}
	}
	
}

ChartPage.prototype.updateSelectedSchoolType = function()
{
	
	if(this.selectedCollege != null)
	{
		var temp = this.selectedCollege;
		this.selectedCollege = [];
		for(var i = 0; i < this.selectedStateCode.length; i++){
			
			for(var j=0; j<temp.length; j++)
			{
				for(var k=0; k<this.data.collegeData.length; k++)
				{
					for(var l=0; l<this.selectedSchoolType.length; l++){
						if((this.selectedStateCode[i] == this.data.collegeData[k].STABBR) && (temp[j] == this.data.collegeData[k].INSTNM) && ((this.selectedSchoolType[l] == this.data.collegeData[k].CONTROL))){
							this.selectedCollege.push(this.data.collegeData[k].INSTNM);				
						}
					}
				}
			}
		}
	}
	
	if(this.selectedCollege.length != temp.length)
	{
		$(".listItem").remove();
		for(var i=0; i<this.selectedCollege.length; i++)
		{
			this.updateSelectedCollegeList(this.selectedCollege[i]);
		}
	}
	
}
ChartPage.prototype.showTableChart = function() {
	this.tableChart.updateChart(this.selectedStateCode,this.selectedSchoolType);
}

ChartPage.prototype.collegeSelected = function(college){
	this.validateData(college);
}

ChartPage.prototype.updateSelectedCollegeList = function(college){
	var _self = this;
	$(".deleteButton").off();
	
	
	var optionHTML = '<div class="listItem"><div class="name" style="width: 93%">' + college + '</div><div class="deleteButton"></div></div>';
	$(".listOfSelectedColleges").append(optionHTML);
	
	$(".deleteButton").on("click", function() {
		var deletedCollege = $(this).parent().find(".name").text();
		$(this).parent().remove();
		_self.collegeRemoved(deletedCollege);
    });
}

ChartPage.prototype.collegeRemoved = function(collegeName){
	var index = this.selectedCollege.indexOf(collegeName);

	if (index > -1) {
		this.selectedCollege.splice(index, 1);
		this.updateAllCharts();
	}
}

ChartPage.prototype.updateAllCharts = function(){
	this.tuitionChart.updateChart(this.selectedCollege,this.selectedStateCode,this.selectedSchoolType);
	this.loanChart.updateChart(this.selectedCollege,this.selectedStateCode,this.selectedSchoolType);
	this.salaryChart.updateChart(this.selectedCollege,this.selectedStateCode,this.selectedSchoolType);
}

ChartPage.prototype.validateData = function(collegeName){
	if(this.selectedCollege.length == 10){
		alert("Maximum 10 colleges can be compared!!!");
	}else if(this.selectedCollege.indexOf(collegeName) != -1)
		alert("You have already selected this college");
	else{
		this.selectedCollege.push(collegeName);
		this.updateSelectedCollegeList(collegeName);
		this.updateAllCharts();
	}
}