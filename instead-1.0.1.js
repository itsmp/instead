(function(window) {
    //instead.co.kr
    API = "https://instead.co.kr/api";
    if (!window.XMLHttpRequest) {
        window.XMLHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if (!window.XMLHttpRequest) {
        console.error('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }

    window.INSTEAD = function() {
        this.access_token = null;
        this.session_id = null;
    };

    INSTEAD.init = function(client_id) {
        var req = new XMLHttpRequest();
        req.open("POST", API + "/token", true);
        req.setRequestHeader("Content-Type", "application/json");
        var self = this;
        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
                self.access_token = JSON.parse(req.responseText).access_token;
            }
        };
        req.send(JSON.stringify({
            "client_id": client_id
        }));
    }

    INSTEAD.requestPay = function(input) {
        if (!this.access_token) {
            alert("먼저 INSTEAD.init() 을 호출하세요.");
            return;
        }
        var req = new XMLHttpRequest();
        req.open("POST", API + "/session", true);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.setRequestHeader("Authorization", "Bearer " + this.access_token);
        var self = this;
        window.onmessage = function(_){
            input.request_cb(_.data);
            console.log(_.data.result);
            if(_.data.result == 'opened'){
                uiBlock();
            }
            if(_.data.result == 'closed'){
                if(document.getElementById("blocker"))
                    document.getElementById("blocker").style.display = "none";
            }
        };
        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
                self.session_id = JSON.parse(req.responseText).session_id;
                window.open(API + '/pay?session_id='+self.session_id,'결제를 부탁해','width=375, height=600, scrollbars=yes');
            }
        };
        req.send(JSON.stringify(input));
    }

    function uiBlock() { 
        var blockUI = document.createElement("div");
        blockUI.setAttribute("id", "blocker");
        blockUI.innerHTML = `
            <div class="blocker-container">
                <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                <div class="blocker-title">요청 진행중</div>
            </div>
            <style>
                #blocker{
                    position: fixed;top: 0;left: 0;width: 100%;height: 100%;opacity: .5;background-color: #000;z-index: 99999;overflow: hidden;
                }
                .blocker-container{
                    //position: absolute;top: 50%;left: 50%;width: 5.5em;height: 2em;margin: -1em 0 0 -2.5em;color: #fff;font-weight: bold;
                    display:flex;
                    flex-direction:column;
                    width:100%;
                    height:100%;
                    margin:0;
                    align-items:center;
                    justify-content:center;
                }
                .blocker-title{
                    align-self:center;
                }
                .lds-ring {
                    display: flex;
                    // position: relative;
                    width: 64px;
                    height: 64px;
                    top: -85px;
                    left: 15%;
                }
                .lds-ring div {
                    box-sizing: border-box;
                    display: block;
                    position: absolute;
                    width: 51px;
                    height: 51px;
                    margin: 6px;
                    border: 6px solid #fff;
                    border-radius: 50%;
                    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                    border-color: #fff transparent transparent transparent;
                }
                .lds-ring div:nth-child(1) {
                    animation-delay: -0.45s;
                }
                .lds-ring div:nth-child(2) {
                    animation-delay: -0.3s;
                }
                .lds-ring div:nth-child(3) {
                    animation-delay: -0.15s;
                }
                @keyframes lds-ring {
                    0% {
                    transform: rotate(0deg);
                    }
                    100% {
                    transform: rotate(360deg);
                    }
                }
            </style>`;
        document.body.appendChild(blockUI);
        document.getElementById("blocker").style.display = "block";
    }

    function querystring(obj) {
        var pairs = [];
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            var k = encodeURIComponent(prop),
                v = encodeURIComponent(obj[prop]);
            pairs.push( k + "=" + v);
          }
        }
        return pairs.join("&");
    }
})(window);
