require("dotenv").config();
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs");

var spotify = new Spotify(keys.spotify);


//function for picking name from a collection of objects in an array
function filter(array) {
	let passed = [];
	for (let element of array) {
		passed.push(element.name);
	  }
	return passed;
}

//This function logs the message to both the console and a text file txt.log
function writeMessage(message){
	console.log(message);
	fs.appendFile("log.txt",message,function(err){
		if (err) throw err;
	});
}

//function to process the command
function processCommand(command, subject){
	switch (command) {
		case "concert-this":
			var artist = subject;
			axios
				.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp")
				.then(
					function (response) {
						var bandsintownData = response.data
						for (var i = 0; i < bandsintownData.length; i++){
							var message = "\n----------------------------------- Bands in Town -----------------------------------\n" + 
										"Name of the venue: " + bandsintownData[i].venue.name + "\n" + 
										"Venue Location: " + bandsintownData[i].venue.city + ", "+ bandsintownData[i].venue.region + ", " + bandsintownData[i].venue.country + "\n" +
										"Date of Event: " + moment(bandsintownData[i].datetime).format("MM/DD/YYYY") +
										"\n-----------------------------------------------------------------------------------\n";							
							writeMessage(message);		
						};  
					})
					.catch(function(err){
						console.log(err);
					})
			break;
		case "spotify-this-song":
			var track = subject;
			spotify.search({ type: 'track', query: track })
					.then(function(response) {
						for (var i = 0; i<response.tracks.items.length; i++){
							var message = "\n------------------------------------ Spotify Song ----------------------------------\n" + 
										"Artist(s) " + filter(response.tracks.items[i].album.artists).join(' ') + "\n" +
										"Song's name " + response.tracks.items[i].name + "\n" +
										"A preview link " + response.tracks.items[i].external_urls.spotify + "\n" +
										"The album name " + response.tracks.items[i].album.name + "\n" +
										"-----------------------------------------------------------------------------------\n";  
							writeMessage(message);				
						}
					})
					.catch(function(err) {
					console.log(err);
				});
			break;
		case "movie-this": 
			var movie = subject;
			axios
			.get("https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy")
			.then(
				function (response) {

					var message = "\n-------------------------------------- Movie ----------------------------------------\n" + 
								"Title of the movie:  " + response.data.Title + "\n" + 
								"Year the movie came out:  " + response.data.Year + "\n"; 
								if (response.data.Ratings.length >= 2){
									message = message + "IMDB Rating of the movie:  " + response.data.Ratings[0].Value + "\n" +
									"Rotten Tomatoes Rating of the movie:  " + response.data.Ratings[1].Value + "\n";
								}else if (response.data.Ratings.length == 1){
									message = message + "IMDB Rating of the movie:  " + response.data.Ratings[0].Value + "\n";
								}
								message = message + "Country where the movie was produced:  " + response.data.Country + "\n" +
								"Language of the movie:  " + response.data.Language + "\n"+ 
								"Plot of the movie:  " + response.data.Plot + "\n" +
								"Actors in the movie:  " + response.data.Actors + "\n" +
								"-----------------------------------------------------------------------------------\n";  
					writeMessage(message);
				})
			.catch(function(err){
				console.log(err);
			})
			break;
		case "do-what-it-says":
			fs.readFile("random.txt", "utf8", function(err, data){
				var arr = data.trim().split("\n"); 
				for (var i=0; i<arr.length; i++){
					x = arr[i].split(",");
					processCommand(x[0].trim(), x[1].split(" ").join("+"))
				}
			})
			break;
		default:
			var message = "Unknown command '" + command + "' submitted.\n";
			writeMessage(message);
			break;
	};
}

// get the command line argument and process the command
var command = process.argv.slice(2);
var action = command[0].toLocaleLowerCase()
var subject = process.argv.slice(3).join("+")
processCommand(action, subject)