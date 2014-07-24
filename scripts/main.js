
//var $ = function(q) { return document.querySelector(q) };
var editor = null;
var cache = null;

window.onload = function() {
	setup();
	run();
};


var setup = function() {

    rs.data = new rs.Data({

    });
    rs.data.load();

    rs.editor = new rs.Editor({
        id: "editor",
    });

    rs.preview = new rs.Preview({
        query: "#preview",
    });

    // 
    $(window).on('popstate', function(e) {
        rs.data.load();
        rs.editor.setValue(rs.data.getCurrentValue());
        rs.editor.setMode(rs.data.getCurrentType());

        run();
    });

    setupEditor();
    setupAbout();
    setupSetting();
    setupShare();

    // support mobile
    var isMobile = (function() {
        var ua = navigator.userAgent;
        return (ua.indexOf("iPhone") > 0 || ua.indexOf("iPad") > 0 || ua.indexOf("Android") > 0);
    })();

    if (isMobile) {
        document.getElementById("editor").style.display = "none";
        document.getElementById("preview").style.width = "100%";
    }
};

var run = function() {
    rs.preview.run( rs.data.toCode() );
};

var save = function() {
    rs.data.save();
};

var load = function() {
    rs.data.load();
};


var setupEditor = function() {
    // デフォルト
    rs.editor.setValue(rs.data.getCurrentValue());
    rs.editor.setMode(rs.data.getCurrentType());

    // 編集の度
    editor = rs.editor.editor;
    editor.getSession().on('change', function(e) {
        var value = rs.editor.getValue();
        rs.data.setCurrentValue(value);
    });

    // ボタンの設定
    var buttons = document.querySelectorAll(".code-button");
    var each = Array.prototype.forEach;

    each.call(buttons, function(button) {
        var mode = button.dataset.mode;

        if (rs.data.getCurrent() == mode) {
            button.classList.add("active");
            console.log(mode);
        }

        button.onclick = function(e) {
            if (button.classList.contains('active') === false) {

                // 一旦すべて無効化する
                each.call(buttons, function(button) {
                    // アクティブ化
                    button.classList.remove('active');
                    // トグルを無効
                    delete button.querySelector('a').dataset.toggle;
                });

                // アクティブ化
                button.classList.add('active');
                // トグルを有効にする
                var a = button.querySelector('a');
                // a.dataset.toggle="dropdown";

                // 
                var key = this.dataset.mode;

                rs.data.setCurrent(key);
                
                rs.editor.setValue(rs.data.getCurrentValue());
                rs.editor.setMode(rs.data.getCurrentType());
                console.log("hoge2");
            }
            else {
                var a = button.querySelector('a');
                a.dataset.toggle="dropdown";
            }
            // else {
            //     var a = button.querySelector('a');
            //     a.dataset.toggle="dropdown";
            //     // トグルを有効にする
            //     console.log("hoge");
            // }

            return false;
        };

        // アクティブをセット
        var liList = button.querySelectorAll("li");
        var each = Array.prototype.forEach;

        each.call(liList, function(li) {
            var a = li.querySelector('a');
            var type = a.dataset.type;

            if (type === rs.data.data.code[mode].type) {
                li.classList.add('active');
            }

            a.onclick = function() {
                each.call(liList, function(li) {
                    li.classList.remove('active');
                });

                a.parentNode.classList.add('active');

                // データ更新
                rs.data.data.code[mode].type = a.dataset.type;
                rs.editor.setMode(rs.data.getCurrentType());

                return false;
            };
        });
    });

    $('#btn-run').on('click', function() {
        run(); return false;
    });
    $('#btn-save').on('click', function() {
        save(); return false;
    });
};



var setupAbout = function() {
    document.querySelector("#btn-about").onclick = function() {
        $('#aboutModal').modal('show');

        return false;
    };
};


var setupSetting = function() {
    document.querySelector(".setting").onclick = function() {
		$('#input-title').val(rs.data.getTitle());
		$('#input-detail').val(rs.data.getDetail());

    	$('#settingModal').modal('show');

    	return false;
    };

	$('#settingModal').on('hidden.bs.modal', function (e) {
        console.log("close window");
	});

	$('#btn-setting-save').on("click", function() {
        rs.data.setTitle( $('#input-title').val() );
        rs.data.setDetail( $('#input-detail').val() );

		save();
	});
};

var setupShare = function() {
	var shortURL = this.location.href;

    document.querySelector(".share").onclick = function() {
    	if (location.protocol == "file:") {
	    	$('#shareModal').modal('show');
    	}
    	else {
	    	getShortURL(location.href, function(url) {
	    		shortURL = url;
		    	$('#short-url').val(url);
		    	$('#shareModal').modal('show');
	    	});
    	}

    	return false;
    };

	$('#shareModal').on('hidden.bs.modal', function (e) {
        console.log("close modal");
	});

	$('#btn-twitter').on('click', function() {
        rs.share.twitter({
            text: rs.data.getTitle(),
            url: shortURL,
        });
	});

	$('#btn-facebook').on('click', function() {
        rs.share.facebook({
            text: rs.data.getTitle(),
            url: shortURL,
        });
	});

	$('#btn-google').on('click', function() {
        rs.share.google({
            text: rs.data.getTitle(),
            url: shortURL,
        });
	});

    $('#btn-pocket').on('click', function() {
        rs.share.pocket({
            text: rs.data.getTitle(),
            url: shortURL,
        });
    });

    $('#btn-hatebu').on('click', function() {
        rs.share.hatebu({
            text: rs.data.getTitle(),
            url: shortURL,
        });
    });

	$('#btn-fullscreen').on('click', function() {
        var html = rs.data.toCode();

	    window.open("data:text/html;base64," + window.btoa( unescape(encodeURIComponent( html )) ));
	});

    var downloadButton = document.getElementById("btn-download");
    downloadButton.onclick = function() {
        var title = '{title}.html'
            .replace('{title}', rs.data.getTitle())
            .replace(/\s/g, '_')
            ;

        var text = rs.data.toCode();

        var blob = new Blob([text]);
        var url = window.URL.createObjectURL(blob);

        downloadButton.download = title;
        downloadButton.href = url;
    };

};

