
var urlencode = require('urlencode');
var module = module.exports;

module.GameSearchBaseData = function(gameName)
{
    this.GameName = gameName;
    this.SearchComplete = false;
}
module.GameSearchBaseData.prototype.SetSearchComplete = function(complete)
{
    this.SearchComplete = complete;
}


module.GameSearchData = function(siteName, siteUrl_1, siteUrl_2, serchFunc, gameName) 
{
    this.base = module.GameSearchBaseData;
    module.GameSearchBaseData(gameName);
    this.SiteName = siteName;
    this.SiteUrl_1 = siteUrl_1;
    this.SiteUrl_2 = siteUrl_2;
    this.SearchFunc = serchFunc;

    this.SearchResultList = new Array();
    this.ParsingPage = 0;
}

module.GameSearchData.prototype = module.GameSearchBaseData.prototype;
module.GameSearchData.prototype.ResetData = function()
{
    this.SearchComplete = false;
    this.SearchResultList = new Array();
    this.ParsingPage = 0;
}
module.GameSearchData.prototype.PushGameSearchResultList = function(searchResultList)
{
    if(searchResultList.length <= 0)
        return true;

    for(var index in searchResultList)
    {
        if(this.SearchResultList.length >= 100)
            return true;
        
        this.SearchResultList.push(searchResultList[index]);
    }

    return false;
}

module.GameSearchResultData = function(resultStr, resultUrl)
{
    this.ResultStr = resultStr;
    this.ResultUrl = resultUrl;
}

module.GameSearchDataList = new Array();

module.GameSearchDataList[0] = new Array(
        new module.GameSearchData("인벤_오버워치_자유게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4538", Search_Inven),
        new module.GameSearchData("인벤_오버워치_토론", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4796", Search_Inven),
        new module.GameSearchData("인벤_오버워치_최신유저정보", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4677", Search_Inven),
        new module.GameSearchData("인벤_오버워치_팁과 노하우", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4680", Search_Inven),
        new module.GameSearchData("인벤_오버워치_대회/e스포츠 게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4786", Search_Inven),
        new module.GameSearchData("인벤_오버워치_질문과 답변", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4676", Search_Inven),
        new module.GameSearchData("인벤_오버워치_사건/사고 게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=4751", Search_Inven)
    );

module.GameSearchDataList[1] = new Array(
        new module.GameSearchData("인벤_롤_챔피언 공략 게시판", "http://lol.inven.co.kr/dataninfo/champion/manualTool.php?filter=subject&mode=search&searchname=", "&view=", Search_Inven_Champion),
        new module.GameSearchData("인벤_롤_이슈/토론 게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=2999", Search_Inven),
        new module.GameSearchData("인벤_롤_사건/사고 게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=2771", Search_Inven),
        new module.GameSearchData("인벤_롤_유저팁 게시판", "http://www.inven.co.kr/board/powerbbs.php?name=subject&keyword=", "&come_idx=2766", Search_Inven)
    );


module.ParsingFullUrlNextPage = function(gameSearchSiteData, keyword){
    // 인벤말고 다른 사이트 추가되면 수정하자
    gameSearchSiteData.ParsingPage++;
    return gameSearchSiteData.SiteUrl_1 + urlencode(keyword) + gameSearchSiteData.SiteUrl_2 + "&p=" + urlencode(gameSearchSiteData.ParsingPage) ;
}


// 검색전용 함수
function Search_Inven(loadBody, gameSearchSiteData)
{
    var list = [];
    var parsingFunction = function(index, data) {
        var postTitle = loadBody(data).find(".sj_ln").text();
        var postHref = loadBody(data).find(".sj_ln").attr("href");
        
        list.push(new module.GameSearchResultData(postTitle, postHref));
    }

    var postElements = loadBody("table tr .tr");
    postElements.each(parsingFunction);

    return gameSearchSiteData.PushGameSearchResultList(list);
}
function Search_Inven_Champion(loadBody, gameSearchSiteData)
{
    var list = [];
    var parsingFunction = function(index, data) {
        var postTitle = loadBody(data).find(".list").text();
        var postHref = loadBody(data).find(".list").attr("href");
        
        list.push(new module.GameSearchResultData(postTitle, "http://lol.inven.co.kr/dataninfo/champion/" + postHref));
    }

    var postElements = loadBody("table tr");
    postElements.each(parsingFunction);

    return gameSearchSiteData.PushGameSearchResultList(list);
}

function Search_DC(loadBody, gameSearchSiteData)
{
    var list = [];
    var table = loadBody(".t_subject");
    var parsingFunction = function(index, data) {
        var postTitle = loadBody(data).find("a").text();
        var postHref = loadBody(data).find("a").attr("href");
        
        list.push(new module.GameSearchResultData(postTitle, postHref));
    }

    var postElements = loadBody("td .t_subject");
    postElements.each(parsingFunction);

    return gameSearchSiteData.PushGameSearchResultList(list);
}