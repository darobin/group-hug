/* globals jQuery */

(function ($) {
    // XXX this is the test server
    var base = "https://api-test.w3.org/";
    
    // gets JSON in a way that works
    function getJSON (path, success, error) {
        console.log("accessing", base + path);
        // XXX this doesn't work because Varnish seems to drop the CORS headers
        $.ajax(base + path, {
            username:   "rberjon"
        ,   password:   "XXX"
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
                console.log("got some response");
                console.log(data);
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
