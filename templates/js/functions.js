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
      $('#button_create_key').button();
      $('#button_create_key').click(function() {
        $.get('/templates/create_key.html', function(data) {
          $('#dialog-form').remove();
          var message = $('<div id="dialog-form" title="Create Key">'+ data +'</div>');
          $('#content').append(message);
          $("#dialog:ui-dialog").dialog("destroy");
          $("#dialog-form").dialog({
            height: 380,
            modal: true,
            resizable: false,
            width: 360,
            buttons: {
              "Create a Key": function() {
                //var bValid = true;
                if(that.create_key()) {
                  $('#dialog-form input').removeClass("ui-state-error");
                  $(this).dialog("close");
                }
              },
              Cancel: function() {
                $(this).dialog("close");
              }
            },
          });
          $('#create_save').click(function() {
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

        $('#category_'+ cat).button().click(function() {
          that.show_category(index);
        });
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
      entry += '<p><span id="editKey_'+ value.key +'">Edit</span> <span id="deleteKey_'+ value.key +'">Delete</span></p>';
      $('#show_keys').append($('<div>'+ entry +'</div>'));
      $("#editKey_"+ value.key +", #deleteKey_"+ value.key, "#keys").button();
      $('#deleteKey_'+ value.key).click(function() {
        $('#dialog-confirm').remove();
        var message = $('<div id="dialog-confirm" title="Delete this item?"><p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This item will be permanently deleted and cannot be recovered. Are you sure?</p></div>');
        $('#content').append(message);
        $("#dialog-confirm").dialog({
          resizable: false,
          height: 240,
          modal: true,
          width: 400,
          buttons: {
            "Delete": function() {
              $(this).dialog( "close" );
              that.delete_entry(value.key);
            },
            Cancel: function() {
              $(this).dialog( "close" );
            }
          }
        });
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
    $('#dialog-form input').removeClass("ui-state-error");
    $('.missing_field').remove();
    var errorMessage = '<span class="missing_field">!</span>';

    if($('#create_title').val() == '') {
      $('#create_title').addClass("ui-state-error");
      errors = errors + 1;
    }

    if($('#create_username').val() == '') {
      $('#create_username').addClass("ui-state-error");
      errors = errors + 1;
    }

    if($('#create_password').val() == '') {
      $('#create_password').addClass("ui-state-error");
      errors = errors + 1;
    }

    if($('#create_password_repeat').val() == '' || $('#create_password_repeat').val() != $('#create_password').val()) {
      $('#create_password_repeat').addClass("ui-state-error");
      errors = errors + 1;
    }

    if($('#create_url').val() == '') {
      $('#create_url').addClass("ui-state-error");
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
      return true;
    }
    return false;
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
