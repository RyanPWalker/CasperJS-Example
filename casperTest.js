var casper = require('casper').create({
	viewportSize: {
		width: 640,
		height: 720
	}
});
var fs = require('fs');
var responseMsg;
var check;



//remember...http != https :P
casper.start('https://youtube.com', function(){
	try{
    this.sendKeys('input#masthead-search-term', 'Puppies');
    check = true;
  } catch(e){
  	check = false;
  }
});

casper.then(function(){
	if(check){
		this.click('button#search-btn');
	}
});

casper.then(function(){
	if(check){
		try{
			this.waitForSelector("body#body", function then(){
      //don't do anything...
    },function timeout(){
      //don't do anything....
    }, 5000);} catch(e){
				check = false;
			}
		}
	});

casper.then(function(response){
	if(check){
		if(response.status == 200){
			responseMsg = "Good";
		} else{
			responseMsg = "Bad";
		}
	} else{
		responseMsg = "Bad";
	}
});

casper.then(function() {
	if(check){
		this.capture('YouTube.png', {
			top: 0,
			left: 0,
			width: 640,
			height: 720
		});
	}
	fs.write('check.txt', responseMsg);
});

casper.run();