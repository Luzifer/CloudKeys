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

function sortCategory(a, b) {
  if(a.title == b.title) {
    return 0;
  } else if(a.title < b.title) {
    return -1;
  }
  return 1;
}

function CloudKeys() {
  this.password = '';
  this.data = {};
  this.data_keys = [];

  this.get_copy_code = function(value) {
    var code = '<span class="copy_to_clipboard"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="110" height="14" id="clippy">';
    code += '<param name="movie" value="/js/clippy.swf"/><param name="allowScriptAccess" value="always" /><param name="quality" value="high" />';
    code += '<param name="scale" value="noscale" /><param NAME="FlashVars" value="text='+ value +'"><param name="bgcolor" value="#ffffff">';
    code += '<embed src="/js/clippy.swf" width="110" height="14" name="clippy" quality="high" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" FlashVars="text='+ value +'" bgcolor="#ffffff" /></object></span>';
    return code;
  }

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
            height: 450,
            modal: true,
            resizable: false,
            width: 350,
            open: function(event, ui) {
              $('#show_keys span.copy_to_clipboard').hide();
            },
            close: function(event, ui) {
              $('span.copy_to_clipboard').show();
            },
            buttons: {
              "Create a Key": function() {
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

      $.each(that.data_keys.sort(), function(id, index) {
        var value = that.data[index];
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
    $.each(this.data[index].sort(sortCategory), function(index, value) {
      $('#show_keys').append($('<h3>'+ value.title +'</h3>'));
      var entry = '<p id="username_'+ value.key +'">Username: '+ value.username +'</p>';
      entry += '<p id="password_'+ value.key +'">Password: <i>hidden</i></p>';
      entry += '<p>Category: '+ value.category +'</p>';
      entry += '<p id="url_'+ value.key +'">Url: <a href="'+ value.url +'" target="_blank">'+ value.url +'</a></p>';
      entry += '<p id="note_'+ value.key +'">Note: '+ value.note.replace(/\n/g,'<br />') +'</p>';
      entry += '<p><span id="editKey_'+ value.key +'">Edit</span> <span id="deleteKey_'+ value.key +'">Delete</span></p>';

      $('#show_keys').append($('<div>'+ entry +'</div>'));
      $('#password_'+ value.key).append($(that.get_copy_code(value.password)));
      $('#username_'+ value.key).append($(that.get_copy_code(value.username)));
      $('#url_'+ value.key).append($(that.get_copy_code(value.url)));
      $('#note_'+ value.key).append($(that.get_copy_code(value.note)));

      $("#editKey_"+ value.key +", #deleteKey_"+ value.key, "#keys").button();
      $('#editKey_'+ value.key).click(function() {
        $.get('/templates/create_key.html', function(data) {
          $('#dialog-form').remove();
          var message = $('<div id="dialog-form" title="Edit Key">'+ data +'</div>');
          $('#content').append(message);

          $('#create_category').val(value.category);
          $('#create_title').val(value.title);
          $('#create_username').val(value.username);
          $('#create_password').val(value.password);
          $('#create_password_repeat').val(value.password);
          $('#create_url').val(value.url);
          $('#create_note').val(value.note);

          $(that.get_copy_code(value.password)).insertAfter($('#create_password'));
          $(that.get_copy_code(value.username)).insertAfter($('#create_username'));
          $(that.get_copy_code(value.url)).insertAfter($('#create_url'));
          $(that.get_copy_code(value.note)).insertAfter($('#create_note'));

          $('<input type="hidden" id="edit_key" value="'+ value.key +'" />').insertAfter($('#create_url'));

          $("#dialog:ui-dialog").dialog("destroy");
          $("#dialog-form").dialog({
            height: 450,
            modal: true,
            resizable: false,
            width: 470,
            open: function(event, ui) {
              $('#show_keys span.copy_to_clipboard').hide();
            },
            close: function(event, ui) {
              $('span.copy_to_clipboard').show();
            },
            buttons: {
              "Save": function() {
                if(that.save_key()) {
                  $('#dialog-form input').removeClass("ui-state-error");
                  $(this).dialog("close");
                  $('span.copy_to_clipboard').show();
                }
              },
              Cancel: function() {
                $(this).dialog("close");
              }
            },
          });
          $('#edit_save').click(function() {
          });
        });
      });
      $('#deleteKey_'+ value.key).click(function() {
        $('#dialog-confirm').remove();
        var message = $('<div id="dialog-confirm" title="Delete this item?"><p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This item will be permanently deleted and cannot be recovered. Are you sure?</p></div>');
        $('#content').append(message);
        $("#dialog-confirm").dialog({
          resizable: false,
          height: 240,
          modal: true,
          width: 400,
          open: function(event, ui) {
            $('#show_keys span.copy_to_clipboard').hide();
          },
          close: function(event, ui) {
            $('span.copy_to_clipboard').show();
          },
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

  this.check_fields = function() {
    var errors = 0;
    $('#dialog-form input').removeClass("ui-state-error");
    $('.missing_field').remove();

    if($('#create_title').val() == '') {
      $('#create_title').addClass("ui-state-error");
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

    return errors;
  }

  this.encrypt_data = function() {
    var data = {};
    var cat = '';
    if($('#create_category').val() != '') {
      cat = Crypto.AES.encrypt($('#create_category').val(), this.password);
    }
    data.category = cat;
    data.title = Crypto.AES.encrypt($('#create_title').val(), this.password);
    data.username = Crypto.AES.encrypt($('#create_username').val(), this.password);
    data.password = Crypto.AES.encrypt($('#create_password').val(), this.password);
    data.url = Crypto.AES.encrypt($('#create_url').val(), this.password);
    data.note = Crypto.AES.encrypt($('#create_note').val(), this.password);

    return data;
  }

  this.save_key = function() {
    var that = this;
    if(this.check_fields() == 0) {
      data = that.encrypt_data();
      data.key = $('#edit_key').val();

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

  this.create_key = function() {
    var that = this;

    if(this.check_fields() == 0) {
      $.post('/api/saveKey', that.encrypt_data(), function(data) {
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
          that.data_keys = [];
          $.each(data.passwords, function(index, value) {
            var category = '__empty__';
            if(value.category != '') {
              category = Crypto.AES.decrypt(value.category, that.password);
            }

            if(typeof(that.data[category]) == 'undefined') {
              that.data[category] = [];
              that.data_keys.push(category);
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
              , note: Crypto.AES.decrypt(value.note, that.password)
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
      $('#input_password').focus();
      $('#input_password').bind('keypress', function(e){
        if(e.which == 13){
          $('#password_submit').click();
        }
      });
    });
  }
}
