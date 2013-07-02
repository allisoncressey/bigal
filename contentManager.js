var contentArrays = (function(){
	return {
		flickrImages:[],
		tumblrImages:[],
		tumblrVideos:[],
		oneOffResources:[



            // These one-off resources are meant to be inserted into a flickr or Tumblr row
            //
            // You can put as many one-offs between flickr images as you want
            //
            // You could also make a whole row of just one-offs

        {source : "<!-- EXAMPLE -- put html of individual images, vids, swfs, etc. -->", putOnLine : 3, putInAsNumber : 1},
		{source : "<!-- separate each string with a comma. no comma after the last one -->", putOnLine : 3, putInAsNumber : 1 },
		],
		heightOfImages:"100%",
        flickrSets : [
            {setid: "72157633155822683"},
            {setid: "72157632430836699"},
            {setid: "72157632210453982"}

            // add as needed
        ],

            // This is where you plot out how each row is going to look
            //
            // The template for a flickr looks like this:  {type: "flickr", setid: "72157633155822683" , title: "Set 1", blurb: "This is project A"},
            // You need to also be sure to add the set id to flickrSets above so that the urls load
            //
            // Tumblr looks like {type: "tumblr"}
            //
            // If you want an extra row to put one-offs by themselves, do this {type: "extra"}
            // Without this "extra" row, the one one-offs listed above wont have a place to live 
            // (thhat is, you cant put them in a row if that row doesn't exist)
            
        rows : [
            {type: "flickr", setid: "72157633155822683" , title: "Set 1", blurb: "This is project A"},
            {type: "flickr", setid: "72157632430836699" , title: "Set 2", blurb: "This is project B"},
            {type: "flickr", setid: "72157632210453982" , title: "Set 3", blurb: "This is project C"},
            {type: "tumblr"}
            //,{type: "extra"}
        ]
	}
})();

var contentConfig = (function(){
    return {
        MaxItemsPerRow : 25,           // number, no quotes
        putTumblrOnLine : 4,       // number, cannot be higher than numberOfRows, or null. randomizedTumblr must be false
        maxTumblrVideos : 5,
        maxTumblrImages : 25,   // tumblr's max is 20. they're dumb
    }
})();

var contentManager = (function(){

    contentConfig.putTumblrOnLine--;

    var rowItems = [];
	var flickr = {
		key: "562c55176e6e55c5bb6200df52bf10da",
		secret: "1fb761ed3016b0d5"
	},

	tumblr = {
		photo_url:"http://api.tumblr.com/v2/blog/allisoncressey.tumblr.com/posts/photo?api_key=XIq5UoFqBpGJP0J8hCwir86DdUSykPXflUNWpTmCBAuKuFIp6N&callback=",
		video_url:"http://api.tumblr.com/v2/blog/allisoncressey.tumblr.com/posts/video?api_key=XIq5UoFqBpGJP0J8hCwir86DdUSykPXflUNWpTmCBAuKuFIp6N&limit="+contentConfig.maxTumblrVideos
	},
	
	getFlickrSets = function(){

        for (i=0;i<contentArrays.flickrSets.length;i++){

            var this_url = "http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=";
            this_url += flickr.key;
            this_url += "&photoset_id=";
            this_url += contentArrays.flickrSets[i].setid;
            this_url += "&format=json";

            $.ajax({
                dataType: 'jsonp',
                url: this_url,
                jsonp: "callback"
            });

        }
		
	},
	getTumblrPhotos = function(cb){
		$.ajax({
		    dataType: 'jsonp',
		    url: tumblr.photo_url,
		     jsonp: "callback",
		     success: function (data) {
                console.log(data);
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

                    videoType = '';

                    var source = data.response.posts[i].player[2].embed_code
                    var pat = /http(.)*(\?){1}/;

                    var match = pat.exec(source);

                    if (match){
                        match[0] = match[0].replace("?","");
                        console.log(match[0]);
                        type = 'youtube';
                    } else {
                        pat = /http(.)*(video\/[0-9]{8}){1}/
                        match = pat.exec(source);
                        if (match){
                            console.log(match[0])
                        }
                        type = 'vimeo'
                    }
                    console.log(type);

                    
                    var domFrame = document.createElement('iframe');

                    domFrame.src = match[0];

                    if (type == 'youtube'){
                        domFrame.src += "?modestbranding=1&fs=0";
                    }

                    domFrame.style.width = data.response.posts[i].player[2].width+"px";
                    domFrame.style.height = "330px";//contentArrays.heightOfImages;

                    console.log(domFrame.outerHTML);

                    // var iframe = "<iframe height='";
                    // iframe += contentArrays.heightOfImages;
                    // iframe += "' src='";
                    // iframe += data.response.posts[i].permalink_url;
                    // if (type == 'youtube'){
                    //     iframe += "fs=0";
                    // }
                    // iframe += "''></iframe>"

		    		contentArrays.tumblrVideos.push(domFrame.outerHTML);

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

    workWithLoadedData = function(cb){
 		console.log('everything loaded! starting to load resources');

        var rows = contentArrays.rows;
	
        for (i=0;i<rows.length;i++){
            if (rows[i].type == "flickr"){
                returnLineOfCertainItems(contentArrays.flickrImages[rows[i].setid],rows[i].type)
            } else if (rows[i].type == "tumblr"){
                returnLineOfCertainItems(contentArrays.tumblrImages.concat(contentArrays.tumblrVideos),rows[i].type);
            } else if (rows[i].type == "extra"){
                var blank = [];
                returnLineOfCertainItems(blank,rows[i].type)
            }
        }
        initiateScroll();
 	}

    plotRows = function(){

    }

    returnLineOfCertainItems = function (arrayOfThisType,type) {

        var contentBlock = '';
        var count = 0;

        while (true){
        console.log('true loop running');
            // pick a random item from an array
            var luckyNumber = Math.floor(Math.random() * (arrayOfThisType.length - 1));
            var luckySubject = arrayOfThisType.splice(luckyNumber, 1);

            // concat that item into a block of content
            luckySubject[0]? contentBlock += luckySubject[0] : contentBlock += "TOO MANY ROWS";

            // keep count of how many items are in the block of content
            count++;

            // if the amt of items in the block of content equals the config, poop the block out onto the page and reset the block
            if (arrayOfThisType.length == 0) {
                var scrollable = document.createElement('div');
                scrollable.className = "makeMeScrollable";

                scrollable.innerHTML = contentBlock;
                var target = document.getElementById("contentArea");
                console.log(target);
                if (scrollable.dataset){
                    scrollable.dataset.contentType = type;
                }

                target.appendChild(scrollable);

                return;
            }
        }
    }

    processFlickrResponse = function(photoData,cb){
        console.log('processFlickrResponse called');
		console.log(photoData);
		var body = document.getElementsByTagName('body')[0];
        contentArrays.flickrImages[photoData.photoset.id] = [];
		for(i=0;i<photoData.photoset.photo.length;i++){
			var farm = photoData.photoset.photo[i].farm,
				server = photoData.photoset.photo[i].server,
				id = photoData.photoset.photo[i].id,
				secret = photoData.photoset.photo[i].secret,
				listitems = '<img src="http://farm'+farm+'.staticflickr.com/'+server+'/'+id+'_'+secret+'.jpg" height="'+contentArrays.heightOfImages+'"/>';

			contentArrays.flickrImages[photoData.photoset.id].push(listitems);


                // array retruns 0 length??? manually get length
            imageSetCount = 0;
            for (l in contentArrays.flickrImages){
                imageSetCount++;
            }

			if (i == photoData.photoset.photo.length-1 && (imageSetCount == contentArrays.flickrSets.length)){
                console.log(contentArrays.flickrImages);
    			cb();
    			return
    		}
		}
	}

    continuePlease = function(){
        console.log('flickr Finished');
        getOneOffItems(function(){
            workWithLoadedData(function(){
                console.log('done working with data');
            });
        });
    }


        // starting point for program
	getTumblrPhotos(function(){
		getTumblrVids(function(){
			getFlickrSets();
		});
	});

    initiateScroll = function(){
        $("div.makeMeScrollable").smoothDivScroll({
            touchScrolling: true,
            manualContinuousScrolling: true,
            hotSpotScrolling: false,
            mousewheelScrolling: false
        });
    }
            
   

	return {
        flickrCallback : function(data){
            processFlickrResponse(data,function(){
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
