var placeDetails = [];
var selectedItem;
var queryBase = "http://api.eventful.com/json/events/search?app_key=hqWvGHfDvqhZ62Bm&q=music&l=";
var localStorageCount = 0;
var placesLocalStorageCount = 0;

var title
var venueName
var venueLocation
var venueCity
var venueZip
var venueLatitude
var venueLongitude
var eventUrl
var eventStart
var eventsDiv = $("#events-div");
var eventDescription
var eventfulID;


var eventsLength = 10;
var pageNumber = 0;
var eventsList = [];


var config = {
    apiKey: "AIzaSyCwWK4FLeujPsmc4L5KHURfhgRAWVhKvsE",
    authDomain: "night-out-197223.firebaseapp.com",
    databaseURL: "https://night-out-197223.firebaseio.com",
    projectId: "night-out-197223",
    storageBucket: "night-out-197223.appspot.com",
    messagingSenderId: "357306478807"
  }
firebase.initializeApp(config);
var database = firebase.database();

$(document).ready(function(){

    $("#twitterbox").hide();

    //DatePicker functionality
    /* var date_input=$('input[name="date"]'); //our date input has the name "date"
    var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
    var options={
      format: 'mm/dd/yyyy',
      container: container,
      todayHighlight: true,
      autoclose: true,
    };
    date_input.datepicker(options);*/

    var selectedEventVal;
    var selectedPlacesVal;

    //clearing localStorage on page load//
    localStorage.clear();

    //When the submit button is clicked with search parameters
    $("#submit-btn").on("click", function() {
        event.preventDefault();
        // var localStorageCount = 0;
        localStorage.clear();
        $("#events-div").empty();
        $("#places-div").empty();
        $("#twitterbox").hide();
        eventsList = [];
        
        var location = $("#location").val().trim();
        var place = location.replace(new RegExp(" ", "g"), '+');
        //gets area within location value//
        var radius = $("#miles").val().trim();
        //gets date value//
        var date = $("#dates").val().trim();
        console.log(date);
        var dateFormat = "DD MMMM YYYY"
        var convertedDate = moment(date, dateFormat);
        var dateRange = moment(convertedDate).format("YYYYMMDD");
        console.log(dateRange);

        //gets number of results desired//
        eventsLength = $("#pageSize").val().trim();
        if(eventsLength === "") {
            eventsLength = 10;
        }

        //Dont Need
        // var addedEventsDiv = $("<ul class = 'collection with-header'>")
        // var eventsHeader = $("<li class='collection-header' id='events-header'>").html("<h4>Pick an Event</h4>");
        // addedEventsDiv.append(eventsHeader);
        // var eventPanelBody = $("<div>").attr("class", "panel-body").attr("id","event-output");
        // addedEventsDiv.append(eventPanelBody);
        // eventsDiv.append(addedEventsDiv);

        fetchEvents(place, radius, dateRange);
    });
        //The Eventful API call//
        function printEvents() {
        var addedEventsDiv = $("<ul class = 'collection with-header'>")
        var eventsHeader = $("<li class='collection-header' id='events-header'>").html("<h4>Pick an Event</h4>");
        addedEventsDiv.append(eventsHeader);
        var eventPanelBody = $("<div>").attr("class", "panel-body").attr("id","event-output");
        addedEventsDiv.append(eventPanelBody);
        eventsDiv.append(addedEventsDiv);
        var localStorageCount = 0;

            for (var i = 0; i < eventsList.length; i++){


               

                //getting values from the API for our use//
               title = eventsList[i].title;
               venueName = eventsList[i].venue_name;
               venueLocation = eventsList[i].venue_address;
               venueCity = eventsList[i].city_name;
               venueZip = eventsList[i].postal_code;
               venueLatitude = eventsList[i].latitude;
               venueLongitude = eventsList[i].longitude;
               eventUrl = eventsList[i].url;
               eventStart = eventsList[i].start_time;
               eventStop = eventsList[i].stop_time;
               eventDescription = eventsList[i].description;
               eventAllDay = eventsList[i].all_day;
               eventfulID = eventsList[i].id;
               console.log(eventfulID);

                //setting data to an object for localStorage//
                var searchResult = {
                    "title": title,
                    "venueName": venueName,
                    "venueLocation": venueLocation,
                    "venueCity": venueCity,
                    "venueZip": venueZip,
                    "venueLatitude": venueLatitude,
                    "venueLongitude": venueLongitude,
                    "eventUrl": eventUrl,
                    "eventStart": eventStart,
                    "eventStop": eventStop,
                    "eventDescription": eventDescription,
                    "eventfulID": eventfulID


                };



                //storing search data object to localStorage//
                var localStorageKey = "searchResult" + localStorageCount;
                localStorage.setItem(localStorageKey, JSON.stringify(searchResult));
                
                var eventListItem = $("<li>").attr("class", "collection-item event-item").attr("data-event-num", i).attr("id", localStorageKey);

                localStorageCount++;
                //creating div w/ event title//
                var eventTitleDiv = $("<div>").attr("id", title.replace( new RegExp(" ", "g"), "-"));
                eventTitleDiv.append("<h3>" + title + "</h3>");

                //creating div w/ venue name//
                var venueTitleDiv = $("<div>").attr("id", venueName.replace(new RegExp(" ", "g"), "-"));
                venueTitleDiv.append("<h5>" + venueName + "</h5>");

                //appending venue name to event title divs//
                eventTitleDiv.append(venueTitleDiv);
                //appending all that to well//
                eventListItem.append(eventTitleDiv);

                selectedEventVal = i;
                // well.text("Event #" + i);
                
              
                eventPanelBody.append(eventListItem);
                //eventPanelBody.append(well);
                //allEventPanel.append(eventPanelBody);


                } 
            }

            // if (eventsDiv.is(":empty"))
 

        
function fetchEvents(place, radius, dateRange) {
        var eventfulUrl = 'https://cors-anywhere.herokuapp.com/http://api.eventful.com/json/events/search?app_key=hqWvGHfDvqhZ62Bm&q=music&l=' + place + 
        '&within=' + radius + '&units=miles&page_size=' + eventsLength + '&page_number=' + pageNumber + '&t=' + dateRange + '00-2018123100&sort_order=date&sort_direction=ascending&change_multi_day_start=true';
        console.log(eventfulUrl);

        fetch(eventfulUrl)
        .then(response => response.json())
        .then(data => {
            for(var i = 0; i < data.events.event.length; i++) {
                if ((data.events.event[i]["all_day"] !== "2") && (eventsList.length != parseInt(eventsLength))) { 
                    eventsList.push(data.events.event[i]);
                }
                if (eventsList.length == eventsLength) {
                    printEvents();
                    break;
                }
        }
               if (eventsList.length < eventsLength){
                pageNumber++;
                fetchEvents(place, radius, dateRange);

            }
    });
         
    }

    //When an event well is clicked...
    $("#events-div").on("click", ".event-item", function(ev){
        event.preventDefault();
        console.log('hello')
        //Empty out the events div
        selectedEventVal = $(this).attr("data-event-num");
        console.log(selectedEventVal);
        $("#event-output").empty();
        $("#events-header").text("The event you are attending");
        $("#twitterbox").show();

        //getting the localStorage key specific for the clicked item//
        var selectedResult = localStorage.getItem($(this).attr("id"));
        //turning it back into a JSON object
        var recalSearch = JSON.parse(selectedResult);
        console.log(recalSearch);

        var eventDate = recalSearch.eventStart;
        var eventEnd = recalSearch.eventStop;
        var eventFormat = "YYYY-MM-DD, HH:mm:ss"
        var convertedEvent = moment(eventDate, eventFormat);
        var convertedEventDate = moment(convertedEvent).format('MMMM Do YYYY, h:mm a');
        if (eventEnd == null) {
            convertedEventEndDate = " "
        } else { 
        var convertedEventEnd = moment(eventEnd, eventFormat);
        var convertedEventEndDate = moment(convertedEventEnd).format('MMMM Do YYYY, h:mm a');
        }
        venueLatitude = recalSearch.venueLatitude;
        venueLongitude = recalSearch.venueLongitude;
        eventfulID = recalSearch.eventfulID;

        database.ref().once("value")
        .then(function(snapshot) {
          var a = snapshot.child(eventfulID).exists();
          console.log(eventfulID);
          if(!a){
            console.log("O attending");
          } else {
              console.log(snapshot.child(eventfulID).numChildren());
          }
        });



        var selectedEventInfo = $("<div>");
        //appending the title retrieved from localStorage//
        selectedEventInfo.append("<h3>" + recalSearch.title + "</h3>");
        //appending the venue & event info//
        selectedEventInfo.append("<h5>" + recalSearch.venueName + ", " + recalSearch.venueLocation + ", " + recalSearch.venueCity + ", " + recalSearch.venueZip + "<br>" + convertedEventDate + " - " + convertedEventEndDate + "</h5>");
        //creating a button that will take a user to the event url//
        // var eventUrlBtn = $("<a href='" + recalSearch.eventUrl + "' class='btn btn-info' target='_blank'>Take Me There!</a>");
        var eventUrlBtn = $('<a href="' + recalSearch.eventUrl + '"class="waves-effect waves-light btn" id="takeMe" target="_blank">Take Me There!</a>')
        var eventAttendingBtn = $('<button class="waves-effect waves-light btn" id="attending-btn" data-eventful-id="'+recalSearch.eventfulID + '" target="_blank">Attending</button>');
        var showAttendeesBtn = $('<button class="waves-effect waves-light btn" id="show-attendee-btn" data-eventful-id="'+recalSearch.eventfulID + '" target="_blank">Show Attendees</button>');
        //A fix Michael worked up to keep the selected event on the page//
        eventUrlBtn.on('click', function(ev)    {
            ev.stopPropagation();
        });

        var attendeeDiv = $("<div>").append("People Going to this Event<br>") ;
        database.ref("/" + eventfulID).on("child_added", function(childSnapshot) {
            var attendee = childSnapshot.val().attendeeName;
            attendeeDiv.append(attendee + "<br>");
        });


        var nameSubmitDiv;
        $(document).on("click", "#attending-btn", function() {
            var buttonId = $(this).attr("data-eventful-id");
            console.log(buttonId);

            var nameForm = $("<input>").attr("id", "attendee-name").attr("type", "text").attr("placeholder", "Name");
            var nameSubmitBtn = $("<button>").attr("class", "waves-effect waves-light btn").attr("id", "name-submit-btn").text("Submit");
            nameSubmitDiv = $("<div>").append(nameForm).append(nameSubmitBtn);
            selectedEventInfo.append(nameSubmitDiv);

            console.log("Attending Bttn Clicked");
        })

        $(document).on("click", "#name-submit-btn", function() {

            var attendName = $("#attendee-name").val().trim();
            database.ref("/"+ eventfulID).push({
                attendeeName:attendName
            })  
            nameSubmitDiv.empty();
        })


        $(document).on("click", "#show-attendee-btn", function() {
             selectedEventInfo.append(attendeeDiv);
             console.log("Show Attendees Clicked");
        });



        //appending the button to the selected event div//
        selectedEventInfo.append(eventUrlBtn);
        selectedEventInfo.append(eventAttendingBtn);
        selectedEventInfo.append(showAttendeesBtn);
        var selectedEvent = $("<div>").attr("class", "well well-lg event-well");
        //appending all the event info to the appropriate part of the page//
        selectedEvent.append(selectedEventInfo);

        $("#event-output").append(selectedEvent);

        getPlacesData();
        
    })
})

function getPlacesData() {

    var lat = parseFloat(venueLatitude);
    var lng = parseFloat(venueLongitude);

    //define query URL for ajax call to Google Places API//
    var foodDrinkQueryURL = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + 
    "location=" + lat + "," + lng + "&rankby=distance&type=restaurant|bar&key=AIzaSyB2Ys8ExJDWr3CF94ia0_Oyxm8gBM87udY";
    
    //create variable to store Place Data//
    var foodDrinkPlaceData = [];

    //ajax call to Google Places API//
    $.ajax({
        url: foodDrinkQueryURL,
        method: "GET"
    }).then(function(response) {

        //variable to store query results//
        var myFoodDrinkQuery = response.results;

        //loop through each of the Place IDs//
        for(i=0; i<myFoodDrinkQuery.length; i++) {

            //pull place_id data from query results//
            var fdplaceID = myFoodDrinkQuery[i].place_id;
            var fdplaceLat = myFoodDrinkQuery[i].geometry.location.lat;
            var fdplaceLng = myFoodDrinkQuery[i].geometry.location.lng;
            var fdplaceName = myFoodDrinkQuery[i].name;
            var fdplaceAddress = myFoodDrinkQuery[i].vicinity;

            if (myFoodDrinkQuery[i].photos===undefined) {
                console.log("no photo");
                var fdplacePhotoReference = "Photo Unavailable";
            } else {
                var fdplacePhotoReference = myFoodDrinkQuery[i].photos[0].photo_reference;                
            }

            if (myFoodDrinkQuery[i].rating===undefined) {
                console.log("no rating");
                var fdplaceRating = "Not Rated";
            } else {
                var fdplaceRating = myFoodDrinkQuery[i].rating;
            }

            if (myFoodDrinkQuery[i].price_level===undefined) {
                console.log("no price");
                var fdplacePrice = "Not Available";
            } else {
                var fdplacePrice = myFoodDrinkQuery[i].price_level;
            }

             //convert price level to $ symbols//
            if (fdplacePrice == 1) {
                fdplacePrice = "$";
            } else if (fdplacePrice == 2) {
                fdplacePrice = "$$";
            } else if (fdplacePrice == 3) {
                fdplacePrice = "$$$";
            } else if (fdplacePrice == 4) {
                fdplacePrice = "$$$$";
            } else if (fdplacePrice == 5) {
                fdplacePrice = "$$$$$";
            }

        //create object to store specific data from query results//
        var foodDrinkDataObject = {
            name: fdplaceName,
            rating: fdplaceRating,
            price: fdplacePrice,
            place: fdplaceID,
            lat: fdplaceLat,
            lng: fdplaceLng,
            address: fdplaceAddress,
            photo: fdplacePhotoReference
        };

        //push object to placeDetails array//
        foodDrinkPlaceData.push(foodDrinkDataObject);
        }

        //call function to display Places//
        displayPlaces(foodDrinkPlaceData);


    });

}

//get place details function//
function getPlaceDetails(placeID, placeNum) {

    //define query URL for ajax call to Google Places API for Place Details search//
    var placesDetailsQueryURL = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?" + 
    "&place_id=" + placeID + "&key=AIzaSyB2Ys8ExJDWr3CF94ia0_Oyxm8gBM87udY";

    //ajax call to Google Places API for Place Details search//
    $.ajax({
    url: placesDetailsQueryURL,
    method: "GET"
    }).then(function(response) {

        //variable to store query results//
        var myPlaceDetailsQuery = response.result;
        console.log(myPlaceDetailsQuery);

        //variables to store specific data from query results//
        var fdname = myPlaceDetailsQuery.name;
        var fdplacePhone = myPlaceDetailsQuery.formatted_phone_number;
        var website = myPlaceDetailsQuery.website;

        if (myPlaceDetailsQuery.reviews===undefined) {
            console.log("no reviews");
            var fdplaceReviews = "None Available";
        } else {
            var fdplaceReviews = myPlaceDetailsQuery.reviews;
        }

        //create object to store specific data from query results//
        placeDetailsObject = {
            name: fdname,
            phone: fdplacePhone,
            reviews: fdplaceReviews,
            website: website
        };

        //call function to display Details//
        displayDetails(placeDetailsObject, placeNum);
    });
}


//display places function//       
function displayPlaces(placeData) {

    //Creating the Google Places Panel//
    var placesDiv = $("<ul class = 'collection with-header'>")
    var placesHeader = $("<li class='collection-header' id='places-header'>").html("<h4>Pick a Restaurant</h4>");
    placesDiv.append(placesHeader);

    console.log(placeData);

    //loop through each of the place objects in the placeDetails array//
    for(var i = 0; i < placeData.length; i++ ) {

        //storing search data object to localStorage//
        var placesLocalStorageKey = "placesSearchResult" + placesLocalStorageCount;
        localStorage.setItem(placesLocalStorageKey, JSON.stringify(placeData[i]));

        placesLocalStorageCount++;

        var placeListItem = $("<li>").attr("class", "collection-item places-item").attr("data-places-num", i).attr("id", placesLocalStorageKey);

        //creating div w/ place name//
        var placeTitleDiv = $("<div>").attr("id", "placeName" + i);
        placeTitleDiv.append("<h3>" + placeData[i].name + "</h3>");

        //creating div w/place photo//
        if (placeData[i].photo==="Photo Unavailable") {
            placeTitleDiv.append("<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABwCAQAAADxyPcNAAAAr0lEQVR42u3RMQEAAACCMO1f2hoeIwJrdFUtACIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAgJEQAQEiIAAERAgAgJEQAQEiIAAERAgAgJEHw1p8QBxL7nm/AAAAABJRU5ErkJggg'>");
        } else {
            var photoURL = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=" + placeData[i].photo + 
            "&key=AIzaSyB2Ys8ExJDWr3CF94ia0_Oyxm8gBM87udY";
            placeTitleDiv.append("<img src=" + photoURL + " alt='place photo'>"); 
        }   
    
        //message to disply if rating info not returned from google places query
        if (placeData[i].rating == "undefined") {
            var placeRating = "Not Rated";
        } else {
            var placeRating = placeData[i].rating;
        }

        //message to disply if price info not returned from google places query
        if (placeData[i].price == "undefined") {
            var placePrice = "Not Available";
        } else {
            placePrice = placeData[i].price;
        }

        //dreating div w/ place info//
        divId = i.toString();
        var placeInfoDiv = $("<div id='placeInfo" + divId + "'><span>Rating: " + placeData[i].rating + "</span><span>&nbsp;&nbsp;&nbsp;&nbsp;Price: " + 
        placeData[i].price + "</span></div>");

        //creating div w/ place address//
        var placeAddressDiv = $("<div id='placeAddress" + divId + "'><span>" + placeData[i].address + "</span></div>");

        //creating button to click on for place details//
        var placeDirectionsBtn = $("<button type='button' class='btn btn-defualt placeDirections' id=" + i + ">Get Directions</button>");
        var placeDetailsBtn = $("<button type='button' class='btn btn-default placeDetails' id=" + i + " target='_blank'>Get Details</button>");
        

        //appending place info to place title div//
        placeTitleDiv.append(placeInfoDiv);

        //appending place address div to place title div//
        placeTitleDiv.append(placeAddressDiv);

        //appending the place details button to the place title div//
        placeTitleDiv.append(placeDirectionsBtn);
        placeTitleDiv.append(placeDetailsBtn);

        //appending all that to well//
        placeListItem.append(placeTitleDiv);

        selectedPlacesVal = i;
        placesDiv.append(placeListItem);
    }
    $("#places-div").html(placesDiv);
}

//begin get places details button click function

$(document).on("click", ".placeDetails", function(){
    console.log($(this));

    //getting the localStorage key specific for the clicked item//
    var buttonId = $(this).attr("id");
    var placeNum = buttonId;
    selectedItem = "placesSearchResult" + buttonId;
    var selectedPlaceResult = JSON.parse(localStorage.getItem(selectedItem));
    var selectedPlaceID = selectedPlaceResult.place;
    $(this).remove();
    getPlaceDetails(selectedPlaceID, placeNum);

});

$(document).on("click", ".placeDirections", function() {
    var buttonId = $(this).attr("id");
    selectedItem = "placesSearchResult" + buttonId;

    var selectedPlaceResult = JSON.parse(localStorage.getItem(selectedItem));
    var selectedPlaceID = selectedPlaceResult.place;
    console.log(selectedPlaceID);
    displayMap(selectedPlaceID);

    
})

function displayMap(placeId) {
    var mapOutput = $("#map-output");
    mapOutput.empty();
    var apiKey = "AIzaSyDolYU_CqdXxvNhxq04-ZjcxoiwhV6RiBg";
    var start = venueLatitude + "," + venueLongitude;
    var directionsURL = "https://www.google.com/maps/embed/v1/directions?key=" + apiKey + "&origin=" + start + "&destination=place_id:" + placeId + "&avoid=tolls|highways";

    var map = $("<iframe>").attr("width", "900").attr("height", "500").attr("frameborder","0").attr("style", "border:0").attr("src", directionsURL);
    mapOutput.append(map);
    console.log();
}

function displayDetails(placeDetails, placeNum) {
    
    //Use Button Id from "Get Details" button for "Clear Details" button
    var clearButtonId = placeNum;

    //define id of list item that individual restaurant data is attached to 
    var placeID = "#" +selectedItem;

    //create div for place details
    placeDetailsDiv = $("<div class='placeDetailsDiv'>")

    //create div for phone number

    var placePhone = placeDetails.phone;
    var placePhoneDiv = $("<div id='placePhone" + placeNum + "'><span>" + placePhone + "</span></div>");

    //create div for reviews heading
    var placeReviews = placeDetails.reviews;
    var placeReviewsDiv = $("<div><h4>Reviews</h4></div>");

    //condition based on whether or not review data is available
    if (placeReviews == "None Available") {
        
        //create paragraph for none available text and append to reviews heading
        var review = $("<p>None Available</p>");
        $(placeReviewsDiv).append(review);  
    } else {
        //loop through review data
        for(i=0; i<placeReviews.length; i++) {

            //variable to capture author name
            var authorName = placeReviews[i].author_name;
            
            //variable to capture review author profile photo
            var authorProfilePhoto = placeReviews[i].profile_photo_url;

            //variable to capture review text
            var reviewText = placeReviews[i].text;

            //creating review Header w/author name and profile photo
            var reviewHeader = $("<p><img src=" + authorProfilePhoto + " alt='author profile photo'><span>" + authorName + "</span></p>");

            //create review paragraph and attach to reviews heading
            var review = $("<p class='reviewText'>" + reviewText + "</p>");

            $(placeReviewsDiv).append(reviewHeader);

            $(placeReviewsDiv).append(review);  
        }
    }

    //creating button to click on for cleareing place details//
    var clearDetailsBtn = $("<button type='button' class='btn btn-default removeDetails' id='" + clearButtonId + "' target='_blank'>Clear Details</button>");

    //create anchor tag for place website
    placeWebsiteURL = placeDetails.website;
    if (placeWebsiteURL != undefined) {
        var placeWebsiteDiv = $("<a href='" + placeWebsiteURL + "' id='placeWebsite" + placeNum + "' target='_blank'>" + placeWebsiteURL + "</a>");
    }

    // var placeID = "#" +selectedItem;
    //append place details to existing restaurant general information
    $("#placeAddress" + placeNum).append (placePhoneDiv);  
    $("#placeAddress" + placeNum).append (placeWebsiteDiv);  
    $(placeDetailsDiv).append(placeReviewsDiv);
    $(placeDetailsDiv).append(clearDetailsBtn);
    $(placeID).append(placeDetailsDiv);
}

$(document).on("click", ".removeDetails", function(){

    //capture id of remove details button that was clicked
    var button_id = $(this).attr("id");

    //remove the button and all of the place details information
    $(this).closest("div").remove();

    $("#placePhone" + button_id).remove();
    $("#placeWebsite" + button_id).remove();

     //creating button to click on for place details//
     var placeDetailsBtn = $("<button type='button' class='btn btn-default placeDetails' id=" + button_id + " target='_blank'>Get Details</button>");

     //append place details button to restaurant list item where details were previously displayed.
     $("#placeName" + button_id).append(placeDetailsBtn);
});
