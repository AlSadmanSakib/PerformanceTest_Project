/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.98039215686275, "KoPercent": 0.0196078431372549};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9861764705882353, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9985294117647059, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.9997058823529412, 500, 1500, "Delete"], "isController": false}, {"data": [0.9762745098039216, 500, 1500, "Get final student details"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9362745098039216, 500, 1500, "Create"], "isController": false}, {"data": [0.9812745098039216, 500, 1500, "Get Student"], "isController": false}, {"data": [0.9994117647058823, 500, 1500, "Get Specific student"], "isController": false}, {"data": [0.9979411764705882, 500, 1500, "Update"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 40800, 8, 0.0196078431372549, 152.7043872549033, 0, 21005, 86.0, 320.0, 339.0, 366.0, 118.12562428523864, 202.39035933948813, 31.92203966654121], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 5100, 2, 0.0392156862745098, 89.15470588235304, 75, 2089, 82.0, 98.0, 132.0, 181.0, 14.907921660333235, 4.81936020169541, 11.573981246346097], "isController": false}, {"data": ["Delete", 5100, 0, 0.0, 101.36882352941183, 81, 823, 88.0, 102.0, 194.94999999999982, 411.9899999999998, 14.90935986224921, 6.741163829015953, 3.66906031018777], "isController": false}, {"data": ["Get final student details", 5100, 2, 0.0392156862745098, 211.47098039215666, 154, 21003, 167.0, 192.0, 366.9499999999998, 1001.9799999999996, 14.903826484391894, 6.867455166148442, 2.473257813915498], "isController": false}, {"data": ["Debug Sampler", 5100, 0, 0.0, 0.05078431372549012, 0, 18, 0.0, 0.0, 0.0, 1.0, 14.924019184680347, 4.323616153860785, 0.0], "isController": false}, {"data": ["Create", 5100, 2, 0.0392156862745098, 453.8982352941184, 310, 21005, 337.0, 410.0, 1460.8499999999995, 2373.9699999999993, 14.79513095141395, 6.774891719948478, 4.664993405650579], "isController": false}, {"data": ["Get Student", 5100, 0, 0.0, 190.2113725490195, 149, 2720, 162.0, 194.90000000000055, 269.0, 773.9899999999998, 14.902215170455044, 163.61925440619785, 2.2993652313788058], "isController": false}, {"data": ["Get Specific student", 5100, 0, 0.0, 85.40882352941202, 75, 1385, 81.0, 92.0, 107.0, 150.0, 14.908095973060194, 6.220293426406623, 2.4167021556083674], "isController": false}, {"data": ["Update", 5100, 2, 0.0392156862745098, 90.0713725490193, 75, 2112, 82.0, 102.0, 122.0, 169.98999999999978, 14.905525273633295, 4.862099916339086, 5.094582042495361], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2, 25.0, 0.004901960784313725], "isController": false}, {"data": ["405/Method Not Allowed", 2, 25.0, 0.004901960784313725], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, 25.0, 0.004901960784313725], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, 25.0, 0.004901960784313725], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 40800, 8, "400/Bad Request", 2, "405/Method Not Allowed", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 5100, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get final student details", 5100, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Create", 5100, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Update", 5100, 2, "405/Method Not Allowed", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
