//The crime data retrieved from the SQL query is stored in the global variables named ‘crimeDataLocations’ and ‘crimeDataInfo’.
//This function is called once the Bing Maps API loads. This is required as the API is loaded synchronously.
DEF loadMap() {
	//Instantiate a new Map object from the Bing Maps API. The first argument will be the div element of where the map is held. 
  //This will be found using document.getElementById().
	var map << new Microsoft.Maps.Map()
	//Calls my function to generate the Location objects array given a 2d array of latitude and longitude pairs.
  var locations << createLocationsArray(crimeDataLocations)

  //create the information box which displays the individual crime's details. Initial position set to the map centre but 
  //irrelevant as box invisible until user clicks on crime.
  var infobox << new Microsoft.Maps.Infobox(map.getCenter(), { visible: false, autoAlignment: true })
  Infobox.setMap(map)
  //calls algorithm to generate Pushpin objects array given Location objects array, 2d array where each item in the 
  //internal arrays is the info for that respective field in the database table, and the infobox object.
  var pushpins <<  createPushpinsArray(locations, crimeDataInfo, infobox)
    
  //load clustering module which will be visible by default
  loadClustering(map, pushpins)
  //loads heatmap module and sets it not visible by default
  loadHeatmap(map, locations)	
}

DEF createLocationsArrayrecords)
{
  //declares the locations variables as an empty array
  var locations << []
  //loops through each record index
  for (i = 0; i < records.length; i++)
  {
    //instantiates a new Location object using index 0, latitude, and index 1, longitude, and pushes it onto the array
    locations.push(new Microsoft.Maps.Location( records[i][0], records[i][1] ) )
  }
    
  return locations
}

DEF createPushpinsArray(locations, crimeDataInfo, infobox)
{    
  //n.b. a location is connected to the crime information by using the same index in the two arrays
  var pushpins << []
  for (i = 0; i < locations.length; i++)
  {
    //loop through each location index and instantiate a pushpin for each.
    //first argument is the location of the point, second is for custom properties but only metadata is needed and 
    //this is assigned later, so null is passed.
    var pin << new Microsoft.Maps.Pushpin( locations[i], null)
    //Stores the title and description of the pin in the metadata property, this is what will display when the point is clicked
    pin.metadata << {
      //`Crime ID`[0], `Reported by`[1], `Falls within`[2], `Location`[3], `LSOA code`[4], `LSOA name`[5], `Crime type`[6], 
      //`Last outcome category`[7], `Context[8]`
      //the crime type and location text will be the title, whilst other info is in the description, 
      //each on a new line (by using <br> tag) with an identifier.
      title: crimeDataInfo[i][6] + ' ' + crimeDataInfo[i][3],
      description: 'Falls within: ' + crimeDataInfo[i][2] + '<br>Last outcome category: ' + crimeDataInfo[i][7] + 
        '<br>Context: ' + crimeDataInfo[i][8] + '<br><br>Crime ID: ' + crimeDataInfo[i][0] + 
        '<br>Reported by: ' + crimeDataInfo[i][1] + '<br>LSOA code: ' + crimeDataInfo[i][4] + '<br>LSOA name: ' + crimeDataInfo[i][5]
    }
    //adds an onclick event handler to pin, which when activated will set the infobox’s properties to the 
    //corresponding location and metadata title and description of the pin, as well as making it visible.
    Microsoft.Maps.Events.addHandler(pin, 'click', function (args) {
      infobox.setOptions({
        location: args.target.getLocation(),
        title: args.target.metadata.title,
        description: args.target.metadata.description,
        visible: true
      })
    })
    //at end of loop the new pin is pushed onto the array.
    pushpins.push(pin)
  }
    
  return pushpins
}

DEF loadClustering ( map, pushpins )
{
  //uses loadModule function to load clustering module needed to create the layer.
  Microsoft.Maps.loadModule('Microsoft.Maps.Clustering', function () {
    //instantiates a new cluster layer, which takes the pushpins array as an argument along with the custom properties.
    clusterLayer << new Microsoft.Maps.ClusterLayer(pushpins, { gridSize: 30 })
    //afterwards the layer has to be inserted into the map using the insert function in the map.layers class.
    map.layers.insert(clusterLayer)
  })
}

DEF loadHeatmap ( map, locations )
{
  //uses loadModule to load heatmap module needed to create the visualisation layer.
  Microsoft.Maps.loadModule('Microsoft.Maps.HeatMap', function () {
    //instantiate a new heatmap layer which takes the array of locations as the argument.
    heatMap << new Microsoft.Maps.HeatMapLayer(locations)
    //set the layer to invisible by default. This will be changed when the user clicks to change the visualisation.
    heatMap.setVisible(false)
    //insert the new layer into the map object.
    map.layers.insert(heatMap)
  })
}

//visualisation button toggle variables
//creates array to store the text to be displayed for each visual and can also be used to track the number of visualisations.
var visualisations << ['Clustered Pinpoints', 'Temperature Heatmap']
//sets the initial text to display on the button, which will be the visual to switch to if clicked. In this case, ‘Temperature Heatmap’.
var selectedVisualI << 1
//stores the maximum index. This will trigger the current index to be reset to 0 if it increases past this number.
var maxVisualI << visualisations.length-1
//gets the button and text element from the html document by their ids and stores each into their own variables
var visualButton << document.getElementById('visualButton')
var visualButtonText << document.getElementById('visualButtonText')
//sets the initial text defined by the ‘selectedVisualI’ index.
visualButtonText.innerHTML << visualisations[selectedVisualI]

//this subroutine is called when the button is clicked. The event handler is defined in the html tag.
DEF visualButtonClicked ()
{
  //edit the button to now display the next visual text in the array
  selectedVisualI = selectedVisualI + 1;
  //check if the index increases past the maximum index for the array. If this occurs, then it gets reset to 0.
  if (selectedVisualI > maxVisualI)
  {
    selectedVisualI << 0
  }
  //update the innerHTML text to the new text denoting the next visualisation option to the user
  visualButtonText.innerHTML << visualisations[selectedVisualI]
    
  //calls the toggleVisual subroutine which toggles the visibility of each layer on the map.
  toggleVisual ()
}

//subroutine to toggle visibility between the two layers. No argument for the desired visual is required as there are only two options.
DEF toggleVisual ()
{
  //checks if the cluster layer is currently visible by using the getVisible function which returns true or false.
  if ( clusterLayer.getVisible() )
  {
    //if it is visible then the cluster layer’s visibility is set to no longer be visible and 
    //the heatmap layer is now made visible to the user.
    clusterLayer.setVisible ( false )
    heatMap.setVisible( true )
  }else{
    //on the other hand, if the clustering visual is not visible (implying the heatmap is currently being shown) then 
    //make it visible by the setVisible function, parsing in true, meanwhile hiding the heatmap with false.
    clusterLayer.setVisible( true )
    heatMap.setVisible( false )
  }
}
