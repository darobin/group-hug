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
                $el.find("div.meta a").first().attr("href", data.uri);
            }
        );
    }
    
    function renderDomain ($el, href) {
        getJSON(
            href
        ,   function (data) {
                console.log(data);
                $el.find("div.meta a")
                    .last()
                    .attr("href", data._links.homepage.href)
                    .text(data.name + " Domain")
                ;
            }
        );
    }

    function renderPeople ($parent, href, field, name, plural) {
        if (!plural) plural = name;
        getJSON(
            href
        ,   function (data) {
                var list = data._embedded[field];
                name = list.length > 1 ? plural : name;
                console.log(name, data);
                var $card = $("<div></div>").addClass("person-card");
                $("<h3></h3>").text(name).appendTo($card);
                var $ul = $("<ul></ul>").appendTo($card);
                for (var i = 0, n = list.length; i < n; i++) {
                    var item = list[i]
                    ,   fullName = item.name.replace("[tm]", "™")
                    ,   $li = $("<li></li>").text(fullName).appendTo($ul)
                    ;
                    $("<img>")
                        .attr({
                            src:    item._links.photos ?
                                        item._links.photos.filter(function (it) { return it.name === "tiny"; })[0].href :
                                        "img/faceless.svg"
                        ,   alt:    fullName
                        ,   width:  36
                        ,   height: 48
                        })
                        .prependTo($li);
                }
                $card.appendTo($parent);
            }
        );
    }
    
    function renderReports ($ul, href) {
        getJSON(
            href
        ,   function (data) {
                // XXX we need to sort these reports
                $.each(data._embedded.reports, function (_, report) {
                    $("<li><a></a> </li>")
                        .find("a")
                            .attr("href", report.shortlink)
                            .text(report.title)
                        .end()
                        .append($("<span class='status'></span>").text("(" + report._links.latest.title + ")"))
                        .prepend(
                            $("<img width='25' height='25' src='icons/icons/ei-chevron-right.svg' alt=''>")
                        )
                        .appendTo($ul)
                    ;
                });
            }
        );
    }

    var icons = {
        tracker:    "exclamation"
    ,   wiki:       "pencil"
    ,   lists:      "envelope"
    ,   repository: "sc-github"
    ,   unknown:    "question"
    };
    function renderServices ($ul, href) {
        getJSON(
            href
        ,   function (data) {
                $.each(data._embedded.services, function (_, service) {
                    $("<li><a></a></li>")
                        .find("a")
                            .attr("href", service.link)
                            .text(service.longdesc || service.shortdesc || service.type)
                        .end()
                        .prepend(
                            $("<img width='25' height='25'>")
                                .attr({
                                    alt:    service.type
                                ,   src:    "icons/icons/ei-" + (icons[service.type] || icons.unknown) + ".svg"
                                })
                        )
                        .appendTo($ul)
                    ;
                });
            }
        );
    }
    
    function renderFullGroup ($el, gid) {
        // fetch the data for that group
        getJSON(
            "groups/" + gid
        ,   function (data) {
                console.log(data);
                
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
                $("<div class='meta'><a>Chartered</a> <time></time> → <time></time> in the <a>…</a>.</div>")
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
                    $el
                ,   data._links.active_charter.href
                );
                // domain (get data from _links.domain.href, grab =name and =_links.homepage.href)
                renderDomain(
                    $el
                ,   data._links.domain.href
                );

                // Publications (list from _links.reports.href)
                renderReports(
                    $("<div class='reports-card'><h3>Documents</h3><ul></ul></div>").appendTo($el).find("ul")
                ,   data._links.reports.href + "?embed=true"
                );
                
                // Services (list from _links.services.href)
                renderServices(
                    $("<div class='services-card'><h3>Resources</h3><ul></ul></div>").appendTo($el).find("ul")
                ,   data._links.services.href + "?embed=true"
                );

                // get the people with embed=true so as to get the pictures
                renderPeople(
                    $el
                ,   data._links.chairs.href + "?embed=true"
                ,   "chairs"
                ,   "Chair"
                ,   "Chairs"
                );
                renderPeople(
                    $el
                ,   data._links.team_contacts.href + "?embed=true"
                ,   "teamcontacts"
                ,   "Staff"
                );

            }
        );
    }
    
    // data-hug-group is to describe a group
    // we are likely to have others or more granular uses
    // $("*[data-hug-group]").each(function () {
    //     var $el = $(this)
    //     ,   gid = $el.attr("data-hug-group")
    //     ;
    //     renderFullGroup($el, gid);
    // });

    var $hug = $("#hug");
    $("#pick")
        .change(function (ev) {
            $hug.empty();
            renderFullGroup($hug, $(ev.target).val());
        })
        .change()
    ;

}(jQuery));
