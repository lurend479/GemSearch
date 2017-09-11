var fs = require("fs");
var cheerio = require("cheerio");
var request = require("request");  
var serchFuncJS = require('../public/js/SearchFunc.js');

var isEmpty = function(value){ if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){ return true }else{ return false } };

var SearchGameName;
var SearchKeyword;
var SearchResultList = [];
var SearchGameData;
var GlobalResponse;
var GameSearchDataList = serchFuncJS.GameSearchDataList;

function SiteSearchRequest(gameSearchSiteData)
{
    var searchFullurl = serchFuncJS.ParsingFullUrlNextPage(gameSearchSiteData, SearchKeyword);
    request(searchFullurl, function(error, response, body){
        if(isEmpty(body) == false)
        {
            var loadBody = cheerio.load(body);
            var resultEnd = gameSearchSiteData.SearchFunc(loadBody, gameSearchSiteData);
            if(resultEnd == false)
                SiteSearchRequest(gameSearchSiteData);

            console.log(gameSearchSiteData.SiteName + " 파싱완료!");
        }
        else
            console.log(gameSearchSiteData.SiteName + " 파싱실패!");

        if(resultEnd)
        {
            gameSearchSiteData.SetSearchComplete(true);
            CheckSiteSearchComplete();
        }
    })
}

function CheckSiteSearchComplete()
{
    var parsingEnd = false;

    for(var index = 0 ; index < GameSearchDataList[0].length ; ++index)
    {
        parsingEnd = GameSearchDataList[0][index].SearchComplete;
        if(parsingEnd == false)
            return;
    }
    GlobalResponse.render('main_search_result', {searchResultList:GameSearchDataList[0]});
}

exports.main_search = function(req,res){
    fs.readFile("public/html/main_search.html",function(error, data){
        res.send(data.toString());
    });
}

exports.main_search_result = function(req,res){

    SearchGameName = req.body.GameType;
    SearchKeyword = req.body.search;

    SearchResultList = [];
    SearchGameData = null;
    GlobalResponse = res;

    for(var index = 0 ; index < GameSearchDataList[0].length ; ++index)
    {
        var gameSearchData = GameSearchDataList[0][index];
        gameSearchData.ResetData();
        SiteSearchRequest(gameSearchData);
        SearchResultList.push(new serchFuncJS.GameSearchResultData(gameSearchData.SiteName));
    }
}