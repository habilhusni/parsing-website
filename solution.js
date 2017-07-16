//Some Modules
const request 			= require('request'),
			cheerio 			= require('cheerio'),
			htmlparser2 	= require('htmlparser2'),
			promise   		= require('bluebird'),
			asyncLoop 		= require('node-async-loop'),
			fs						= require('fs');

//Some variables
var docsCategories 	= '',
		categories 			= [],
		promosUrl				= [],
		realPromo				= [],
		mainUrl					= 'https://m.bnizona.com/index.php/category/index/promo';





/*----------------------------- FUNCTIONS -----------------------------------------*/

//Scraping promo title from html
var parsingCategories = function(docs) {
	var domCat 		  = htmlparser2.parseDOM(docs),
			$ 				  = cheerio.load(domCat);

	var listCat     = $('.menu').find('li');//List of promo

	//From each promo get it's title 
	listCat.each(function(i) {
		categories[i] = $(this).text();
		promosUrl[i]	= $(this).find('a').attr('href');
		let edge  		= categories[i].length - 2;
		categories[i] = categories[i].slice(8, edge); 			
	});
}

//Scraping content from each promo in html
var parsingPromo = function(docs, promo) {
	var 	domPro 		= htmlparser2.parseDOM(docs),
				$pro 			= cheerio.load(domPro);

	var listPro     = $pro('.list2').find('li'),//List of content of each promo
			promoText		= [],
			promoImage 	= [];

	//From each content get it's title, text content, valid content, and imageUrl  
	listPro.each(function(j) {
		promoText[j] 	= $pro(this).text();
		let ujung 		= promoText[j].length - 7;
		promoText[j] 	= promoText[j].slice(23, ujung).replace(/(\n|\t)/g, ' ').replace(/  +/g, ',');
		promo[j]			= promoText[j].split(',');

		let img				= $pro(this).children('a').children('img');
		promoImage[j]	= $pro(img).attr('src');
		promo[j].push(promoImage[j]);			
	});
}

//Get JSON result
var parsingResult = function(categories, realPromo) {

	//Converting each category and each content of promo into json
	function contentToJson() {
		let arrPromo = [];
		let obj 		 = {};

		for(let i=0; i<categories.length; i++) {
			arrPromo[i]  = realPromo[i].map((promo, j) => {
													let content  = promo.slice(1, (promo.length)-2).join(',');
													var contents = {
																					'Title': promo[0],
																					'Content': content,
																					'Valid': promo[(promo.length)-2],
																					'ImageUrl': promo[(promo.length)-1]
																				 }
													return contents;							 
												});

			obj[categories[i]] = arrPromo[i];
		}

		return obj;
	}

	var json = contentToJson();

	//Create file solution.json
	fs.writeFile ("solution.json", JSON.stringify(json, null, '\t'), function(err) {
    if (err) throw err;
    console.log('Creating solution.json completed!\n');
  });

	return json;
}

//Looping the array of url request (asyncRequest)
var loopTheAsync = function(arrUrl) {
	asyncLoop(arrUrl, function (url, next) {
	  request(url, function (error, response, body) {
	  	if(error) {
	  		next(error);
	      return;
	  	}

			var docsPromo 	= body,
			promo 					= [];

			//Get content list from each promo
			parsingPromo(docsPromo, promo);

			//Contents of promo copied to realPromo array 
			realPromo.push(promo);

			next();
		});
	}, function(err) {
	  if(err) {
	    console.error('Error: ' + err.message);
	    return;
	  }

	  //Getting data result and convert it to solution.json
	  parsingResult(categories, realPromo);
	});
}

//Parsing main url
var getAll   = function(url) {
	return new promise(function(resolve) {
		
		//Get request html
		request(url, function (error, response, body) {

			docsCategories 			= body;//Get body from url

			//Get list of promo's title and promosUrl
			parsingCategories(docsCategories);

		  console.log('Getting url...');

			resolve(promosUrl);

		});

	});
}





/*---------------------------------- MAIN FUNCTION --------------------------------------*/

//Call the main content
getAll(mainUrl)
	.then(function(promosUrl) {
		loopTheAsync(promosUrl);	
	});