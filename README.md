# uk-crime-heat-map
Individual Project associated with Computer Science A Level<br/>
UK crime heat map using police big data. Target end users: general public and police/law enforcement.<br/>
<br/>
Web-browser based application written in HTML, CSS, and JavaScript.<br/>
<br/>
For data this uses the downloadable .csv files available from https://data.police.uk/ as opposed to the API. These files were then uploaded, converted and stored on a locally hosted MySQL database server.<br/>
Server locally hosted using the WampServer software stack ( https://www.wampserver.com/en/ ) running Apache2, MySQL, and PHP / phpMyAdmin.<br/>
The interactive embedded map uses Microsoft Bing Maps V8 Web Control API ( https://www.microsoft.com/en-us/maps/web ).<br/>
Notable Bing Maps API features used include: Heatmaps, Animated Tile Layers, Autosuggest, Clustering, Data Binning Module.<br/>
<br/>
## Technical notes
Some features may not work as intended or be unusable due to deprecation, web browser version, or other factors.<br/>
<br/>
Default database credentials:<br/>
```
//connects to the database
$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'andrew_project';
```
To use the Bing Maps API, a Microsoft account and API key may be required (refer to https://www.microsoft.com/en-us/maps/create-a-bing-maps-key ).<br/>
Replace `YOUR_API_KEY` in `<script type='text/javascript' src='https://www.bing.com/api/maps/mapcontrol?key=YOUR_API_KEY&callback=loadMap' async defer></script>` with your key.
