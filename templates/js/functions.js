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
  this.data = {};

  this.show_list = function() {
    var that = this;
    $.get('/templates/list_keys.html', function(data) {
      $('#content').html(data);
      $('#button_create_key').click(function() {
        $.get('/templates/create_key.html', function(data) {
          $('#dialog-modal').remove();
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

      $.each(that.data, function(index, value) {
        var label = index;
        if(index == '__empty__') {
          label = 'Empty Category';
        }
        cat = index.replace(' ', '_');
        $('#categories').append($('<div id="category_'+ cat +'">'+ label +'</div>'));
        $('#category_'+ cat).click(function() {
          that.show_category(index);
        });
        console.log(index, value);
      });
    });
  }

  this.show_category = function(index) {
    var that = this;
    $('#keys').html('<div id="show_keys"></div>');
    $.each(this.data[index], function(index, value) {
      $('#show_keys').append($('<h3>'+ value.title +'</h3>'));
      var entry = '<p>Username: '+ value.username +'</p>';
      entry += '<p>Password: '+ value.password +'</p>';
      entry += '<p>Category: '+ value.category +'</p>';
      entry += '<p>Url: '+ value.url +'</p>';
      entry += '<p><span id="deleteKey_'+ value.key +'">Delete</span></p>';
      $('#show_keys').append($('<div>'+ entry +'</div>'));
      $('#deleteKey_'+ value.key).click(function() {
        that.delete_entry(value.key);
      });
    });
    $("#show_keys").accordion({
      collapsible: true, active: false
    });
    $('#show_keys .head').click(function() {
      $(this).next().toggle('slow');
      return false;
    }).next().hide();
  }

  this.delete_entry = function(key) {
    var that = this;
    $.getJSON('/api/deleteKey?key='+ key, function(data) {
      if(data.status == true) {
        that.decrypt_data();
      }
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
      var cat = '';
      if($('#create_category').val() != '') {
        cat = Crypto.AES.encrypt($('#create_category').val(), this.password);
      }
      data.category = cat;
      data.title = Crypto.AES.encrypt($('#create_title').val(), this.password);
      data.username = Crypto.AES.encrypt($('#create_username').val(), this.password);
      data.password = Crypto.AES.encrypt($('#create_password').val(), this.password);
      data.url = Crypto.AES.encrypt($('#create_url').val(), this.password);
      $.post('/api/saveKey', data, function(data) {
        if(data.status == true) {
          that.decrypt_data();
          $("#dialog-modal").dialog('close');
          window.setTimeout(function() { that.show_category($('#create_category').val()); }, 1000);
        }
      }, 'json');
    }
  }

  this.decrypt_data = function() {
    var that = this;
    $.getJSON('/api/getKeys', function(data) {
      if(data.status == true) {
        try {
          that.data = {};
          $.each(data.passwords, function(index, value) {
            var category = '__empty__';
            if(value.category != '') {
              category = Crypto.AES.decrypt(value.category, that.password);
            }

            if(typeof(that.data[category]) == 'undefined') {
              that.data[category] = [];
            }

            var enccat = '';
            if(value.category != '') {
              enccat = Crypto.AES.decrypt(value.category, that.password);
            }

            that.data[category].push({
                key: value.key
              , category: enccat
              , title: Crypto.AES.decrypt(value.title, that.password)
              , username: Crypto.AES.decrypt(value.username, that.password)
              , password: Crypto.AES.decrypt(value.password, that.password)
              , url: Crypto.AES.decrypt(value.url, that.password)
            });
          });
          console.log(that.data);
          that.show_list();
        } catch(ex) {
          that.show_password_field();
          $('#dialog-modal').remove();
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
