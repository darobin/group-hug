/* globals jQuery */

(function ($) {
    // XXX this is the test server
    var base = "https://api-test.w3.org/";
    
    // gets JSON in a way that works
    function getJSON (path, success, error) {
        $.ajax(base + path, {
            type: "GET"
        ,   xhrFields: {
                withCredentials:    true
            }
        ,   success:    success
        ,   error:      error
        });
    }
    
    // render a group
    function renderFullGroup ($el, gid) {
        // fetch the data for that group
        getJSON(
            "groups/" + gid
        ,   function (data) {
                console.log(data);
                $("#dump").text(JSON.stringify(data, null, 4));
                
                // title =name (link =_links.homepage.href)
                // little group type icon =type
                // time span =start_date-=end_date (in red if expired)
                // charter (data from _links.active_charter.href)
                // domain (data from _links.domain.href)
                // Chairs (list from _links.chairs.href)
                // Team Contacts (list from _links.team_contacts.href)
                // Publications (list from _links.reports.href)
                // Services (list from _links.services.href)
            }
        ,   function (xhr) {
                console.error("ERROR:", xhr.statusText);
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
