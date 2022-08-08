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

    var data = {"OkPercent": 97.51834862385321, "KoPercent": 2.481651376146789};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.45263761467889907, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5493577981651376, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.38, 500, 1500, "Delete"], "isController": false}, {"data": [0.12293577981651377, 500, 1500, "Get final student details"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.1153211009174312, 500, 1500, "Create"], "isController": false}, {"data": [0.4088073394495413, 500, 1500, "Get Student"], "isController": false}, {"data": [0.5274311926605505, 500, 1500, "Get Specific student"], "isController": false}, {"data": [0.5172477064220183, 500, 1500, "Update"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 43600, 1082, 2.481651376146789, 1319.6777293578061, 0, 21470, 1621.0, 3009.0, 3239.0, 3986.9900000000016, 603.2514700795573, 1032.309740898478, 160.10016268159805], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 5450, 9, 0.1651376146788991, 1022.5412844036674, 69, 3314, 903.0, 2279.0, 2451.8999999999996, 2990.449999999999, 77.58890692178468, 25.090768788616497, 60.23660556985137], "isController": false}, {"data": ["Delete", 5450, 420, 7.706422018348624, 1274.730642201828, 4, 5202, 1401.5, 2603.9000000000005, 2975.0, 3909.49, 77.97856662517349, 46.18916643416176, 17.710292298901145], "isController": false}, {"data": ["Get final student details", 5450, 630, 11.559633027522937, 2162.5130275229303, 4, 21470, 2508.5, 3769.0, 3889.0, 4201.1999999999825, 77.51937984496124, 51.900036003840405, 11.380894517637437], "isController": false}, {"data": ["Debug Sampler", 5450, 0, 0.0, 0.07302752293577959, 0, 35, 0.0, 0.0, 1.0, 1.0, 78.3181008219808, 22.697247437597003, 0.0], "isController": false}, {"data": ["Create", 5450, 9, 0.1651376146788991, 2717.914311926603, 7, 21360, 2863.0, 4141.900000000001, 4344.45, 4831.55999999999, 104.34616121003255, 48.04227545232625, 32.85952383089221], "isController": false}, {"data": ["Get Student", 5450, 5, 0.09174311926605505, 1238.7411009174332, 5, 21197, 1342.0, 2406.9000000000005, 2873.0, 3123.0, 77.85269413176391, 825.0359466066225, 12.001406839252041], "isController": false}, {"data": ["Get Specific student", 5450, 0, 0.0, 1077.2770642201822, 69, 4379, 1166.0, 2230.5000000000027, 2439.699999999999, 2975.49, 77.58117553274779, 33.39586851325286, 12.575760086442513], "isController": false}, {"data": ["Update", 5450, 9, 0.1651376146788991, 1063.631376146789, 14, 4371, 1205.0, 2098.800000000001, 2291.0, 2967.9799999999996, 77.65081355256035, 25.36367373389992, 26.5343771817029], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 9, 0.8317929759704251, 0.020642201834862386], "isController": false}, {"data": ["405/Method Not Allowed", 8, 0.7393715341959335, 0.01834862385321101], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 3, 0.27726432532347506, 0.006880733944954129], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 4, 0.36968576709796674, 0.009174311926605505], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1058, 97.7818853974122, 2.426605504587156], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 43600, 1082, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1058, "400/Bad Request", 9, "405/Method Not Allowed", 8, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 4, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 3], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 5450, 9, "400/Bad Request", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 5450, 420, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 420, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get final student details", 5450, 630, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 627, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 3, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Create", 5450, 9, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 6, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Student", 5450, 5, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 4, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Update", 5450, 9, "405/Method Not Allowed", 8, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
