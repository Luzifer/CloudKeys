$(document).ready(function() {
  $.getJSON('/api/isLoggedIn', function(data) {
    if(data.isLoggedIn == false) {
      if(typeof(data.loginURL) != 'undefined' && data.loginURL != '') {
        window.location.href = data.loginURL;
        return;
      }
    } else {
      var cc = new CloudKeys();
      cc.show_password_field();
    }
  });
});

function CloudKeys() {
  this.password = '';
  this.data = { };

  this.show_list = function() {
    var that = this;
    $.get('/templates/list_keys.html', function(data) {
      $('#content').html(data);
    });
  }

  this.decrypt_data = function() {
    var that = this;
    $.get('/api/getKeys', function(data) {
      /*
      try {
        var plain = Crypto.AES.decrypt(crypted, that.password);
      } catch(ex) {
        var message = $('<div id="dialog-modal" title="Error"><p>Failed to decrypt your keys. Please check your password!</p></div>');
        $('#content').append(message);
        $("#dialog:ui-dialog").dialog("destroy");
        $("#dialog-modal").dialog({
          height: 140,
          modal: true
        });
        that.show_password_field();
      } */
      that.show_list();
    });
  }

  this.show_password_field = function() {
    var that = this;
    $.get('/templates/password_field.html', function(data) {
      $('#content').html(data);
      $('#password_submit').click(function() {
        that.password = $('#input_password').val();
        that.decrypt_data();
      });
    });
  }
}
