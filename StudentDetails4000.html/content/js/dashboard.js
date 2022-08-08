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

    var data = {"OkPercent": 99.965625, "KoPercent": 0.034375};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.726546875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.74475, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.75625, 500, 1500, "Delete"], "isController": false}, {"data": [0.66325, 500, 1500, "Get final student details"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.42225, 500, 1500, "Create"], "isController": false}, {"data": [0.7145, 500, 1500, "Get Student"], "isController": false}, {"data": [0.761875, 500, 1500, "Get Specific student"], "isController": false}, {"data": [0.7495, 500, 1500, "Update"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 32000, 11, 0.034375, 783.3609062500004, 0, 21171, 148.0, 532.0, 684.0, 1393.9900000000016, 223.12401511665203, 377.3638494100287, 60.29155706571002], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 4000, 2, 0.05, 609.7084999999998, 105, 3134, 184.0, 1948.7000000000003, 2239.8999999999996, 2659.0, 28.673012960201856, 9.269531474007914, 22.2606884256007], "isController": false}, {"data": ["Delete", 4000, 0, 0.0, 604.5807499999993, 111, 3629, 156.0, 2030.0, 2462.7999999999993, 2796.0, 29.263510597048775, 13.231250548690824, 7.201467039227737], "isController": false}, {"data": ["Get final student details", 4000, 5, 0.125, 1095.167250000003, 213, 21171, 301.0, 3047.9, 3294.8999999999996, 4882.0, 28.691728891853703, 13.272705524682058, 4.757223142748524], "isController": false}, {"data": ["Debug Sampler", 4000, 0, 0.0, 0.051499999999999886, 0, 8, 0.0, 0.0, 0.0, 1.0, 29.433406916850625, 8.525210977740986, 0.0], "isController": false}, {"data": ["Create", 4000, 2, 0.05, 1958.267000000001, 437, 21171, 763.5, 3934.9, 5234.9, 6461.949999999999, 28.073524560824797, 12.862060737070387, 8.850795467704918], "isController": false}, {"data": ["Get Student", 4000, 0, 0.0, 780.6925, 210, 4012, 372.5, 2274.7000000000003, 2720.95, 3034.9399999999987, 28.630735094123544, 309.2061723279472, 4.417632953976093], "isController": false}, {"data": ["Get Specific student", 4000, 0, 0.0, 578.8322499999989, 103, 3407, 160.0, 2078.0, 2247.0, 2612.8799999999974, 28.661918342194642, 11.99128313810387, 4.6462677032130015], "isController": false}, {"data": ["Update", 4000, 2, 0.05, 639.5875000000004, 104, 3665, 186.5, 2097.9, 2319.95, 2926.99, 28.660891497030015, 9.34920239873749, 9.796007224335964], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2, 18.181818181818183, 0.00625], "isController": false}, {"data": ["405/Method Not Allowed", 2, 18.181818181818183, 0.00625], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 5, 45.45454545454545, 0.015625], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, 18.181818181818183, 0.00625], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 32000, 11, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 5, "400/Bad Request", 2, "405/Method Not Allowed", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 4000, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get final student details", 4000, 5, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Create", 4000, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Update", 4000, 2, "405/Method Not Allowed", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
