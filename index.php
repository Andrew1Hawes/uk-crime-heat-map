<!DOCTYPE html>
<html>
<head>
<title>Project1</title>
 
<?php
//connects to the database
$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'andrew_project';
 
$conn = new mysqli($servername, $username, $password, $dbname);
 
//gets all the table names, which are the months, and stores these in the 'months' variable
$sql = "SHOW TABLES";
$result = $conn->query($sql);
 
$months = [];
foreach ($result as $record)
{
    foreach ($record as $value)
    {
        $months[] = $value;
    }
}
 
//gets all the unique crime types from the table
$sql = "SELECT DISTINCT `Crime type` FROM `" . $fromDate . "`;";
$result = $conn->query($sql);
 
$distinctCrimeTypes = [];
foreach ($result as $record)
{
    foreach ($record as $value)
    {
        $distinctCrimeTypes[] = $value;
    }
}
 
//gets all the unqiue contexts from the table
$sql = "SELECT DISTINCT `Context` FROM `" . $fromDate . "`;";
$result = $conn->query($sql);
 
$distinctContexts = [];
foreach ($result as $record)
{
    foreach ($record as $value)
    {
        $distinctContexts[] = $value;
    }
}
 
//set up default context variable if not set from form
if (isset($_GET['context']))
{
    $context = $_GET['context'];
}else{
    $context = 'ALL';
}
 
//set up crime type variable from option selected from form. if not set, defaults to all.
if (isset($_GET['crimeType']))
{
    $crimeType = $_GET['crimeType'];
}else{
    $crimeType = 'ALL';
}
 
//create sql queries to use
$sqlLo = "SELECT Latitude, Longitude FROM `" . $fromDate . "`";
$sqlInfo = "SELECT `Crime ID`, `Reported by`, `Falls within`, `Location`, `LSOA code`, `LSOA name`, `Crime type`, `Last outcome category`, `Context` FROM `" . $fromDate . "`";
 
function UpdateLoInfo($newStr)
{
    //$GLOBALS['x']
    $GLOBALS['sqlLo'] = $GLOBALS['sqlLo'] . $newStr;
    $GLOBALS['sqlInfo'] = $GLOBALS['sqlInfo'] . $newStr;
}
 
if ($crimeType != 'ALL' || $context != 'ALL')
{
    UpdateLoInfo(" WHERE");
    if ($crimeType != 'ALL')
    {
        UpdateLoInfo(" `Crime type` = '" . $crimeType . "'");
        if ($context != 'ALL')
        {
            UpdateLoInfo(" AND");
        }
    }
    if ($context != 'ALL')
    {
        UpdateLoInfo(" `Context` = '" . $context . "'");
    }
}
UpdateLoInfo(";");
 
/*
//get all the location data from the specified table
$sql = "SELECT Latitude, Longitude FROM `" . $fromDate . "`;";
*/
$result = $conn->query($sqlLo);
$crimeDataLocations = $result->fetch_all(MYSQLI_NUM); //stores in a numeric array so can be translated for use in javascript
 
/*
//get the information data for each location from the table
$sql = "SELECT `Crime ID`, `Reported by`, `Falls within`, `Location`, `LSOA code`, `LSOA name`, `Crime type`, `Last outcome category`, `Context` FROM `" . $fromDate . "`;";
*/
$result = $conn->query($sqlInfo);
$crimeDataInfo = $result->fetch_all(MYSQLI_NUM);
 
//var_dump($crimeData);
?>
 
<link rel='stylesheet' type='text/css' href='index.css'/>
</head>
<body>
 
<div id='mapViewOptions'>
    <div id='locationSearchContainer'>
        <p id='locationSearchText'>Go to location:</p>
        <input type='text' id='locationSearch'/>
    </div>
    
    <p id='visualisationText'>Switch visualisation to:</p>
    <button type="button" id='visualButton' onclick="visualButtonClicked()">
        <img src="" id='visualButtonImg' alt="Switch to this visualisation method." width="60" height="60" align='left'/>
        <p id='visualButtonText'></p>
    </button>
 
    <p id='numRecordsDisplay'>Number of locations returned from query: 0</p>
    <!--
    <svg id='statSVG'>
    </svg>
    -->
 
</div>

<form id='filters' method='GET'>
 
    <p id='dateText'>Select month:</p>
    <select id='fromDateSelect' name='fromDate'>
        <?php
        foreach ($months as $month)
        {
            echo "<option value='" . $month . "'>" . $month . "</option>";
        }
        ?>
    </select>
    
    <p id='crimeTypeText'>Crime type:</p>
    <select id='crimeTypeSelect' name='crimeType'>
        <option value='ALL'>ALL</option>
        <?php
        foreach ($distinctCrimeTypes as $crime)
        {
            echo "<option value='" . $crime . "'>" . $crime . "</option>";
        }
        ?>
    </select>
    
    <p id='contextText'>Context:</p>
    <select id='contextSelect' name='context'>
        <option value='ALL'>ALL</option>
        <?php
        foreach ($distinctContexts as $context)
        {
            if ($context == '')
            {
                echo "<option value='" . $context . "'>(empty)</option>";
            }else{
                echo "<option value='" . $context . "'>" . $context . "</option>";
            }
        }
        ?>
    </select>
    
    <input id='filtersSubmit' type='submit' value='Submit'>
 
</form>
 
<h2 id='loadingMapText'>Loading map...</h2>
<div id='theMap'></div>
 
<div id='newsDiv'>
    <iframe id='newsIFrame' src='https://www.google.com/webhp?igu=1'></iframe>
    <img src="images/close_default.png" id='newsCloseImg' alt="Close button." width="58" height="27"/>
</div>
 
<script>
DEV_OUTPUT = false;
//use json to translate variables for javascript use
var distinctCrimeTypes = <?php echo json_encode($distinctCrimeTypes); ?>;
var queryDate = <?php echo json_encode($fromDate); ?>;
var crimeDataLocations = <?php echo json_encode($crimeDataLocations); ?>;
var crimeDataInfo = <?php echo json_encode($crimeDataInfo); ?>;
console.log(crimeDataLocations.length);
console.log(crimeDataInfo.length);
if (DEV_OUTPUT == true){
    document.write('-data locations length: ' + crimeDataLocations.length);
    document.write('-data info length (should be same as locations length): ' + crimeDataInfo.length);
}
</script>
<script type='text/javascript' src='index.js'></script>
 
<script type='text/javascript' src='https://www.bing.com/api/maps/mapcontrol?key=YOUR_API_KEY&callback=loadMap' async defer></script>
 
</body>
</html>
