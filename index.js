//global variables:
//crimeDataLocations
//crimeDataInfo
//queryDate
//distinctCrimeTypes
 
//check if browser offline
console.log( 'browser online: ' + navigator.onLine );
if (!navigator.onLine)
{
    var loadingMapText = document.getElementById('loadingMapText');
    loadingMapText.innerHTML = loadingMapText.innerHTML + ' [!]Bing Maps API cannot load in offline mode.';
}
 
//visualisation button toggle variables
var visualisations = [['Clustered Pinpoints', 'images/cluster_icon_60x60.png'], ['Temperature Heatmap', 'images/heatmap_icon_60x60.png']];
var selectedVisualI = 1;
var maxVisualI = visualisations.length-1;
 
var visualButton = document.getElementById('visualButton');
var visualButtonText = document.getElementById('visualButtonText');
var visualButtonImg = document.getElementById('visualButtonImg');
visualButtonText.innerHTML = visualisations[selectedVisualI][0];
visualButtonImg.setAttribute('src', visualisations[selectedVisualI][1]);
 
//display num of crimes
var numRecordsDisplay = document.getElementById('numRecordsDisplay');
numRecordsDisplay.innerHTML = 'Number of locations returned from query: ' + crimeDataLocations.length;
console.log(typeof crimeDataLocations.length);
if (crimeDataLocations.length < 1)
{
    numRecordsDisplay.style.color = "#ff0000"; //red
}
 
/*DOES NOT WORK
//stat SVG
var statSVG = document.getElementById('statSVG');
var SVGwidth = statSVG.style.width = 210;
var SVGheight = statSVG.style.height = 210;
var SVGcenterX = SVGwidth/2;
var SVGcenterY = SVGheight/2;
//generate and draw pie chart of crime types
//angles in radians
var sector = drawSVGSector( statSVG, SVGcenterX, SVGcenterY, 90, Math.PI/4, 0);
 
function drawSVGSector(svg, cx, cy, r, internalAngle, rotationAngle )
{
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    var startxy = getEndPointOfCurve(r, rotationAngle, cx, cy);
    console.log(startxy);
    var startCx = startxy[0];
    var startCy = startxy[1];
    var cmd = "M " + cx + " " + cy + " L " + startCx + " " + startCy;
    var endxy = getEndPointOfCurve( r, internalAngle, cx+startCx, cy+startCy );
    console.log(endxy);
    var endCx = endxy[0];
    var endCy = endxy[1];
    cmd = cmd + " A " + r + " " + r + " 0 0 1 " + endCx + " " + endCy;
    cmd = cmd + " L " + cx + " " + cy + "";
    
    path.setAttribute("stroke", "blue");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    path.setAttribute("d", cmd);
    svg.appendChild(path);
    return path;
}
 
function getEndPointOfCurve(r, a, cx, cy)
{
    var s = cx;
    var t = cy;
    var x = s + (r * Math.cos(a))  
    var y = t - (r * Math.sin(a))
    return [x, y];
}
*/
 
//news display variables -UNUSED
var newsFeedMarginTop = -160;
var newsFeedMarginLeft = -160;
var newsFeedHConst = 15; //amount to trim from bottom to hide horizontal scrollbar
 
//news display event handlers
var newsCloseImg = document.getElementById('newsCloseImg');
newsCloseImg.onmouseenter = function() {
    newsCloseImg.setAttribute('src', 'images/close_hover.png');
};
newsCloseImg.onmouseleave = function() {
    newsCloseImg.setAttribute('src', 'images/close_default.png');
};
newsCloseImg.onclick = function() {
    var div = document.getElementById('newsDiv');
    div.style.visibility = 'hidden';
};
 
function getNewsArticles( query )
{
    console.log('run func: getNewsArticles');
    //template: https://www.google.com/search?q=Wiltshire+Police+crime&igu=1&source=lnt&tbs=cdr%3A1%2Ccd_min%3A12%2F1%2F2013%2Ccd_max%3A12%2F31%2F2013&tbm=nws
    console.log( document.getElementById('newsIFrame').src );
    var iframe = document.getElementById('newsIFrame');
    var div = document.getElementById('newsDiv');
    var url = 'https://www.google.com/search?q=';
    
    //append search query to url
    //str.replace(/blue/g, "red");
    var urlQuery = query.replace(/ /g, "+");
    console.log(urlQuery);
    urlQuery = urlQuery + '+crime';
    url = url + urlQuery;
    
    //append general data
    url = url + '&igu=1&source=lnt&tbs=cdr%3A1';
    
    //append date range in format
    //queryDate format: 2013-12
    var qDate = queryDate.split('-');
    console.log(qDate);
    //'%2Ccd_min%3A12%2F1%2F2013%2Ccd_max%3A12%2F31%2F2013'
    var dateQuery = '%2Ccd_min%3A' + qDate[1] + '%2F1%2F' + qDate[0] + '%2Ccd_max%3A' + qDate[1] + '%2F31%2F' + qDate[0];
    url = url + dateQuery;
    
    //append news option
    url = url + '&tbm=nws';
    
    iframe.src = url;
    div.style.visibility = 'visible';
}
 
function visualButtonClicked()
{
    //edit the button to now display the next visual in the array
    selectedVisualI = selectedVisualI + 1;
    if (selectedVisualI > maxVisualI)
    {
        selectedVisualI = 0;
    }
    
    visualButtonText.innerHTML = visualisations[selectedVisualI][0];
    visualButtonImg.setAttribute('src', visualisations[selectedVisualI][1]);
    
    //toggle the visualisation
    toggleVisual();
}
 
function loadMap()
{
    var map = new Microsoft.Maps.Map(document.getElementById('theMap'), {});
    
    //load and setup location autosuggest (used for when the user searches for a location to go to)
    loadAutosuggest(map, '#locationSearch', '#locationSearchContainer');
    
    var locations = createLocationsArray(crimeDataLocations);
    
    //create the information box which displays the individual crime's details
    var infobox = new Microsoft.Maps.Infobox(map.getCenter(), { visible: false, autoAlignment: true, maxWidth: 320, maxHeight: 170 });
    infobox.setMap(map);
    //create the pushpins
    var pushpins = createPushpinsArray(locations, crimeDataInfo, infobox);
    
    loadClustering(map, pushpins);
    loadHeatmap(map, locations);
    
}
 
function loadAutosuggest(map, searchBox, searchBoxContainer)
{
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
        var options = {
            maxResults: 6,
            map: map
        };
        var manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest(searchBox, searchBoxContainer, function (suggestionResult) {
            map.setView({ bounds: suggestionResult.bestView });
        });
    });
}
 
/*
Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
    var options = {
        maxResults: 4,
        map: map
    };
    var manager = new Microsoft.Maps.AutosuggestManager(options);
    manager.attachAutosuggest('#searchBox', '#searchBoxContainer', selectedSuggestion);
});
function selectedSuggestion(suggestionResult) {
    map.entities.clear();
    map.setView({ bounds: suggestionResult.bestView });
    var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location);
    map.entities.push(pushpin);
    document.getElementById('printoutPanel').innerHTML =
        'Suggestion: ' + suggestionResult.formattedSuggestion +
            '<br> Lat: ' + suggestionResult.location.latitude +
            '<br> Lon: ' + suggestionResult.location.longitude;
}
*/
 
function createLocationsArray(records)
{
    var locations = [];
    for (var i = 0; i < records.length; i++)
    {
        locations.push(new Microsoft.Maps.Location( records[i][0], records[i][1] ) );
    }
    
    return locations;
}
 
function createPushpinsArray(locations, crimeDataInfo, infobox)
{
    //checks if the lengths of the two arrays are different
    if (locations.length != crimeDataInfo.length)
    {
        console.log("Warning: the lengths of the 'locations' and 'crimeDataInfo' arrays does at match when passed into 'createPushpinsArray' func.");
    }
    console.log("locations length: " + locations.length + " crimeDataInfo length: " + crimeDataInfo.length);
    
    //n.b. a location is connected to the crime information by using the same index in the two arrays
    var pushpins = [];
    for (var i = 0; i < locations.length; i++)
    {
        var pin = new Microsoft.Maps.Pushpin( locations[i], null);
        
        //generate description string
        var descTs = ['Falls within: ', 'Last outcome category: ', 'Context: ', '', 'Crime ID: ', 'Reported by: ', 'LSOA code: ', 'LSOA name: ']
        var descIs = [2, 7, 8, -1, 0, 1, 4, 5]
        var descStr = '';
        descIs.forEach(function (descI, currentIndex)
        {
            if (descI == -1)
            {
                descStr = descStr.concat("<a href='javascript:getNewsArticles(", '"' + crimeDataInfo[i][2] + '"', ")'>View news articles related to this area</a>");
                descStr = descStr + '<br><br>';
            }
            else if (crimeDataInfo[i][descI] != '')
            {
                descStr = descStr + descTs[currentIndex] + crimeDataInfo[i][descI] + '<br>';
            }
            /*
            if (descStr != '')
            {
                descStr = descStr + '<br>';
            }
            */
        });
        
        //Store some metadata with the pushpin
        pin.metadata = {
            //`Crime ID`, `Reported by`, `Falls within`, `Location`, `LSOA code`, `LSOA name`, `Crime type`, `Last outcome category`, `Context`
            //[0]          [1]          [2]               [3]          [4]         [5]          [6]           [7]                      [8]
            title: crimeDataInfo[i][6] + ' ' + crimeDataInfo[i][3],
            description: descStr
            /*
            'Falls within: ' + crimeDataInfo[i][2] + '<br>Last outcome category: ' + crimeDataInfo[i][7] + '<br>Context: ' + crimeDataInfo[i][8] +
            '<br><br>Crime ID: ' + crimeDataInfo[i][0] + '<br>Reported by: ' + crimeDataInfo[i][1] + '<br>LSOA code: ' + crimeDataInfo[i][4] + 
            '<br>LSOA name: ' + crimeDataInfo[i][5]
            */
        };
        
        Microsoft.Maps.Events.addHandler(pin, 'click', function (args) {
            infobox.setOptions({
                location: args.target.getLocation(),
                title: args.target.metadata.title,
                description: args.target.metadata.description,
                visible: true
            });
        });
        
        pushpins.push(pin);
    }
    
    return pushpins;
}
 
function loadClustering(map, pushpins)
{
    Microsoft.Maps.loadModule('Microsoft.Maps.Clustering', function () {
        clusterLayer = new Microsoft.Maps.ClusterLayer(pushpins, { gridSize: 40 });
        map.layers.insert(clusterLayer);
        //map.layers.remove(clusterLayer);
        console.log('clustering layer inserted into map');
    });
}
 
function loadHeatmap(map, locations)
{
    Microsoft.Maps.loadModule('Microsoft.Maps.HeatMap', function () {
        heatMap = new Microsoft.Maps.HeatMapLayer(locations);
        heatMap.setVisible(false);
        map.layers.insert(heatMap);
        console.log('heatmap layer inserted into map');
    });
}
 
function toggleVisual()
{
    if (clusterLayer.getVisible())
    {
        clusterLayer.setVisible(false);
        heatMap.setVisible(true);
    }else{
        clusterLayer.setVisible(true);
        heatMap.setVisible(false);
    }
}
