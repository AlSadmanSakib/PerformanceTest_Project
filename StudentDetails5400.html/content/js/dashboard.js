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

    var data = {"OkPercent": 99.75693881802819, "KoPercent": 0.2430611819718049};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7189865506145976, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9391666666666667, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.8950925925925926, 500, 1500, "Delete"], "isController": false}, {"data": [0.10537037037037036, 500, 1500, "Get final student details"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.055473235784404516, 500, 1500, "Create"], "isController": false}, {"data": [0.8822222222222222, 500, 1500, "Get Student"], "isController": false}, {"data": [0.940462962962963, 500, 1500, "Get Specific student"], "isController": false}, {"data": [0.9339814814814815, 500, 1500, "Update"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 43199, 105, 0.2430611819718049, 1969.08231672029, 0, 21475, 149.0, 9569.0, 10163.95, 15596.0, 633.4721529753351, 1068.3826885429803, 170.9959877793501], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 5400, 23, 0.42592592592592593, 206.48629629629576, 69, 2183, 116.5, 579.9000000000005, 697.9499999999998, 787.9799999999996, 96.85403737848405, 31.341956686964163, 75.19147659248664], "isController": false}, {"data": ["Delete", 5400, 0, 0.0, 344.49981481481336, 74, 15352, 245.0, 748.5000000000027, 1029.9499999999998, 1131.9899999999998, 84.70588235294117, 38.29469975490196, 20.84312193627451], "isController": false}, {"data": ["Get final student details", 5400, 36, 0.6666666666666666, 7201.8679629629705, 141, 21356, 8029.0, 11620.800000000001, 15338.0, 15588.929999999998, 84.63021298603601, 40.11453117408748, 13.953807355580109], "isController": false}, {"data": ["Debug Sampler", 5400, 0, 0.0, 0.14907407407407403, 0, 215, 0.0, 0.0, 1.0, 1.0, 85.87786259541986, 24.881952106194337, 0.0], "isController": false}, {"data": ["Create", 5399, 23, 0.42600481570661236, 7229.449712909794, 291, 21475, 8498.0, 10140.0, 10834.0, 15903.0, 91.15467085380473, 42.53426056070506, 28.630400648331054], "isController": false}, {"data": ["Get Student", 5400, 0, 0.0, 353.8716666666661, 138, 15880, 221.0, 754.0, 845.8999999999996, 1150.9699999999993, 96.50267169433673, 1032.716021761129, 14.890060671587111], "isController": false}, {"data": ["Get Specific student", 5400, 0, 0.0, 206.04074074074103, 69, 1216, 115.0, 620.0, 704.0, 797.0, 96.75685361046408, 44.343164167487906, 15.682375890297438], "isController": false}, {"data": ["Update", 5400, 23, 0.42592592592592593, 211.26740740740723, 69, 3084, 126.0, 614.9000000000005, 712.9499999999998, 803.0, 96.65121440461063, 31.548626663430042, 33.02945484911671], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 23, 21.904761904761905, 0.053241973193823934], "isController": false}, {"data": ["405/Method Not Allowed", 23, 21.904761904761905, 0.053241973193823934], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 36, 34.285714285714285, 0.0833352623903331], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 23, 21.904761904761905, 0.053241973193823934], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 43199, 105, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 36, "400/Bad Request", 23, "405/Method Not Allowed", 23, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 23, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 5400, 23, "400/Bad Request", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get final student details", 5400, 36, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:80 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Create", 5399, 23, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Update", 5400, 23, "405/Method Not Allowed", 23, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
