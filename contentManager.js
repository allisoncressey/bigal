var contentArrays = (function(){
	return {
		flickrImages:[],
		tumblrImages:[],
		tumblrVideos:[],
		oneOffResources:[
        {source : "<!-- EXAMPLE -- put html of individual images, vids, swfs, etc. -->", putOnLine : 3, putInAsNumber : 1},
		{source : "<!-- separate each string with a comma. no comma after the last one -->", putOnLine : 3, putInAsNumber : 1 },
		],
		heightOfImages:"330px"
	}
})();

var contentConfig = (function(){
    return {
        randomizeTumblr : false,    // true or false
        randomizeFlicr: false,      // true or false
        numberOfRows: 3,           // number, no quotes
        itemsPerRow : 10,           // number, no quotes
        putFlickrOnLine : 3,        // number, cannot be higher than numberOfRows
        putTumblrOnLine : 2,        // number, cannot be higher than numberOfRows
    }
})();

var contentManager = (function(){

    var rowItems = [];
	var flickr = {
		key: "562c55176e6e55c5bb6200df52bf10da",
		secret: "1fb761ed3016b0d5",
		set:"72157633155822683"
	},

	tumblr = {
		photo_url:"http://api.tumblr.com/v2/blog/allisoncressey.tumblr.com/posts/photo?api_key=XIq5UoFqBpGJP0J8hCwir86DdUSykPXflUNWpTmCBAuKuFIp6N&callback=",
		video_url:"http://api.tumblr.com/v2/blog/allisoncressey.tumblr.com/posts/video?api_key=XIq5UoFqBpGJP0J8hCwir86DdUSykPXflUNWpTmCBAuKuFIp6N&callback="
	},
	
	getFlickr = function(){
		var this_url = "http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key="+flickr.key+"&photoset_id=72157633155822683&format=json"
		$.ajax({
		    dataType: 'jsonp',
		    url: this_url,
		    jsonp: "callback"
	    });
	},
	getTumblrPhotos = function(cb){
		$.ajax({
		    dataType: 'jsonp',
		    url: tumblr.photo_url,
		     jsonp: "callback",
		     success: function (data) {
		    	for (i=0;i<data.response.posts.length;i++){

	    			//var img = document.createElement('img');
	    			//img.src = data.response.posts[i].photos[0].original_size.url;
	    			//img.style.height = "200px";

	    			var newHTML = "<img src='"+data.response.posts[i].photos[0].original_size.url+"' height='"+contentArrays.heightOfImages+"' />"

	    			contentArrays.tumblrImages.push(newHTML);

	    			if (i == data.response.posts.length-1){
	    				cb();
	    				return
	    			}
		    	};
		  },
	  });
	}
	getTumblrVids = function(cb){
		$.ajax({
		    dataType: 'jsonp',
		    url: tumblr.video_url,
		     jsonp: "callback",
		     success: function (data) {
		     	console.log(data);
		    	for (i=0;i<data.response.posts.length;i++){

		    		contentArrays.tumblrVideos.push(data.response.posts[i].player[2].embed_code);

	    			//var target = document.body

	    			//target.innerHTML += newHTML;
	    			if (i == data.response.posts.length-1){
	    				cb();
	    				return
	    			}
		    	};
		  	},
	  	});
	}
    getOneOffItems = function(cb){
        for (var i = 0; i < contentArrays.oneOffResources.length; i++) {
        var items = contentArrays.oneOffResources;
        console.log(items[i].source,items[i].putOnLine);

        if (items[1].putOnLine > contentConfig.numberOfRows){
            console.log("cannot put resource "+i+" on row "+items[i].putOnLine+". numberOfRows is "+contentConfig.numberOfRows);
        }


        }
        cb();
    }

    workWithLoadedData = function(){
 		console.log('everything loaded!');
 		var totalArray = contentArrays.tumblrImages.concat(contentArrays.flickrImages).concat(contentArrays.tumblrVideos).concat(contentArrays.oneOffResources);

		console.log(totalArray);

		var contentBlock = '';
		var count = 0;

		while (totalArray.length > 0){

			var luckyNumber = Math.floor(Math.random() * (totalArray.length - 1));

			var luckySubject = totalArray.splice(luckyNumber,1);
			console.log(totalArray.length,luckyNumber,luckySubject);

			contentBlock += luckySubject[0];
			count++;

			if (count % 10 == 0 || totalArray.length == 0){
				var scrollable = document.createElement('div');
				scrollable.className = "makeMeScrollable";

				scrollable.innerHTML = contentBlock;
				var target = document.getElementById("contentArea");
				console.log(target);
				target.appendChild(scrollable);

				contentBlock = '';
				count = 0;	
			}
			//document.body.innerHTML += luckySubject+"<br />";
		}

		if (totalArray.length == 0){
			$("div.makeMeScrollable").smoothDivScroll({
				touchScrolling: true,
				manualContinuousScrolling: true,
				hotSpotScrolling: false,
				mousewheelScrolling: false
			});
		}

        cb()
 	}

    processPhotos = function(photoData,cb){
        console.log('processPhotos called');
		console.log(photoData);
		var body = document.getElementsByTagName('body')[0];
		for(i=0;i<photoData.photoset.photo.length;i++){
			var farm = photoData.photoset.photo[i].farm,
				server = photoData.photoset.photo[i].server,
				id = photoData.photoset.photo[i].id,
				secret = photoData.photoset.photo[i].secret,
				listitems = '<img src="http://farm'+farm+'.staticflickr.com/'+server+'/'+id+'_'+secret+'.jpg" height="'+contentArrays.heightOfImages+'"/>';

			contentArrays.flickrImages.push(listitems);

			if (i == photoData.photoset.photo.length-1){
    			cb();
    			return
    		}
		}
	}

    continuePlease = function(){
        console.log('flickr Finished');
        getOneOffItems(function(){
            workWithLoadedData();
        });
    }


        // starting point for program
	getTumblrPhotos(function(){
		getTumblrVids(function(){
			getFlickr();
		});
	});


            
   

	return {
        flickrCallback : function(data){
            processPhotos(data,function(){
                continuePlease()
            })
        }
	}
})();

	// callback for flickr API
function jsonFlickrApi(data){
 	contentManager.flickrCallback(data);
    //console.log("jsonp came back");
}
