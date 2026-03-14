// Adsterra "normal" banner creative — a legitimate 728x90 image banner
// This is what you EXPECT when you buy a banner placement.
// Served from the same placement as the redirect creative above.
// Personal identifiers redacted.

(function() {
  var template = "\
    frame_width=728;frame_height=90; \n\
<a id='atLink-[REDACTED_KEY]' href='https://advertiser-landing-page.example.com' target='_blank'>\n\
    <img border='0' alt='' src='https://cdn.storageimagedisplay.com/cti/[REDACTED]/banner-image.jpg' width='728' height='90'>\n\
</a>\n\
<script type='text/javascript'>\n\
    (function() {\n\
        var bn;\n\
        if (bn = document.getElementById('atLink-[REDACTED_KEY]')) {\n\
            var callback = function() {\n\
                (new Image()).src = 'https://skinnycrawlinglax.com/clk.gif?landing_id=[REDACTED]&placement_id=[REDACTED]&sid=[REDACTED_SESSION]';\n\
            };\n\
            if (bn.addEventListener)\n\
                bn.addEventListener('click', callback, false);\n\
        }\n\
    })();\n\
</script>\n\
<script>\n\
    var impressionSession = '[REDACTED_SESSION_TOKEN]';\n\
    var adsHost = 'skinnycrawlinglax.com';\n\
    new Image().src = 'https://' + adsHost + '/impr.gif?sid=' + impressionSession;\n\
</script>\
\
  ";

  // Same template injection pattern
  if (typeof atAsyncContainers === 'object' && atAsyncContainers['[REDACTED_KEY]']) {
    var container, scripts;
    if (container = document.getElementById(atAsyncContainers['[REDACTED_KEY]'])) {
      container.innerHTML = template;
      scripts = container.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        if (!!scripts[i].src) {
          (function(raw) {
            var script = document.createElement('script');
            for (var j = 0, length = raw.attributes.length; j < length; j++) {
              script[raw.attributes[j]['name']] = raw.attributes[j]['value'];
            }
            raw.parentNode.replaceChild(script, raw);
          })(scripts[i]);
        } else {
          eval(scripts[i].innerHTML);
        }
      }
    }
  }
})();

// SUMMARY:
// - This is a LEGITIMATE banner ad
// - Has visible HTML: <a><img></a> — an actual banner image the user can see
// - Fires impr.gif on load (impression tracking — normal)
// - Fires clk.gif on click (click tracking — normal)
// - NO window.top.location — no page hijack
// - User sees a banner, can click it if interested, page stays intact
//
// Both this and the redirect creative are served from the SAME placement.
// Adsterra decides which one to send. The publisher has no control.
