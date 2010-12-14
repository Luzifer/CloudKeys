$(document).ready(function() {
  $.getJSON('/api/isLoggedIn', function(data) {
    if(data.status == true) {
    } else {
      window.location.href = data.loginurl;
    }
  });
});
