var fs = require("fs");
var cheerio = require("cheerio");
var request = require("request");  

exports.main_search = function(req,res){

    fs.readFile("public/html/main_search.html",function(error, data){
        res.send(data.toString());
    });
}

exports.main_search_result = function(req,res){

    var keyword = req.body.search;
    console.log(keyword);

    var url = "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=" + keyword + "&x=22&y=2&come_idx=3911&iskin=&mskin=&p=1&query=list&my=&category=&sort=PID&orderby=&sterm=";
    request(url, function(error, response, body){
                var loadBody = cheerio.load(body);

                var newsTitles = [];
                var newsTitleHrefs = [];

                var parsingFunction = function(index, data) {
                var postTitle = loadBody(data).text();
                var postHref = loadBody(data).attr("href");

                newsTitles.push(postTitle);
                newsTitleHrefs.push(postHref);
                }
                //console.log(body);
                var postElements = loadBody("table .sj_ln");
                postElements.each(parsingFunction);

                console.log(newsTitles);

            })





// 
    res.render('main_search_result'); 
}