//Some Modules
const request 			= require('request'),
			cheerio 			= require('cheerio'),
			htmlparser2 	= require('htmlparser2'),
			promise   		= require('bluebird');

//Variables
var docsCategories	= '',
		docsPromo				= '',
		promo   				= [],
		categories 			= [];

var urlCategories 	= 'https://m.bnizona.com/index.php/category/index/promo',
		urlPromo				= ['https://m.bnizona.com/promo/index/16',
											 'https://m.bnizona.com/promo/index/17',
											 'https://m.bnizona.com/promo/index/18',
											 'https://m.bnizona.com/promo/index/19',
											 'https://m.bnizona.com/promo/index/20',
											 'https://m.bnizona.com/promo/index/21',
											 'https://m.bnizona.com/promo/index/23',
											 'https://m.bnizona.com/promo/index/24',
											 'https://m.bnizona.com/promo/index/25',
											 'https://m.bnizona.com/promo/index/26',
											 'https://m.bnizona.com/promo/index/28',
											 'https://m.bnizona.com/promo/index/34',
											 'https://m.bnizona.com/promo/index/44',
											 'https://m.bnizona.com/promo/index/45' ];

//Get Categories from Url
var getCategories 			= function(url) {
	return new promise(function(resolve) {
		request.get(url, function (error, response, body) {

			docsCategories 		= body;

				var 	domCat 		= htmlparser2.parseDOM(docsCategories),
							$ 				= cheerio.load(domCat);

				var listCat     = $('.menu').find('li');

				listCat.each(function(i) {
					categories[i] = $(this).text();
					let edge  		= categories[i].length - 2;
					categories[i] = categories[i].slice(8, edge); 			
				});
		
				resolve(categories);
		})
	});
}

//Get One Promo from Each Categories
var getPromo 						= function(url) {
	return new promise(function(resolve) {
		request.get(url, function (error, response, body) {

			docsPromo 				= body;

				var 	domPro 		= htmlparser2.parseDOM(docsPromo),
							$pro 			= cheerio.load(domPro);

				var listPro     = $pro('.list2').find('li'),
						promoText		= [],
						promoImage 	= [];

				listPro.each(function(i) {
					promoText[i] 	= $pro(this).text();
					let ujung 		= promoText[i].length - 7;
					promoText[i] 	= promoText[i].slice(23, ujung).replace(/(\n|\t)/g, ' ').replace(/  +/g, ',');
					promo[i]			= promoText[i].split(',');

					let img				= $pro(this).children('a').children('img');
					promoImage[i]	= $pro(img).attr('src');
					promo[i].push(promoImage[i]);			
				});
				
				resolve(promo);	
		})
	});
}

//Showing Categories and One Promo
getCategories(urlCategories)
	.then(setTimeout(function() {
    console.log(categories);
  }, 1000))
  .then(getPromo(urlPromo[0]))
  .then(setTimeout(function() {
    console.log(promo);
  }, 1000))
