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
      $('#button_create_key').click(function() {
        $.get('/templates/create_key.html', function(data) {
          var message = $('<div id="dialog-modal" title="Create Key">'+ data +'</div>');
          $('#content').append(message);
          $("#dialog:ui-dialog").dialog("destroy");
          $("#dialog-modal").dialog({
            height: 260,
            modal: true,
            width: 360
          });
          $('#create_save').click(function() {
            that.create_key();
          });
        });
      });
    });
  }

  this.create_key = function() {
    var that = this;
    var data = { };
    var errors = 0;
    $('.missing_field').remove();

    if($('#create_title').val() == '') {
      $('<span class="missing_field">!</span>').insertAfter($('#create_title'));
      errors = errors + 1;
    }

    if($('#create_username').val() == '') {
      $('<span class="missing_field">!</span>').insertAfter($('#create_username'));
      errors = errors + 1;
    }

    if($('#create_password').val() == '') {
      $('<span class="missing_field">!</span>').insertAfter($('#create_password'));
      errors = errors + 1;
    }

    if($('#create_password_repeat').val() == '' || $('#create_password_repeat').val() != $('#create_password').val()) {
      $('<span class="missing_field">!</span>').insertAfter($('#create_password_repeat'));
      errors = errors + 1;
    }

    if($('#create_url').val() == '') {
      $('<span class="missing_field">!</span>').insertAfter($('#create_url'));
      errors = errors + 1;
    }

    if(errors == 0) {
      data.title = $('#create_title').val();
      data.username = $('#create_username').val();
      data.password = $('#create_password').val();
      data.url = $('#create_url').val();
      console.log(data);
    }
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
