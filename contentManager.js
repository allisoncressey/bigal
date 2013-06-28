var contentArrays = (function(){
	return {
		flickrImages:[],
		tumblrImages:[],
		tumblrVideos:[]
	}
})();

var contentManager = (function(){
	var flickr = {
		key: "562c55176e6e55c5bb6200df52bf10da",
		secret: "1fb761ed3016b0d5",
		set:"72157633155822683"
	},

	tumblr = {
		photo_url:"http://api.tumblr.com/v2/blog/allisoncressey.tumblr.com/posts/photo?api_key=XIq5UoFqBpGJP0J8hCwir86DdUSykPXflUNWpTmCBAuKuFIp6N&callback=",
		video_url:"http://api.tumblr.com/v2/blog/allisoncressey.tumblr.com/posts/video?api_key=XIq5UoFqBpGJP0J8hCwir86DdUSykPXflUNWpTmCBAuKuFIp6N&callback="
	},
	ajaxFunction = function(){
		var xmlhttp; 
        try { xmlhttp = new XMLHttpRequest();}
        catch (e) {
            try { xmlhttp = new ActiveXObject("Msxml2.XMLHTTP"); }
            catch (e) {
                try { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }
                catch (e) { console.log('no ajax?'); return false; }
            }
        }
        return xmlhttp;
	},

	
	getFlickr = function(){
		var this_url = "http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key="+flickr.key+"&photoset_id=72157633155822683&format=json"
		$.ajax({
		    dataType: 'jsonp',
		    url: this_url,
		     jsonp: "callback",
		     success: function (data) {
		    	//photoData = data;

		    	//compilePhotoDivs();

		  },
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

	    			var newHTML = "<img src='"+data.response.posts[i].photos[0].original_size.url+"' />"

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

		    		contentArrays.tumblrVideos.push(data.response.posts[i].player[0].embed_code);

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

	getTumblrPhotos(function(){
		getTumblrVids(function(){
			getFlickr()
		})
	});

	return {
		processPhotos:function(photoData,cb){
			console.log(photoData);
			var body = document.getElementsByTagName('body')[0];
			for(i=0;i<photoData.photoset.photo.length;i++){
				var farm = photoData.photoset.photo[i].farm,
					server = photoData.photoset.photo[i].server,
					id = photoData.photoset.photo[i].id,
					secret = photoData.photoset.photo[i].secret,
					listitems = '<img src="http://farm'+farm+'.staticflickr.com/'+server+'/'+id+'_'+secret+'.jpg" />';

				contentArrays.flickrImages.push(listitems);

				if (i == photoData.photoset.photo.length-1){
    				cb();
    				return
    			}
			}
		}
	}
})();

	// callback for flickr API
function jsonFlickrApi(data){
 	contentManager.processPhotos(data,function(){
 		console.log('everything loaded!');
 		//console.log(contentArrays.tumblrImages,contentArrays.tumblrVideos,contentArrays.flickrImages);
 	})
}
