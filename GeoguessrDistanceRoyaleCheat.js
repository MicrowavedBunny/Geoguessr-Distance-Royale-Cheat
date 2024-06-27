// ==UserScript==
// @name		Geoguessr Distance Royale Cheat
// @version		1.0.0
// @description
// @author		MicrowavedBunny
// @require https://code.jquery.com/jquery-3.1.1.min.js
// @require https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery-migrate/3.3.2/jquery-migrate.js
// @require     https://cdn.jsdelivr.net/gh/bigdatacloudapi/js-reverse-geocode-client@latest/bigdatacloud_reverse_geocode.min.js
// @match		https://www.geoguessr.com/*
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var locationInfo;

function getTargetUrl() {
	const raw = document.querySelectorAll("#__NEXT_DATA__")[0].text;
	const json = JSON.parse(raw);
	const rounds = json.props.pageProps.game.rounds;
	console.log(rounds);
	const currentRound = rounds[rounds.length - 1];

	const targetUrl = "https://google.com/maps/place/" + currentRound.lat + "," + currentRound.lng;

	return targetUrl;
}

function getLat(d) {
	const json = JSON.parse(d);
	const rounds = json.rounds;
	const currentRound = rounds[rounds.length - 1];

	return currentRound.lat;
}

function getLng(d) {
	const json = JSON.parse(d);
	const rounds = json.rounds;
	const currentRound = rounds[rounds.length - 1];

	return currentRound.lng;
}

function getRound(d) {
	const json = JSON.parse(d);
	const round = json.currentRoundNumber;

	return round;
}

function getToken() {
	const raw = document.querySelectorAll("#__NEXT_DATA__")[0].text;
	const json = JSON.parse(raw);
	const token = json.query.token;

	return token;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(function() {
	'use strict';
    var reverseGeocoder=new BDCReverseGeocode();
    var roundn = 0;
		var guessr = function () {
			let done = Array.from(document.getElementsByClassName("popup-view__header")).find(e => e.innerText.includes('qualified'));
			if (done){
				console.log("done here");
			}
			if (!done){
				function $(d) { return document.getElementById(d); }
				roundn += 1;

				GM_xmlhttpRequest({
					method: "post",
					url: "https://game-server.geoguessr.com/api/battle-royale/"+getToken()+"/guess",
					headers: { "Content-type" : "application/json" },
					data: "{\"lat\":\"-33.86880111694336\",\"lng\":\"151.2093048095703\",\"roundNumber\":"+roundn+"}",
					onload: function(e) { //console.log(e)
						console.log("Send india guess for round "+getRound(e.responseText));
                        console.log(e.responseText);
						/* Get the administrative location information using a set of known coordinates */
						reverseGeocoder.getClientLocation({
							latitude: getLat(e.responseText),
							longitude: getLng(e.responseText),
						},async function(result) {

// 							console.log(getLat(e.responseText) + " " + getLng(e.responseText));
//                             $.getJSON("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+getLat(e.responseText)+"&longitude="+getLng(e.responseText)+"&localityLanguage=en",
//                                 function(countryResults) {
//                                 console.log(countryResults.countryName);
//                             })
                            GM_xmlhttpRequest({
                                method: "get",
                                url: "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+getLat(e.responseText)+"&longitude="+getLng(e.responseText)+"&localityLanguage=en",
                                onload: function(response) {
                                locationInfo = JSON.parse(response.responseText);
                                //console.log(locationInfo.countryName);
                            }
                        });

// 							await sleep(3000);
						});
					}
				});}
		};
    var restarter = function () {
			let but = Array.from(document.getElementsByClassName("button button--medium button--ghost")).find(e => e.textContent === 'Play again');
		if(but){
			but.click();
		}
	};
	window.setInterval(guessr, 10000);
 	window.setInterval(restarter, 30000);
    document.onkeydown = evt => {
        evt = evt || window.event;
        if(evt.shiftKey && evt.altKey && evt.keyCode == 70){
            GM_xmlhttpRequest({
					method: "post",
					url: "https://game-server.geoguessr.com/api/battle-royale/"+getToken()+"/guess",
					headers: { "Content-type" : "application/json" },
					data: "{\"lat\":"+locationInfo.latitude+",\"lng\":"+locationInfo.longitude+",\"roundNumber\":"+roundn+"}",
            onload: function(e) {
            }
            });
            //window.open("https://google.com/maps/place/" + locationInfo.latitude + "," + locationInfo.longitude, '_blank');
            //alert(locationInfo.countryName + ", " + locationInfo.principalSubdivision + ", " + locationInfo.city);
        }
        if(evt.shiftKey && evt.altKey && evt.keyCode == 71){
            window.open("https://google.com/maps/place/" + locationInfo.latitude + "," + locationInfo.longitude, '_blank');
        }
        if(evt.shiftKey && evt.altKey && evt.keyCode == 72){
        alert(locationInfo.countryName + ", " + locationInfo.principalSubdivision + ", " + locationInfo.city);
        }
    };
})();

