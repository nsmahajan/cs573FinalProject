/**
 * Created by kartik on 12/7/16.
 */
function pieChart(parentPage){
    this.parentPage = parentPage;
}
pieChart.prototype.updateChart = function(selectedCollege) {
    var _self = this;

    var headers = ["PCIP01", "PCIP03", "PCIP04", "PCIP05", "PCIP09", "PCIP10", "PCIP11", "PCIP12", "PCIP13", "PCIP14", "PCIP15", "PCIP16",
        "PCIP19", "PCIP22", "PCIP23", "PCIP24", "PCIP25", "PCIP26", "PCIP27", "PCIP29", "PCIP30", "PCIP31", "PCIP38", "PCIP39",
        "PCIP40", "PCIP41", "PCIP42", "PCIP43", "PCIP44", "PCIP45", "PCIP46", "PCIP47", "PCIP48", "PCIP49", "PCIP50", "PCIP51",
        "PCIP52", "PCIP54"];

    var selectedState=this.parentPage.selectedStateCode[0];
    var stateCode=""
    var dat = this.parentPage.data.collegeData;
    var courses = this.parentPage.data.courses;
    var result = [];
    var noDataAvailable = [];
    var students = [];
    var filtereddata=[];

    for(var i = 0; i < this.parentPage.data.usStates.length; i++){
        if(this.parentPage.data.usStates[i].name == selectedState){
            stateCode = this.parentPage.data.usStates[i].code;
            break;
        }
    }
    dat.forEach(function(d) {
        if(d.STABBR == stateCode)
            filtereddata.push(d);
        }
    );

    var grid;
    var columns = [
        {id: "Institution", name: "Institution", field: "institution"},
        {id: "Admission rate", name: "Admission rate", field: "admission_rate"},
        {id: "In state", name: "In state", field: "in_state"},
        {id: "Out State", name: "Out State", field:"out_state"}
    ];
    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false
    };


    lines=filtereddata;
    // for (var i = 0; i < lines.length; i++) {
    //     var obj = {},
    //         stud_obj = {};
    //     var tempResult = [];
    //     var dataAllNull = true;
    //     var currentline = lines[i];
    //     for (var j = 0; j < headers.length; j++) {
    //         for (var key in currentline) {
    //             for (var course in courses) {
    //                 if ((key == headers[j]) && (currentline.hasOwnProperty(key)) && (courses[course].code == key)) {
    //                     if (currentline[key] != "0" && currentline[key] != "NULL") {
    //                         dataAllNull = false;
    //                         obj = {};
    //                         stud_obj = {};
    //                         obj["key"] = courses[course].course;
    //                         obj["college"] = currentline.INSTNM;
    //                         obj["value"] = +currentline[key];//+((+currentline[key] * 100).toFixed(2));
    //                         //result.push(obj);
    //                         stud_obj["key"] = courses[course].course;
    //                         stud_obj["college"] = currentline.INSTNM;
    //                         stud_obj["value"] = currentline.UGDS;
    //                         tempResult.push(obj);
    //                         students.push(stud_obj);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //
    //     if (dataAllNull == true) {
    //         noDataAvailable.push(currentline.INSTNM);
    //     } else {
    //         for (var k = 0; k < tempResult.length; k++)
    //             result.push(tempResult[k]);
    //     }
    // }



    var data=filtereddata.map(function (d) {
        return {"institution":d.INSTNM,"admission_rate":d.ADM_RATE,"in_state":d.TUITIONFEE_IN
            ,"out_state":d.TUITIONFEE_OUT}

    });
    console.log(data);
    grid = new Slick.Grid("#myGrid", data, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel());
    grid.onClick.subscribe(function (e) {
        var cell = grid.getCellFromEvent(e);
        console.log(cell.row);//Here is the row id, I want to change this row background color
        grid.setSelectedRows(cell.row);
        e.stopPropagation();

    });

    console.log(grid);


}

