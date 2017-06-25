var fs = require("fs");

exports.main_search = function(req,res){

    fs.readFile("public/html/main_search.html",function(error, data){
        res.send(data.toString());
    });
}

exports.main_search_result = function(req,res){

    var keywordw = req.body.search;
    console.log(keywordw);

    res.render('main_search_result'); 

   //res.send({ keyword: keywordw });
    //res.redirect("/result");


    
    // gRespons = res;
    // gParsingData = null;
    // var parsing = function (){
    //     newsParsing.NewsDataParsing(ViewNewsData);  
    // };

    // parsing();
}