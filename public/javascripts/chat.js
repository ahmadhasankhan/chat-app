var socket;
var myUserName;

function enableMsgInput(enable) {
    $('input#msg').prop('disabled', !enable);
}

function enableUsernameField(enable) {
    $('input#userName').prop('disabled', !enable);
    $('#go').prop('disabled', !enable);
}

function appendNewMessage(msg) {
    var html;
    if (msg.target == "All") {
        html = "<span class='allMsg'>" + msg.source + " : " + msg.message + "</span><br/>"
    } else {
        // It is a private message to me
        html = "<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>"
    }
    $('#msgWindow').append(html);
    var ta = document.getElementById('msgWindow');
    ta.scrollTop = ta.scrollHeight;
}

function appendNewUser(uName, notify) {
    $('select#users').append($('<option></option>').val(uName).html(uName));
    if (notify && (myUserName !== uName) && (myUserName !== 'All'))
        $('span#msgWindow').append("<span class='adminMsg'>==>" + uName + " just joined <==<br/>")
}

function handleUserLeft(msg) {
    $("select#users option[value='" + msg.userName + "']").remove();
}

socket = io.connect("http://localhost:3000");
//socket = io.connect("http://dreamchat.herokuapp.com");

function setFeedback(fb) {
    $('span#feedback').html(fb);
}

function setUsername() {
    myUserName = $('input#userName').val();
    socket.emit('set username', $('input#userName').val(), function (data) {
        console.log('emit set username', data);
    });
    console.log('Set user name as ' + $('input#userName').val());
}

function sendMessage() {
    var trgtUser = $('select#users').val();
    socket.emit('message',
        {
            "inferSrcUser": true,
            "source": "",
            "message": $('input#msg').val(),
            "target": trgtUser
        });
    $('input#msg').val("");
}

function setCurrentUsers(usersStr) {
    $('select#users >option').remove()
    appendNewUser('All', false)
    JSON.parse(usersStr).forEach(function (name) {
        appendNewUser(name, false);
    });
    $('select#users').val('All').attr('selected', true);
}

function validateUserName(username) {
    var regex = /^[0-9a-zA-Z]+.{2,9}$/;
    username = username.toLowerCase();
    if (username.capitalize() != "All") {
        if (regex.test(username)) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}

function callSetUsername() {
    setUsername();
    e.stopPropagation();
    e.stopped = true;
    e.preventDefault();
}

function userNameValidateFailed() {
    setFeedback("<span style='color: red'> Username is not valid. Choose a valid name.</span>");
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$(function () {
    enableMsgInput(false);

    socket.on('userJoined', function (msg) {
        appendNewUser(msg.userName, true);
    });

    socket.on('userLeft', function (msg) {
        handleUserLeft(msg);
    });

    socket.on('message', function (msg) {
        appendNewMessage(msg);
    });

    socket.on('welcome', function (msg) {
        setFeedback("<span style='color: green'> Username available. You can begin chatting.</span>");
        setCurrentUsers(msg.currentUsers)
        enableMsgInput(true);
        enableUsernameField(false);
    });

    socket.on('error', function (msg) {
        if (msg.userNameInUse) {
            setFeedback("<span style='color: red'> Username already in use. Try another name.</span>");
        }
    });

    //$('input#userName').change(setUsername);

    $('input#userName').keypress(function (e) {
        var username = $('input#userName').val();
        if (e.keyCode == 13) {
            if (validateUserName(username)) {
                callSetUsername();
            } else {
                userNameValidateFailed();
            }

        }
    });

    $('#go').click(function (e) {
        var username = $('input#userName').val();
        if (validateUserName(username)) {
            callSetUsername();
        } else {
            userNameValidateFailed();
        }
    });


    $('input#msg').keypress(function (e) {
        var message= $('input#msg').val();
        if (e.keyCode == 13) {
            if (message.length != 0) {
                sendMessage();
                e.stopPropagation();
                e.stopped = true;
                e.preventDefault();
                }
        }
    });
});