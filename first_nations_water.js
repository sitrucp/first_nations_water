//url = 'https://www.sac-isc.gc.ca//DAM/DAM-ISC-SAC/DAM-WTR/STAGING/texte-text/lTDWA_map_data_1572010201618_eng.txt';

const url = './lTDWA_map_data_1572010201618_eng.txt';
const colorLifted = 'rgba(99, 110, 250,.7)';
const colorCurrent = 'rgba(239, 85, 59,.7)';

// Called by fetchData(); below
// Future: maybe call after filter applied? maybe change this from const to function?
const fetchData = async () => {
    const response = await fetch(url)
    const data = await response.json()
    
    // filter out NT & YT records
    dataAll = data.data.filter(function (item) {
        if (item.RegionAcronym != "NT" && item.RegionAcronym != "YT") {
            return true;
        }
        else {
            return false;
        }
    })

    // GET ONLY LTDWACurrent & LTDWALifted ELEMENTS
    // should be ~160 records
    // add some new key values to arrays for reports
    const arrLTDWA = [];
    dataAll.forEach(community => {
        if (community.LTDWACurrent != null) {
            community.LTDWACurrent.forEach(function (waterCurrent) {
                waterCurrent['Status'] = 'Current';
                waterCurrent['Province'] = community['Province'];
                waterCurrent['CommunityNum'] = community['CommunityNum'];
                arrLTDWA.push(waterCurrent);
            });
        }
        if (community.LTDWALifted != null) {
            community.LTDWALifted.forEach(function (waterLifted) {
                waterLifted['Status'] = 'Lifted';
                waterLifted['Province'] = community['Province'];
                waterLifted['CommunityNum'] = community['CommunityNum'];
                arrLTDWA.push(waterLifted);
            });
        }
    });

    /////// ADD MORE NEW COLUMNS TO ARRAY & FIX EXISTING COLUMNS
    arrLTDWA.forEach(function(d) {
        d.DateSet_YYYY = d.DateSet.substring(0, 4)
        d.DateSet_YYYY_MM = d.DateSet.substring(0, 7)
        d.DateExpected_YYYY = d.DateExpected.substring(0, 4)
        d.DateExpected_YYYY_MM = d.DateExpected.substring(0, 7)
        if (d.DateExpected) {
            d.AdvisoryDuration = monthDiff(new Date(d.DateSet), new Date(d.DateExpected))
        } else {
            d.AdvisoryDuration = monthDiff(new Date(d.DateSet), new Date())
        }
        d.CorrectiveMeasure = d.CorrectiveMeasure.replace(/(\r\n|\n|\r)/gm, "")
        d.PopulatioEstimated = popReplace(d.PopulatioEstimated);
        d.Region = titleCase(d.Region);
        d.Province = titleCase(d.Province);
    });

    // CREATE TOTAL, CURRENT & LIFTED ADVISORIES COUNTS
    const totalLTDWAs = arrLTDWA.length;
    const totalLTDWALifted = arrLTDWA.filter(function(item){
        return item['Status'] == 'Lifted';}).length;
    const totalLTDWACurrent = arrLTDWA.filter(function(item){
        return item['Status'] == 'Current';}).length;
    const pctLifted = Math.round(totalLTDWALifted / totalLTDWAs * 100) + '%';
    const pctCurrent = Math.round(totalLTDWACurrent / totalLTDWAs * 100) + '%';

    // CREATE FIRST NATIONS SECTION DATA & CHARTS
    // * count unique CommunityName that have 1+ advisory(s)
    // 80 lifted, 32 in effect

    // CREATE ADVISORIES SECTION DATA & CHARTS
    // * would be great to do stacked charts by lifted & current advisories!
    // 1) update getXYarrays to create 4 arrays - arrXlifted, arrXcurrent,arrYlifted, arrYcurrent
    // 2) update createChart to create stacked bar chart - create two traces, then var data = [trace1, trace2]; 

    // add content to index.html
    document.getElementById('last_update').innerHTML += 'Data updated: ' + data['GenerateDate'];
    document.getElementById('total_advisories').innerHTML += 'Total advisories: ' + totalLTDWAs;
    document.getElementById('lifted_advisories').innerHTML += 'Lifted advisories: ' + totalLTDWALifted + ' (' + pctLifted + ')';
    document.getElementById('current_advisories').innerHTML += 'Current advisories: ' + totalLTDWACurrent + ' (' + pctCurrent + ')';

    // create charts
    createChart(arrLTDWA, 'AdvisoryType', 'Advisory Type', 'div_chart_type', 'h');
    createChart(arrLTDWA, 'Province', 'Province', 'div_chart_province', 'h');
    createChart(arrLTDWA, 'LongPhase', 'Project Phase', 'div_chart_phase', 'h');
    createChart(arrLTDWA, 'PopulatioEstimated', 'Community Population', 'div_chart_population', 'h');
    createChart(arrLTDWA, 'DateSet_YYYY', 'Date Advisory Set', 'div_chart_date_set', 'v');
    //createChart(arrLTDWA, 'CommunityName', 'Community Name', 'div_chart_community', 'h');

    // create table
    createTable(arrLTDWA);

    // Advisories duration histogram
    const arrAdvisoryDurationLifted = [];
    const arrAdvisoryDurationCurrent = [];

    // create lifted and current arrays
    arrLTDWALifted = arrLTDWA.filter(function (item) {
        if (item.Status == 'Lifted') {return true;}
        else {return false;}
    })
    arrLTDWACurrent = arrLTDWA.filter(function (item) {
        if (item.Status == 'Current') {return true;}
        else {return false;}
    })

    // create duration histogram data
    for (let i = 0; i < arrLTDWALifted.length; i++) {
        arrAdvisoryDurationLifted.push(arrLTDWALifted[i]['AdvisoryDuration']);
    }
    for (let i = 0; i < arrLTDWACurrent.length; i++) {
        arrAdvisoryDurationCurrent.push(arrLTDWACurrent[i]['AdvisoryDuration']);
    }

    // configure chart lifted and current traces
    var dataAdvisoryDurationLifted = {
        x: arrAdvisoryDurationLifted,
        type: 'histogram',
        marker:{
            color: colorLifted
        },
        name: 'Lifted',
        hoverlabel: {
            namelength :-1
        },
        showgrid: false,
    }

    var dataAdvisoryDurationCurrent = {
        x: arrAdvisoryDurationCurrent,
        type: 'histogram',
        marker:{
            color: colorCurrent
        },
        name: 'Current',
        hoverlabel: {
            namelength :-1
        },
        showgrid: false,
    }

    // combine chart traces into chart data
    var dataAdvisoryDuration = [dataAdvisoryDurationLifted, dataAdvisoryDurationCurrent];

    // configure chart layout
    var layout = {
        title: 'Advisory Duration (Months)',
        //paper_bgcolor: 'rgba(245,246,249,1)',
        //plot_bgcolor: 'rgba(245,246,249,1)',
        //width: 400,
        //height: 300,
        margin: {
            l: 120,
        //    r: 40,
        //    b: 40,
        //    t: 40
        },
        barmode: 'stack',
        bargap: 0.05, 
        bargroupgap: 0.2,
        autosize: true,
        autoscale: false,
        showlegend: false,
        //annotations: [],
        yaxis: { 
            tickfont: {
                size: 11
            },
            showgrid: false,
            ticksuffix: " ",
        },
        xaxis: { 
            title: {
                text: '', //'count',
                font: {
                    size: 11,
                },
            },
            tickfont: {
                size: 11
            },
            showgrid: false,
            rangemode: 'tozero',
        },
    };
    Plotly.newPlot('div_chart_advisory_duration', dataAdvisoryDuration, layout);

    // table input form filter & reset
    $(function() {
        $("#table_filter").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#table_advisories > tbody > tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    });
    $('#table_filter_reset').click(function(){
        $('tbody > tr').show();
    });

}

// call get data and charts
fetchData();


////////// FUNCTIONS

function popReplace(popCategory) {
    var mapObj = {
        '0 to 100 people': '1) 0 to 100',
        '0 to 50 people': '1) 0 to 100',
        '51 to 100 people': '1) 0 to 100',
        '101 to 200 people': '2) 101 to 500',
        '101 to 500 people': '2) 101 to 500',
        '201 to 500 people': '2) 101 to 500',
        '501 to 1000 people': '3) 501 to 1000',
        '1001 or more people': '4) 1001 or more',
        'Unknown': '5) Unknown'
    };
    var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
    str = popCategory.replace(re, function(matched){
        return mapObj[matched];
    });
    return str
}


function getXYarrays(arrName, columnName){

    arrNameLifted = arrName.filter(function (item) {
        if (item.Status == 'Lifted') {return true;}
        else {return false;}
    })

    arrNameCurrent = arrName.filter(function (item) {
        if (item.Status == 'Current') {return true;}
        else {return false;}
    })

    const arrLifted = d3.nest()
    .key(function(d) { return d[columnName]; })
    .rollup(function(i) { return i.length; })
    .entries(arrNameLifted)
    .map(function(group) {
        return {
        group: group.key,
        count: group.value
        }
    })

    const arrCurrent = d3.nest()
    .key(function(d) { return d[columnName]; })
    .rollup(function(i) { return i.length; })
    .entries(arrNameCurrent)
    .map(function(group) {
        return {
        group: group.key,
        count: group.value
        }
    })

    arrLifted.sort((a, b) => b.group.toLowerCase() > a.group.toLowerCase() ? 1 : -1);
    arrCurrent.sort((a, b) => b.group.toLowerCase() > a.group.toLowerCase() ? 1 : -1);

    const arrLiftedGroup = [];
    const arrLiftedCount = [];
    const arrCurrentGroup = [];
    const arrCurrentCount = [];

    for (var i=0; i<arrLifted.length; i++) {
        var row = arrLifted[i];
        if (columnName == 'AdvisoryType') {
            arrLiftedGroup.push(row['group'].replace(' advisory',''));
        } else {
            arrLiftedGroup.push(row['group']);
        }
        arrLiftedCount.push(parseInt(row['count']));
    }

    for (var i=0; i<arrCurrent.length; i++) {
        var row = arrCurrent[i];
        if (columnName == 'AdvisoryType') {
            arrCurrentGroup.push(row['group'].replace(' advisory',''));
        } else {
            arrCurrentGroup.push(row['group']);
        }
        arrCurrentCount.push(parseInt(row['count']));
    }

    return [arrLiftedGroup, arrLiftedCount, arrCurrentGroup, arrCurrentCount]
 }


function createChart(arrName, columnName, chartName, divName, chartOrient) {
    if (chartOrient == 'h') {
        xArrLifted = getXYarrays(arrName, columnName)[1];
        yArrLifted = getXYarrays(arrName, columnName)[0];
        xArrCurrent = getXYarrays(arrName, columnName)[3];
        yArrCurrent = getXYarrays(arrName, columnName)[2];
    } else {
        xArrLifted = getXYarrays(arrName, columnName)[0];
        yArrLifted = getXYarrays(arrName, columnName)[1];
        xArrCurrent = getXYarrays(arrName, columnName)[2];
        yArrCurrent = getXYarrays(arrName, columnName)[3];
    }
    if(columnName == 'Province') { 
        dtickValue = 1
    } else {
        dtickValue = 0
    }

    var traceLifted = {
        x: xArrLifted,
        y: yArrLifted,
        type: 'bar',
        orientation: chartOrient,
        marker:{
            color: colorLifted
        },
        name: 'Lifted',
        hoverlabel: {
            namelength :-1
        },
        showgrid: false,
    }

      var traceCurrent = {
        x: xArrCurrent,
        y: yArrCurrent,
        type: 'bar',
        orientation: chartOrient,
        marker:{
            color: colorCurrent
        },
        name: 'Current',
        hoverlabel: {
            namelength :-1
        },
        showgrid: false,
    }

      var data = [traceLifted, traceCurrent]; 

      var layout = {
        title: chartName,
        //paper_bgcolor: 'rgba(245,246,249,1)',
        //plot_bgcolor: 'rgba(245,246,249,1)',
        //width: 400,
        //height: 300,
        margin: {
            l: 100,
            //r: 40,
            //b: 40,
            //t: 40
        },
        barmode: 'stack',
        autosize: true,
        autoscale: false,
        showlegend: false,
        //annotations: [],
        xaxis: { 
            tickfont: {
                size: 11
            },
            ticksuffix: " ",
            showgrid: false,
        },
        yaxis: { 
            title: {
                text: '', //'count',
                font: {
                    size: 11,
                },
            },
            ticksuffix: " ",
            tickfont: {
                size: 11
            },
            dtick: dtickValue,
            showgrid: false,
            //rangemode: 'tozero',
        },
      };

      Plotly.newPlot(divName, data, layout);

}


function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() + 
      (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
   }


function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
  }


function createTable(arrTable) {
    $(document).ready(function () {
        var thead;
        var thead_tr;
        thead = $("<thead>");
        thead_tr = $("<tr>");
        thead_tr.append("<th>Advisory ID</th>");
        thead_tr.append("<th>Province</th>");
        thead_tr.append("<th>Water System</th>");
        thead_tr.append("<th style='text-align: left;'>Community</th>");
        thead_tr.append("<th style='text-align: left;'>Status</th>");
        thead_tr.append("<th style='text-align: left;'>Advisory</th>");
        thead_tr.append("<th style='text-align: left;'>Date Set</th>");
        thead_tr.append("<th style='text-align: left;'>Date LTDWA Set</th>");
        thead_tr.append("<th style='text-align: left;'>Date Lifted</th>");
        thead_tr.append("<th style='text-align: right;'>Population</th>");
        thead_tr.append("<th style='text-align: left;'>Corrective Measure</th>");
        thead_tr.append("<th style='text-align: left;'>Phase</th>");
        thead_tr.append("<th style='text-align: right;'>Duration (Months)</th>");
        thead_tr.append("</tr>");
        thead.append(thead_tr);
        $("table").append(thead);

        var tbody;
        var tbody_tr;
        tbody = $("<tbody>");
        $("table").append(tbody);

        for(var i = 0; i < arrTable.length; i++) {
            var obj = arrTable[i];
            if (obj.Status == 'Lifted') { rowColor = 'rowLifted'} else { rowColor = 'rowCurrent'}
            tbody_tr = $("<tr class='" + rowColor + "'>");
            tbody_tr.append("<td>" + obj.AdvisoryID + "</td>");
            tbody_tr.append("<td>" + obj.Province + "</td>");
            tbody_tr.append("<td>" + obj.WaterSystemName + "</td>");
            tbody_tr.append("<td style='text-align: left;'><a href='https://fnp-ppn.aadnc-aandc.gc.ca/fnp/Main/Search/FNMain.aspx?BAND_NUMBER=" + obj.CommunityNum + "&lang=eng' target='_blank'>" + obj.CommunityName + "</td>");
            tbody_tr.append("<td style='text-align: left;'>" + obj.Status + "</td>");
            tbody_tr.append("<td style='text-align: left;'>" + obj.AdvisoryType + "</td>");
            tbody_tr.append("<td style='text-align: left; min-width:80px;'>" + obj.DateSet + "</td>");
            tbody_tr.append("<td style='text-align: left; min-width:80px;'>" + obj.DateLTDWASet + "</td>");
            tbody_tr.append("<td style='text-align: left; min-width:80px;'>" + obj.DateExpected + "</td>");
            tbody_tr.append("<td style='text-align: right;'>" + obj.PopulatioEstimated + "</td>");
            tbody_tr.append("<td style='text-align: left;'>" + obj.CorrectiveMeasure + "</td>");
            tbody_tr.append("<td style='text-align: left;'>" + obj.LongPhase + "</td>");
            tbody_tr.append("<td style='text-align: right;'>" + obj.AdvisoryDuration + "</td>");
            tbody.append(tbody_tr);
        }
        
       
    });

    // add tablesorter js to allow user to sort table by column headers
    $(document).ready(function($){ 
        $("#table_advisories").tablesorter();
    }); 

}



