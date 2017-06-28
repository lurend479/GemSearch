var fs = require("fs");
var cheerio = require("cheerio");
var request = require("request");  
var urlencode = require('urlencode');

exports.main_search = function(req,res){

    fs.readFile("public/html/main_search.html",function(error, data){
        res.send(data.toString());
    });
}

var isEmpty = function(value){ if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){ return true }else{ return false } };
var searchTitles = [];
var searchTitleHrefs = [];
var count = 0;
var fullCount = 300;
exports.main_search_result = function(req,res){

    var keyword = req.body.search;
    console.log(keyword);

    searchTitles = [];
    searchTitleHrefs = [];
    count = 0;
    var requestFunc = function (index, url){
            var fullUrl = url + index;
            request(fullUrl, function(error, response, body){
                console.log(index);
                
                count++;
                console.log(count);
                if(isEmpty(body) == false)
                {
                    var loadBody = cheerio.load(body);

                    var table = loadBody(".board_list1");
                    

                    var parsingFunction = function(index, data) {
                        if(loadBody(data).hasClass(".ls .tr") == true)
                        {
                        
                        }
                        var postTitle = loadBody(data).find(".sj_ln").text();
                            var postHref = loadBody(data).find(".sj_ln").attr("href");

                            searchTitles.push(postTitle);
                            searchTitleHrefs.push(postHref);
                    }

                    var postElements = loadBody("table tr .tr");
                    postElements.each(parsingFunction);
                }
                
                if(count >= fullCount)
                {
                    count = 0;
                    res.render('main_search_result', {searchTitles: searchTitles, searchTitleHrefs: searchTitleHrefs});
                }
            })
        };

    var url = "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword="+urlencode(keyword)+"&come_idx=";

    for(var index = 3000 ; index < 3000 + fullCount ; ++index)
    {
        requestFunc(index, url);
    }


     
}