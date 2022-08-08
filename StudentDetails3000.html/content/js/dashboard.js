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

    var data = {"OkPercent": 99.9875, "KoPercent": 0.0125};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9493333333333334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9758333333333333, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.966, 500, 1500, "Delete"], "isController": false}, {"data": [0.9425, 500, 1500, "Get final student details"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8133333333333334, 500, 1500, "Create"], "isController": false}, {"data": [0.9355, 500, 1500, "Get Student"], "isController": false}, {"data": [0.9831666666666666, 500, 1500, "Get Specific student"], "isController": false}, {"data": [0.9783333333333334, 500, 1500, "Update"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 24000, 3, 0.0125, 250.87204166666947, 0, 21004, 111.0, 411.0, 440.0, 731.9900000000016, 87.41545286668051, 149.35352331511268, 23.623922985847802], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 3000, 1, 0.03333333333333333, 172.0849999999998, 94, 4564, 104.0, 355.0, 480.9499999999998, 837.0, 11.091844166984018, 3.5856624858116826, 8.611318585725167], "isController": false}, {"data": ["Delete", 3000, 0, 0.0, 199.1983333333326, 100, 4021, 110.0, 324.8000000000002, 502.0, 2905.579999999991, 11.132427648497309, 5.033459033130105, 2.7395954997625083], "isController": false}, {"data": ["Get final student details", 3000, 0, 0.0, 322.8806666666659, 192, 4554, 210.0, 489.1000000000008, 772.8999999999996, 3250.8899999999976, 11.097957975732466, 5.104576578222107, 1.8424091412492603], "isController": false}, {"data": ["Debug Sampler", 3000, 0, 0.0, 0.09066666666666649, 0, 29, 0.0, 0.0, 1.0, 1.0, 11.153204129659715, 3.229564193195802, 0.0], "isController": false}, {"data": ["Create", 3000, 1, 0.03333333333333333, 683.2836666666689, 387, 21004, 427.0, 1289.7000000000003, 2313.95, 3033.9199999999983, 10.962388046612073, 5.018375702963133, 3.456710014917983], "isController": false}, {"data": ["Get Student", 3000, 0, 0.0, 279.41166666666624, 187, 3922, 205.0, 548.0, 639.0, 875.9799999999996, 11.050171461827183, 120.92048676465714, 1.7050069247741162], "isController": false}, {"data": ["Get Specific student", 3000, 0, 0.0, 171.8899999999998, 94, 4435, 102.0, 357.9000000000001, 426.0, 834.9899999999998, 11.077836572369659, 4.615238752764844, 1.79579592063284], "isController": false}, {"data": ["Update", 3000, 1, 0.03333333333333333, 178.13633333333343, 94, 4466, 104.0, 448.0, 486.0, 789.8499999999967, 11.061702174730648, 3.6082285870795627, 3.7808048241004992], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1, 33.333333333333336, 0.004166666666666667], "isController": false}, {"data": ["405/Method Not Allowed", 1, 33.333333333333336, 0.004166666666666667], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1, 33.333333333333336, 0.004166666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 24000, 3, "400/Bad Request", 1, "405/Method Not Allowed", 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 3000, 1, "400/Bad Request", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Create", 3000, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Update", 3000, 1, "405/Method Not Allowed", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
