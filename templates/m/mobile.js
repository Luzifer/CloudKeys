var pass = undefined;
var pwddata = undefined;
var pwddata_keys = undefined;

$(document).bind("mobileinit", function(){
  
  $.mobile.nonHistorySelectors = "secret";
});

$(function(){
  $.getJSON('/api/isLoggedIn', function(data) {
    if(data.isLoggedIn == false) {
      if(typeof(data.loginURL) != 'undefined' && data.loginURL != '') {
        window.location.href = data.loginURLGoogle;
      }
    }
  });
  
  $('#loginbtn').bind('tap', function() {
    pass = $('#password').val();
    loadentries();
  });
  
  $('[data-role="page"]:not(#login)').bind('pageshow', function(event, ui){
    if(pass == undefined) {
      window.location.href="/m/";
      return false;
    }
  });
  
  $('#lock').bind('tap', function(){
    pass = undefined;
  })
});

function loadentries() {
  $.getJSON('/api/getKeys', function(data) {
    if(data.status == true) {
      try {
        pwddata = {};
        pwddata_keys = [];
        $.each(data.passwords, function(index, value) {
          var category = '__empty__';
          if(value.category != '') {
            category = Crypto.AES.decrypt(value.category, pass);
          }

          if(typeof(pwddata[category]) == 'undefined') {
            pwddata[category] = [];
            pwddata_keys.push(category);
          }

          var enccat = '';
          if(value.category != '') {
            enccat = Crypto.AES.decrypt(value.category, pass);
          }

          pwddata[category].push({
              key: value.key
            , category: enccat.replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , title: Crypto.AES.decrypt(value.title, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , username: Crypto.AES.decrypt(value.username, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , password: Crypto.AES.decrypt(value.password, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , url: Crypto.AES.decrypt(value.url, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , note: Crypto.AES.decrypt(value.note, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
          });
        });
        
        $('#catslist').empty();
        for(var i = 0; i < pwddata_keys.length; i++) {
          var cat = $('<li></li>');
          var link = $('<a href="javascript:void(0);"></a>');
          link.attr('cat', pwddata_keys[i]);
          link.append(pwddata_keys[i]);
          cat.append(link);
          link.bind('tap', loadkeys);
          $('#catslist').append(cat);
        }
        $('#catslist').listview('refresh');
        
      } catch(ex) {
        $.mobile.changePage($('#wrongpwd'), {
          'role' : 'dialog',
          'changeHash' : false
        });
        $('#password').val('');
        //window.location.href="/m/";
      }
    }
  });
}

function loadkeys() {
  var cat = $(this).attr('cat');
  $('#keyslist').empty();
  for(var i = 0; i < pwddata[cat].length; i++) {
    var val = pwddata[cat][i];
    var entry = $('<li></li>');
    var link = $('<a href="javascript:void(0);"></a>');
    link.attr('cat', cat);
    link.attr('key', val.key);
    link.append(val.title);
    entry.append(link);
    link.bind('tap', loaddetails);
    $('#keyslist').append(entry);
  }
  $.mobile.changePage($('#keyindex'));
  $('#keyslist').listview('refresh');
}

function loaddetails() {
  var cat = $(this).attr('cat');
  var key = $(this).attr('key');
  for(var i = 0; i < pwddata[cat].length; i++) {
    var val = pwddata[cat][i];
    if(val.key != key) { continue; }
    
    $('.data_user').text(val.username);
    $('.data_pass').text(val.password);
    $('.data_url').text(val.url);
    $('.data_note').text(val.note);
    $('.data_title').text(val.title);
    $.mobile.changePage($('#passwordview'));
    break;
  }
}