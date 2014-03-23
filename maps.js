var map;
var markers = [];
var infowindow;
var metroArea = 7644;	//NYC default
var venueIDs = [];

function initialize() {
	console.log('init');
	var mapOptions = {
		center: new google.maps.LatLng(40.73,-74.0),	//NYC default, can have the option to change later
		zoom: 13
	};
	map = new google.maps.Map(document.getElementById("map-canvas"),
		mapOptions);

	infowindow = new google.maps.InfoWindow(); 	//global info window

	loadVenues();
}


//fetch venues for a new location query
function findMetroArea(locationQuery) {
	$.getJSON('http://api.songkick.com/api/3.0/search/locations.json?query='+locationQuery+'&apikey='+skick+'&jsoncallback=?',
		function(data) {
			metroArea = data.resultsPage.results.location[0].metroArea.id;
			loadVenues();
		});
}

//TO DO: create a playlists of music to go along with a given venue based on the list of upcoming artists
function createVenueRadio(v) {
}

function loadVenues() {
	var pagesToLoad = 10; //50 venues per page. Could potentially have a Next Page button instead.
	for (j = 1; j < pagesToLoad; j++) {
		$.getJSON('http://api.songkick.com/api/3.0/metro_areas/7644/calendar.json?apikey='+skick+'&page='+j+'&jsoncallback=?',
			function(data) {
				createMarkers(data);
			}
		)
	}
};

//TO DO: load a list of venues based on a list of Venue IDs.
function loadFavoriteVenues(listVenueIDs) {
};


function setUpcomingArtists(aMarker, callback) {
	var vid = aMarker.venueID;
	var artistList = [];
	console.log(aMarker + " venue id: " + vid);

//check to see if the marker already has an artist list. If not, get it...
	if (!aMarker.artistList) {
		console.log('it is null!');
		//set the artist list
		$.getJSON('http://api.songkick.com/api/3.0/venues/'+vid+'/calendar.json?apikey='+skick+'&jsoncallback=?',
			function(data) {
				//parse the data then set it as the marker content
				var events = data.resultsPage.results.event;
				for (i = 0; i<events.length; i++) {
					performers = events[i].performance;
					if (performers) {
						for (j = 0; j< performers.length; j++) {
							var artist = performers[j].artist.displayName;
							artistList.push(artist);
						}
					}
				}
				aMarker.artistList = artistList.join(', ');
				console.log("artist list is ready: " + aMarker.artistList);
				callback(aMarker);
			});
	}
	//marker already has an artist list...
	else {
		callback(aMarker);

	}	


};


function createArtistList(data, callback) {
	var artistList = [];
	var events = data.resultsPage.results.event;
	for (i = 0; i<events.length; i++) {
		performers = events[i].performance;
		if (performers) {
			for (j = 0; j< performers.length; j++) {
				var artist = performers[j].artist.displayName;
				artistList.push(artist);
			}
		}
	}
	return artistList;
}


function createMarkers(data) {
	for (i = 0; i<data.resultsPage.results.event.length; i++) {
		//parse data
		venue = data.resultsPage.results.event[i].venue;
		var venueName = venue.displayName;
		var venueID = venue.id;
		venueIDs.push(venue.id);
		var venueGeoLoc = new google.maps.LatLng(venue.lat, venue.lng);

		//create marker
		markers[i] = new google.maps.Marker({
			position: venueGeoLoc,
			title: venueName,
			venueID: venueID,
			artistList: null,
			map: map
		});

		google.maps.event.addListener(markers[i], 'click', function() {
			setUpcomingArtists(this, setMarkerContent);
			});
	}

function setMarkerContent(aMarker) {
	infowindow.setContent("<h1>"+aMarker.title+"</h1><br>" + aMarker.artistList);
	infowindow.open(map,aMarker);
}

	//print venue IDs
	if (venueIDs.length > 400) {
	var venueIDstring = venueIDs.join('\n');
	console.log(venueIDstring);
		console.log(venueIDs.length);

	}
}

google.maps.event.addListener(map, 'click', function() {
	infowindow.close();
});