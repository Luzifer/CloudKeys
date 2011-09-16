var isMobile = false;
$(document).ready(function() {
  if(jQuery.browser.mobile) {
    isMobile = true;
    window.location.href="/m/";
  }
//  isMobile = true;

  if(isMobile) {
    $('head').append($('<link rel="stylesheet" type="text/css" href="/css/mobile.css" media="screen" />'));
  } else {
    $('head').append($('<link rel="stylesheet" type="text/css" href="/css/styles.css" media="screen" />'));
    $('head').append($('<script type="text/javascript" src="/js/jquery.xmldom-1.0.min.js"></script>'));
    $('head').append($('<link type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/smoothness/jquery-ui.css" rel="stylesheet" />'));
    $('head').append($('<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js" type="text/javascript"></script>'));
  }
  $.getJSON('/api/isLoggedIn', function(data) {
    if(data.isLoggedIn == false) {
      if(typeof(data.loginURL) != 'undefined' && data.loginURL != '') {
        window.location.href = data.loginURL;
      }
    } else {
      $('<div id="header_links"><div id="logout">&nbsp;Logout</div><div id="importer">&nbsp;Import |</div><div id="searcher">&nbsp;Search |</div></div>').insertBefore($('h1'));
      $('#logout').click(function() {
        window.location.href = data.logoutURL;
      });
      var cc = new CloudKeys();
      cc.show_password_field();

      $('#searcher').click(function() {
        cc.show_search();
      });
      
      setTimeout('is_still_loggedin()', 60000);
    }
  });
  if(!isMobile) {
    $(window).resize(function() {
      set_content_sizes();
    });
  }
});


function set_content_sizes() {
  $('#content').height(
    $(window).height() - ($('body').height() - $('#content').height()) - 5
  );
  var width_content =$('#content').width();
  var height_content = Math.floor($(window).height() - $('h1').outerHeight(true)) - 5;
  var width_categories = $('#categories').width();
  $('#categories').height(height_content).width(width_categories - 1);
  var height_keys = Math.floor(height_content / 100 * 60);
  $('#keys').height(height_keys - 6).width(width_content - width_categories);
  $('#entry').height(height_content - height_keys).width(width_content - width_categories);
}

function sortCategoryList(a, b) {
  if(a == 'Search Results') return -1;
  if(b == 'Search Results') return -1;
  if(a == b) {
    return 0;
  } else if(a < b) {
    return -1;
  }
  return 1;
}

function sortCategory(a, b) {
  if(a.title == b.title) {
    return 0;
  } else if(a.title < b.title) {
    return -1;
  }
  return 1;
}

function is_still_loggedin() {
  $.getJSON('/api/isLoggedIn', function(data) {
    if(data.isLoggedIn == false) {
      // If the user was logged out through cookie timeout or similar
      // new key creation will fail so send him back to login form before
      // he tries to create a new key.
      $('#dialog-confirm').remove();
      var message = $('<div id="dialog-confirm" title="You have been logged out!"><p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>Your session expired and you will have to login again.</p></div>');
      $('#content').append(message);
      $("#dialog-confirm").dialog({
        resizable: false,
        height: 240,
        modal: true,
        width: 400,
        open: function(event, ui) {
          $('span.copy_to_clipboard').hide();
        },
        close: function(event, ui) {
          window.location.reload();
        },
        buttons: {
          "OK": function() {
            $(this).dialog( "close" );
          }
        }
      });
    } else {
      setTimeout('is_still_loggedin()', 60000);
    }
  });
}

function CloudKeys() {
  this.password = '';
  this.data = {};
  this.data_keys = [];

  this.get_copy_code = function(value) {
    var code = '<span class="copy_to_clipboard"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="110" height="14" id="clippy">';
    code += '<param name="movie" value="/js/clippy.swf"/><param name="allowScriptAccess" value="always" /><param name="quality" value="high" />';
    code += '<param name="scale" value="noscale" /><param NAME="FlashVars" value="text='+ encodeURIComponent(value) +'"><param name="bgcolor" value="#ffffff">';
    code += '<embed src="/js/clippy.swf" width="110" height="14" name="clippy" quality="high" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" FlashVars="text='+ encodeURIComponent(value) +'" bgcolor="#ffffff" /></object></span>';
    return code;
  }

  this.show_search = function() {
    var that = this;
    var search_term = prompt("What are you looking for?", "");
    if(search_term != '') {
      search_term = new RegExp(search_term, 'i');
      search_category = 'Search Results';
      if(typeof(that.data[search_category]) != 'undefined') {
        delete that.data[search_category];
        $.each(that.data_keys, function(index, value) {
          if(value == search_category) {
            that.data_keys.splice(index, 1);
          }
        });
      }
  
      $.each(that.data, function(key, value) {
        $.each(value, function(idx, val) {
          if(val.title.search(search_term) >= 0 || val.username.search(search_term) >= 0 || val.note.search(search_term) >= 0 || val.url.search(search_term) >= 0) {
            if(typeof(that.data[search_category]) == 'undefined') {
              that.data[search_category] = [];
              that.data_keys.push(search_category);
            }
    
            that.data[search_category].push(val);
          }
        });
      });
      that.show_list();
      if(typeof(that.data[search_category]) == 'undefined') {
        alert('Not found');
      } else {
        window.setTimeout(function() { that.show_category(search_category); }, 300);
      }
    }
  }

  this.show_list = function() {
    var that = this;
    $.get('/templates/list_keys.html', function(data) {
      $('#content').html(data);
      if(isMobile) {
        $('#categories').show();
        $('#keys').hide();
        $('#entry').hide();
        $('#back_button').remove();
      } else {
        set_content_sizes();
      }

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
              $('span.copy_to_clipboard').hide();
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

      $.each(that.data_keys.sort(sortCategoryList), function(id, index) {
        var value = that.data[index];
        var label = index;
        if(index == '__empty__') {
          label = 'Empty Category';
        }
        cat = index.replace(' ', '_');
        $('#categories ul').append($('<li class="category_item" id="category_'+ cat +'">'+ label +'</li>'));

        $('#category_'+ cat).click(function() {
          that.show_category(index);
        });
      });
    });
  }

  this.show_entry = function(idx, key) {
    var that = this;
    var value = this.data[idx][key];

    if(isMobile) {
      $('#categories').hide();
      $('#keys').hide();
      $('#entry').show();

      $('#back_button').remove();
      $('<div id="back_button">Back</div>').insertBefore($('h1'));
      $('#back_button').click(function() {
        that.show_category(value.category);
      });
    }

    var entry = '<h3>'+ value.title +'</h3>';
    entry += '<div class="details"><p id="username_'+ value.key +'">Username: '+ value.username +'</p>';
    entry += '<p id="password_'+ value.key +'">Password: <i>hidden</i></p>';
    entry += '<p>Category: '+ value.category +'</p>';
    entry += '<p id="url_'+ value.key +'">Url: <a href="'+ value.url +'" target="_blank">'+ value.url +'</a></p>';
    entry += '<p id="note_'+ value.key +'">Note: '+ value.note.replace(/\n/g,'<br />') +'</p>';
    entry += '<p class="buttons"><span class="edit_button" id="editKey_'+ value.key +'">Edit</span> <span class="delete_button" id="deleteKey_'+ value.key +'">Delete</span> <span class="show_password_button" id="showPassword_'+ value.key +'">Show Password</span></p></div>';
    $('#entry').html(entry);
    $('#password_'+ value.key).append($(that.get_copy_code(value.password)));
    $('#username_'+ value.key).append($(that.get_copy_code(value.username)));
    $('#url_'+ value.key).append($(that.get_copy_code(value.url)));
    $('#note_'+ value.key).append($(that.get_copy_code(value.note)));
    $('#showPassword_'+ value.key).click(function() {
      $('#password_'+ value.key).toggleClass('active');
      if($('#password_'+ value.key).hasClass('active')) {
        $('#password_'+ value.key).html('Password: <pre>'+ value.password +'</pre>'+ that.get_copy_code(value.password));
        $('#showPassword_'+ value.key).text('Hide Password');
      } else {
        $('#password_'+ value.key).html('Password: <i>hidden</i>' + that.get_copy_code(value.password));
        $('#showPassword_'+ value.key).text('Show Password');
      }
    });
    $('#editKey_'+ value.key).click(function() {
      $.get('/templates/create_key.html', function(data) {
        $('#dialog-form').remove();
        var message = $('<div id="dialog-form" title="Edit Key">'+ data +'</div>');
        $('body').prepend(message);

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
            $('span.copy_to_clipboard').hide();
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
          $('span.copy_to_clipboard').hide();
        },
        close: function(event, ui) {
          $('span.copy_to_clipboard').show();
        },
        buttons: {
          "Delete": function() {
            $(this).dialog( "close" );
            that.delete_entry(value.key);
            window.setTimeout(function() { that.show_category(value.category); }, 1000);
          },
          Cancel: function() {
            $(this).dialog( "close" );
          }
        }
      });
    });
  }

  this.show_category = function(index) {
    var that = this;
    if(typeof(this.data[index]) == 'undefined') {
      return;
    }

    if(isMobile) {
      $('#categories').hide();
      $('#keys').show();
      $('#entry').hide();

      $('#back_button').remove();
      $('<div id="back_button">Back</div>').insertBefore($('h1'));
      $('#back_button').click(function() {
        that.show_list();
      });
    }

    cat = index.replace(' ', '_');
    var _category = index;
    $('#entry').empty();
    $('.show_keys').each(function() {
      $(this).prev().remove();
      $(this).remove();
    });
    $('#keys').prepend('<h3>'+ _category +'</h3><ul id="show_keys_'+ cat +'" class="show_keys"></ul>');
    $.each(this.data[index].sort(sortCategory), function(index_cat, value) {
      var entry = '<li>';
      entry += value.title +' <span>'+ value.username +'</span>';
      entry += '</li>';
      entry = $(entry).click(function() {
        $(this).parent().find('.active').each(function() {
          $(this).removeClass('active');
        });
        $(this).addClass('active');
        that.show_entry(_category, index_cat);
      });
      $('#show_keys_'+ cat).append($(entry));
    });
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
              , category: enccat.replace(/</g, "&lt;").replace(/>/g, "&gt;")
              , title: Crypto.AES.decrypt(value.title, that.password).replace(/</g, "&lt;").replace(/>/g, "&gt;")
              , username: Crypto.AES.decrypt(value.username, that.password).replace(/</g, "&lt;").replace(/>/g, "&gt;")
              , password: Crypto.AES.decrypt(value.password, that.password).replace(/</g, "&lt;").replace(/>/g, "&gt;")
              , url: Crypto.AES.decrypt(value.url, that.password).replace(/</g, "&lt;").replace(/>/g, "&gt;")
              , note: Crypto.AES.decrypt(value.note, that.password).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            });
          });
          $('#importer').click(function() {
            $('#dialog-modal').remove();
            var message = $('<div id="dialog-modal" title="Import from KeePassX"><textarea cols="45" rows="5" id="importer_field"></textarea></div>');
            $('#content').append(message);
            $("#dialog:ui-dialog").dialog("destroy");
            $("#dialog-modal").dialog({
              height: 240,
              modal: true,
              resizable: false,
              width: 400,
              open: function(event, ui) {
                $('.show_keys span.copy_to_clipboard').hide();
              },
              close: function(event, ui) {
                $('span.copy_to_clipboard').show();
              },
              buttons: {
                "Import": function() {
                  $.xmlDOM($('#importer_field').val()).find('group').each(function() {
                    var group_name = '';
                    $(this).find('> title').each(function() {
                      group_name = $(this).text();
                    });
                    $(this).find('> entry').each(function() {
                      var entry_title = '';
                      var entry_username = '';
                      var entry_password = '';
                      var entry_url = '';
                      var entry_note = '';
                      $(this).find('> title').each(function() { entry_title = $(this).text(); });
                      $(this).find('> username').each(function() { entry_username = $(this).text(); });
                      $(this).find('> password').each(function() { entry_password = $(this).text(); });
                      $(this).find('> comment').each(function() { entry_note = $(this).text(); });
                      $(this).find('> url').each(function() { entry_url = $(this).text(); });
                      
                      var data = {};
                      var cat = '';
                      if(group_name != '') {
                        cat = Crypto.AES.encrypt(group_name, that.password);
                      }
                      data.category = cat;
                      data.title = Crypto.AES.encrypt(entry_title, that.password);
                      data.username = Crypto.AES.encrypt(entry_username, that.password);
                      data.password = Crypto.AES.encrypt(entry_password, that.password);
                      data.url = Crypto.AES.encrypt(entry_url, that.password);
                      data.note = Crypto.AES.encrypt(entry_note, that.password);
                      
                      $.post('/api/saveKey', data, function(data) {
                        if(data.status == true) {
                          $("#dialog-modal").dialog('close');
                        }
                      }, 'json');
                    });
                  });
                  that.decrypt_data();
                  window.setTimeout(function() { that.show_category($('#create_category').val()); }, 1000);
                },
                Cancel: function() {
                  $(this).dialog("close");
                }
              },
            });
          });

          that.show_list();
          $(document).bind('keydown', 'ctrl+f', function() {
            that.show_search();
          });
          $(document).keypress(function(event) {
            if(event.which == '106') {
              $('#keys ul li.active').next('li').click();
            }
            if(event.which == '107') {
              $('#keys ul li.active').prev('li').click();
            }
          });
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
