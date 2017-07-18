var fs = require("fs");
var cheerio = require("cheerio");
var request = require("request");  
var urlencode = require('urlencode');
var serchFuncJS = require('../public/js/SearchFunc.js');

var isEmpty = function(value){ if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){ return true }else{ return false } };

var GameSearchSiteBaseData = function(siteName, siteUrl_1, siteUrl_2, serchFunc) 
{
    this.SiteName = siteName;
    this.SiteUrl_1 = siteUrl_1;
    this.SiteUrl_2 = siteUrl_2;
    this.SearchFunc = serchFunc;
    this.SearchComplete = false;
}

GameSearchSiteBaseData.prototype.SetSearchComplete = function(complete)
{
    this.SearchComplete = complete;
}

var GameSearchBaseData = function(gameName, gameSearchSiteBaseDatas) 
{
    this.GameName = gameName;
    this.GameSearchSiteBaseDatas = gameSearchSiteBaseDatas;
}

GameSearchBaseData.prototype.SetGameSearchComplete = function(complete)
{
    for(var index = 0 ; index < this.GameSearchSiteBaseDatas.length ; ++index)
    {
        this.GameSearchSiteBaseDatas[index].SetSearchComplete(complete);
    }
}

GameSearchBaseData.prototype.IsGameSearchComplete = function()
{
    for(var index = 0 ; index < this.GameSearchSiteBaseDatas.length ; ++index)
    {
        if(this.GameSearchSiteBaseDatas[index].SearchComplete == false)
            return false;
    }

    return true;
}

var GameSearchBaseDatas = new Array(
    new GameSearchBaseData("오버워치",
        new Array(
            new GameSearchSiteBaseData("인벤_오버워치_자유게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4538", Search_Inven),
            new GameSearchSiteBaseData("인벤_오버워치_토론", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4796", Search_Inven),
            new GameSearchSiteBaseData("인벤_오버워치_최신유저정보", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4677", Search_Inven),
            new GameSearchSiteBaseData("인벤_오버워치_팁과 노하우", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4680", Search_Inven),
            new GameSearchSiteBaseData("인벤_오버워치_대회/e스포츠 게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4786", Search_Inven),
            new GameSearchSiteBaseData("인벤_오버워치_질문과 답변", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4676", Search_Inven),
            new GameSearchSiteBaseData("인벤_오버워치_사건/사고 게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4751", Search_Inven)
            // new GameSearchSiteBaseData("디씨_오버워치갤러리", "http://gall.dcinside.com/board/lists/?id=overwatch&s_type=search_subject&s_keyword=", "", Search_DC),
            // new GameSearchSiteBaseData("블리자드_전체토론장", "https://kr.battle.net/forums/ko/overwatch/search?q=", "", Search_DC)
        )),
    new GameSearchBaseData("롤",
        new Array(
            new GameSearchSiteBaseData("인벤_오버워치_자유게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4538", Search_Inven)
        ))
)
var GameSearchResultData = function(resultSiteName, gameSearchResultBaseDatas)
{
    this.ResultSiteName = resultSiteName;
    this.GameSearchResultBaseDatas = gameSearchResultBaseDatas;
}
var GameSearchResultBaseData = function(resultStr, resultUrl)
{
    this.ResultStr = resultStr;
    this.ResultUrl = resultUrl;
}

function Search_Inven(loadBody)
{
    var list = [];
    var parsingFunction = function(index, data) {
        if(list.length > SearchResultCount)
            return;

        var postTitle = loadBody(data).find(".sj_ln").text();
        var postHref = loadBody(data).find(".sj_ln").attr("href");
        
        list.push(new GameSearchResultBaseData(postTitle, postHref));
    }

    var postElements = loadBody("table tr .tr");
    postElements.each(parsingFunction);

    return list;
}

function Search_DC(loadBody)
{
    var list = [];
    var table = loadBody(".t_subject");
    var parsingFunction = function(index, data) {
        if(list.length > SearchResultCount)
            return;

        var postTitle = loadBody(data).find("a").text();
        var postHref = loadBody(data).find("a").attr("href");
        
        list.push(new GameSearchResultBaseData(postTitle, postHref));
    }

    var postElements = loadBody("td .t_subject");
    postElements.each(parsingFunction);

    return list;
}


var SearchGameName;
var SearchKeyword;
var SearchResultList = [];
var SearchResultCount = 5;
var SearchGameData;
var GlobalResponse;
function SiteSearchRequest(gameSearchSiteBaseData)
{
    var searchFullurl = gameSearchSiteBaseData.SiteUrl_1 + urlencode(SearchKeyword) + gameSearchSiteBaseData.SiteUrl_2;
    request(searchFullurl, function(error, response, body){
        if(isEmpty(body) == false)
        {
            var loadBody = cheerio.load(body);
            var resultList = gameSearchSiteBaseData.SearchFunc(loadBody);
            SearchResultList.push(new GameSearchResultData(gameSearchSiteBaseData.SiteName, resultList));
            console.log(gameSearchSiteBaseData.SiteName + " 파싱완료!");
        }
        else
            console.log(gameSearchSiteBaseData.SiteName + " 파싱실패!");

        gameSearchSiteBaseData.SetSearchComplete(true);
        CheckSiteSearchComplete();
    })
}

function CheckSiteSearchComplete()
{
    if(SearchGameData.IsGameSearchComplete())
    {
        console.log("완료");
        GlobalResponse.render('main_search_result', {searchResultList:SearchResultList});
    }
}

exports.main_search = function(req,res){

    fs.readFile("public/html/main_search.html",function(error, data){
        res.send(data.toString());
    });
}

exports.main_search_result = function(req,res){

    SearchGameName = "오버워치";
    SearchKeyword = req.body.search;

    SearchResultList = [];
    SearchGameData = null;
    GlobalResponse = res;
    for(var index = 0 ;index < GameSearchBaseDatas.length ; ++index)
    {
        if(SearchGameName === GameSearchBaseDatas[index].GameName)
        {
            SearchGameData = GameSearchBaseDatas[index];
        }
        GameSearchBaseDatas[index].SetGameSearchComplete(false);
    }

    
    for(var index = 0 ; index < SearchGameData.GameSearchSiteBaseDatas.length ; ++index)
    {
        SiteSearchRequest(SearchGameData.GameSearchSiteBaseDatas[index]);
    }
}