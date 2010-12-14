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
  this.data = [];

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
            resizable: false,
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
    var data = {};
    var errors = 0;
    $('.missing_field').remove();
    var errorMessage = '<span class="missing_field">!</span>';

    if($('#create_title').val() == '') {
      $(errorMessage).insertAfter($('#create_title'));
      errors = errors + 1;
    }

    if($('#create_username').val() == '') {
      $(errorMessage).insertAfter($('#create_username'));
      errors = errors + 1;
    }

    if($('#create_password').val() == '') {
      $(errorMessage).insertAfter($('#create_password'));
      errors = errors + 1;
    }

    if($('#create_password_repeat').val() == '' || $('#create_password_repeat').val() != $('#create_password').val()) {
      $(errorMessage).insertAfter($('#create_password_repeat'));
      errors = errors + 1;
    }

    if($('#create_url').val() == '') {
      $(errorMessage).insertAfter($('#create_url'));
      errors = errors + 1;
    }

    if(errors == 0) {
      data.title = Crypto.AES.encrypt($('#create_title').val(), this.password);
      data.username = Crypto.AES.encrypt($('#create_username').val(), this.password);
      data.password = Crypto.AES.encrypt($('#create_password').val(), this.password);
      data.url = Crypto.AES.encrypt($('#create_url').val(), this.password);
      $.post('/api/saveKey', data, function(data) {
        alert(data);
      }, 'json');
    }
  }

  this.decrypt_data = function() {
    var that = this;
    $.getJSON('/api/getKeys', function(data) {
      if(data.status == true) {
        try {
          $.each(data.passwords, function(index, value) {
            console.log(index);
            console.log(value);
            that.data.push({
                key: value.key
              , title: Crypto.AES.decrypt(value.title, that.password)
              , username: Crypto.AES.decrypt(value.username, that.password)
              , password: Crypto.AES.decrypt(value.password, that.password)
              , url: Crypto.AES.decrypt(value.url, that.password)
            });
          });
          that.show_list();
        } catch(ex) {
          that.show_password_field();
          var message = $('<div id="dialog-modal" title="Error"><p>Failed to decrypt your keys. Please check your password!</p></div>');
          $('#content').append(message);
          $("#dialog:ui-dialog").dialog("destroy");
          $("#dialog-modal").dialog({
            height: 140,
            modal: true
          });
        }
      }
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
