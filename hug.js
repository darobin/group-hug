/* globals jQuery */

(function ($) {
    // XXX this is the test server
    var base = "https://api-test.w3.org/";
    
    function defaultErrorHandler (xhr) {
        console.error("ERROR:", xhr.statusText);
    }
    
    // gets JSON in a way that works
    function getJSON (path, success, error) {
        path = path.indexOf("http") === 0 ? path : base + path;
        $.ajax(path, {
            type: "GET"
        ,   xhrFields: {
                withCredentials:    true
            }
        ,   success:    success
        ,   error:      error || defaultErrorHandler
        });
    }
    
    function renderCharter ($el, href) {
        getJSON(
            href
        ,   function (data) {
                console.log(data);
                $("<a>charter</a>").attr("href", data.uri).appendTo($el);
            }
        );
    }
    
    function renderDomain ($el, href) {
        getJSON(
            href
        ,   function (data) {
                console.log(data);
                $("<a></a>").attr("href", data._links.homepage.href).text(data.name).appendTo($el);
            }
        );
    }
    
    function renderFullGroup ($el, gid) {
        // fetch the data for that group
        getJSON(
            "groups/" + gid
        ,   function (data) {
                console.log(data);
                $("#dump").text(JSON.stringify(data, null, 4));
                
                // title =name (link =_links.homepage.href)
                var $title = $("<h2><a></a></h2>")
                                .find("a")
                                    .text(data.name)
                                    .attr("href", data._links.homepage.href)
                                .end()
                                .appendTo($el)
                ;
                
                // little group type icon =type
                var type = data.type.replace(/\b(\w).*?\b\s*/g, "$1");
                $("<span></span>")
                    .addClass("group-type")
                    .addClass(type)
                    .text(type.toUpperCase())
                    .prependTo($title)
                ;
                
                // time span =start_date-=end_date (in red if expired)
                var d = new Date()
                ,   fmt = function (str) {
                        str = "" + str;
                        return str.length < 2 ? "0" + str : str;
                    }
                ,   date = d.getFullYear() + "-" + fmt(d.getMonth() + 1) + "-" + fmt(d.getDate());
                $("<div><time></time> → <time></time></div>")
                    .addClass("lifetime")
                    .find("time").first().text(data.start_date).end().end()
                    .find("time")
                        .last()
                        .text(data.end_date)
                        .css("color", data.end_date < date ? "#f00" : "inherit")
                    .end().end()
                    .appendTo($el)
                ;
                
                // charter (get data from _links.active_charter.href, grab =uri)
                renderCharter(
                    $("<div></div>").addClass("charter").appendTo($el)
                ,   data._links.active_charter.href
                );
                // domain (get data from _links.domain.href, grab =name and =_links.homepage.href)
                renderDomain(
                    $("<div></div>").addClass("domain").appendTo($el)
                ,   data._links.domain.href
                );

                // XXX
                // get the people with embed=true so as to get the pictures
                // Chairs (list from _links.chairs.href)
                // Team Contacts (list from _links.team_contacts.href)

                // Publications (list from _links.reports.href)
                // Services (list from _links.services.href)
            }
        );
    }
    
    // data-hug-group is to describe a group
    // we are likely to have others or more granular uses
    $("*[data-hug-group]").each(function () {
        var $el = $(this)
        ,   gid = $el.attr("data-hug-group")
        ;
        renderFullGroup($el, gid);
    });
}(jQuery));
