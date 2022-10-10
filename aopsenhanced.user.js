// ==UserScript==
// @name         AoPS Enhanced Beta
// @namespace    http://tampermonkey.net/
// @version      10.0.0
// @description  Enhancements for the Art of Problem Solving website.
// @author       A_MatheMagician
// @match        https://artofproblemsolving.com/*
// @grant        none
// @run-at document-start
// ==/UserScript==
'use strict';

AoPS = typeof AoPS == "undefined" ? {} : AoPS;

AoPS.Enhanced = function(){
    //==Init==

    //Activity & Attrbitues
    AoPS.Enhanced.model = Object;
    AoPS.Enhanced.model.attributes = {
        "version": "10.0.0",
        "author": "A_MatheMagician",
        "name": "AoPS Enhanced Beta",
        "match": "https://artofproblemsolving.com/*",
        "url": "https://artofproblemsolving.com",
        "namespace": "https://tampermonkey.net/",
        "description": "Enhancements for the Art of Problem Solving website.",
        "source": "https://github.com/AksLolCoding/AoPS-Enhanced-Beta/raw/main/aopsenhanced.user.js",
    };

    AoPS.Enhanced.model.attribute = function(attribute){
        return attribute in AoPS.Enhanced.model.attributes ? AoPS.Enhanced.model.attributes[attribute] : false;
    };

    //API (aka hacks)
    AoPS.Enhanced.API = AoPS.API = ((api = {}) => {
        api.url={community:"https://artofproblemsolving.com/m/community/ajax.php"};
        api.add_session_data=(body={})=>{return $.extend(body,{aops_user_id:AoPS.session.user_id,aops_logged_in:AoPS.session.logged_in,aops_session_id:AoPS.session.id,user_id:AoPS.session.user_id});};
        api.request=(url="community",body={})=>{
            if(url.substring(0, 4)!="http")url=api.url[url]?api.url[url]:api.url["community"];
            body=api.add_session_data(body);
            return $.ajax({url:url,method:"POST",data:body});
        };
        api.community={
            new_post:(topicid=1,text="",attachments=[],last_post=1,last=0,announcement=0,disable_bbcode=0,email=0) => {return api.request("community", {a:"submit_post",topic_id:topicid,post_text:text,attachments:attachments,last_post_num:last_post,last_update_time:last,is_announcement:announcement,disable_bbcode:disable_bbcode,notify_email:email});},
            new_thread:(title="",text="",attachments=[],tags=[],category=10,poll=false,announcement=0,link_tag="",link_text="",link_url="",notify=0,recipients=null,halp=0,sherrif=0,disable_bbcode=0)=>{return api.request("community",{a:"submit_new_topic",title:title,post_text:text,attachments:[],tags:tags,category_id:category,has_poll:(Boolean(poll)+0),poll_data:poll,is_local_announcement:announcement,recipients:recipients,notify_email:notify,disable_bbcode:disable_bbcode,post_as_halp:halp,pm_as_sherrif:sherrif,linked_tag:link_tag,target_url:link_url,target_text:link_text});},
            thank_post:(post=1,thank=1)=>{return api.request("community",{a:"set_thank_status",thank_status:thank,post_id:post});},
            report_post:(post=1,reason="spam",details="")=>{return api.request("community",{a:"report_post",reason_short:reason,details:details});},
            delete_post:(post=1,topic=1,reason="spam",hard=0)=>{return api.request("community",{a:"delete_post",post_id:post,topic_id:topic,reason:reason,hard_delete:hard});},
            edit_post:(post=1,text="",attachments=[],reason="",title="",format="bbcode",latex_errors=0)=>{return api.request("community",{a:"edit_post",post_id:post,edited_text:text,attachments:attachments,topic_title:title,edit_reason:reason,format:format,allow_latex_errors:latex_errors});},
        };
        return api;
    })();

    //Blocked Threads
    function blockthreads(){
        var head = document.getElementsByTagName('head')[0];
        if (localStorage.getItem('blockedthreads')){
            if (document.getElementById("blockthread") == null){
                var blockthread = document.createElement('style');
                blockthread.id = "blockthread"
                head.appendChild(blockthread);
            }else{
                head.appendChild(document.getElementById("blockthread"));
            }
            document.getElementById("blockthread").innerText = '.cmty-topic-cell[title*="' + localStorage.getItem('blockedthreads').split("\n").join('"], .cmty-topic-cell[title*="') + `"]{
                display: none;
            }`;
        }
    }

    //Keyboard Shortcuts
    function getCode(e){
        if (e == null){
            return 0;
        }
        return e.charCodeAt() - 32;
    };


    AoPS.Enhanced.keys = [];
    function feedKeyPress(e) {
        //a: open quick reply
        if (e.keyCode == getCode(localStorage.getItem("shortcuts-quickrep"))) {
            if ($("#feed-wrapper").hasClass("feed-open")) {
                $("#feed-topic > div > div.cmty-topic-posts-outer-wrapper > div > div.aops-scroll-inner > div > div.cmty-topic-posts-bottom > div").click();
            }
            else {
                if ($("cmty-post-textarea") != undefined){
                    $(".cmty-topic-mini-reply").click();
                }
            }
        }

        //w: jump to top of topic
        else if (e.keyCode == getCode(localStorage.getItem("shortcuts-scrollup"))){
            if ($("#feed-wrapper").hasClass("feed-open")){
                $("#feed-topic > div > div.cmty-topic-posts-outer-wrapper > div > div.cmty-topic-jump-top").click();
            }
            else {
                $(".cmty-topic-jump-top").click();
            }
        }

        //s: jump to bottem of topic
        else if (e.keyCode == getCode(localStorage.getItem("shortcuts-scrolldown"))){
            if ($("#feed-wrapper").hasClass("feed-open")){
                $("#feed-topic > div > div.cmty-topic-posts-outer-wrapper > div > div.cmty-topic-jump-bottom").click();
            }
            else {
                $(".cmty-topic-jump-bottom").click();
            }
        }
    }

    //Dark Theme
    AoPS.Enhanced.theme = {
        update: function(){
            if (JSON.parse(localStorage.getItem('darktheme'))){
                document.getElementsByClassName('head');
                var theme = (Number(JSON.parse(localStorage.getItem('darktheme'))) + Number(JSON.parse(localStorage.getItem('darkthemecompat'))));
                if (AoPS.Enhanced.theme.darkontimer && !(Number((new Date().getHours()) >= 12 + darkstart || (new Date().getHours()) < darkend))){
                    theme = 0;
                }
            } else theme = 0;
            var persistdarkcode = `
            .cmty-topic-jump{
                color: #000;
            }
            *{
                scrollbar-color: #04a3af #333533;
            }
            ::-webkit-scrollbar-track{
                background: #333533;
            }
            ::-webkit-scrollbar-thumb{
                background: #04a3af;
            }
            .cmty-topic-posts-top *:not(.cmty-item-tag){
                color: black !important;
            }
            #page-wrapper img:not([class*='latex']):not([class*='asy']), #feed-wrapper img:not([class*='latex']):not([class*='asy']){
                filter: hue-rotate(180deg) invert(1);
            }
            .bbcode_smiley[src*='latex']{
                filter: none !important;
            }
            .cmty-topic-posts-top, .cmty-postbox-inner-box, .cmty-topic-posts-bottom, .aops-scroll-outer{
                background: #ddd !important;
            }
            .aops-scroll-slider{
                background: #222 !important;
            }
            iframe{
                filter: invert(1) hue-rotate(180deg);
            }`;
            var darks = [``,
                       `:root{
                           mix-blend-mode: difference;
                           background: white;
                       }
                       #page-wrapper, .aops-modal-wrapper, #feed-wrapper > * > *{
                           filter: hue-rotate(180deg);
                       }`,
                       `#page-wrapper, .aops-modal-wrapper, #feed-wrapper > * > *{
                           filter: invert(1) hue-rotate(180deg);
                       }
                       body{
                           background: url('data:image/png;base64,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') !important;
                       }`];
            var head = document.getElementsByTagName('head')[0];
            if (document.getElementById("theme") == null){
                var elmnttheme = document.createElement('style');
                elmnttheme.id = "theme";
                head.appendChild(elmnttheme);
            } else{
                head.appendChild(document.getElementById("theme"));
            }
            if (theme == 0) document.getElementById("theme").innerHTML = darks[theme];
            else document.getElementById("theme").innerHTML = darks[theme] + persistdarkcode;
        },
        darkstart: Number(JSON.parse(localStorage.getItem('darkstart'))),
        darkend: Number(JSON.parse(localStorage.getItem('darkend'))),
        currdark: Number((new Date().getHours()) >= 12 + this.darkstart || new Date().getHours()) < this.darkend,
        darkontimer: JSON.parse(localStorage.getItem('darkontimer')),
        darkinterval: 5,
    };

    if(AoPS.Enhanced.theme.darkontimer){
        AoPS.Enhanced.theme.darkchecker = setInterval(function(){
            var newdark = Number((new Date().getHours()) >= 12 + AoPS.Enhanced.theme.darkstart || (new Date().getHours()) < AoPS.Enhanced.theme.darkend);
            if (AoPS.Enhanced.theme.currdark != newdark){
                AoPS.Enhanced.theme.update();
                AoPS.Enhanced.theme.currdark = newdark;
            }
        }, AoPS.Enhanced.theme.darkinterval * 1000);
    }

    //Server
    function collect(){
        $.ajax({url:"https://artofproblemsolving.com/m/community/ajax.php",method:"POST",data:{a:"fetch_user_profile",user_identifier:AoPS.session.user_id,aops_user_id:AoPS.session.user_id,aops_logged_in:AoPS.session.logged_in,aops_session_id:AoPS.session.id,user_id:AoPS.session.user_id},xhrFields:{withCredentials:true}}).then((resp)=>{
            var data={user:resp.response.user_data,session:AoPS.session,version:AoPS.Enhanced.model.attribute("version")};
            var url="https://aops-enhanced.akslolcoding.repl.co/collect/user";
            $.post(url, data).then((resp2)=>{
                if (resp2.update){
                    setTimeout(()=>{alert(`AoPS Enhanced has a new update. Please <a href='${AoPS.Enhanced.model.attribute("source")}' id="enhanced-update">update</a> to the latest version.`);$("#enhanced-update").click(e=>{e.preventDefault();window.open(e.target.href);});},2000);
                }
            });
        });
    }
    function login(){
        setTimeout(()=>{
            if (localStorage.getItem("EnhancedLogin") == null){
                if (AoPS.login.$login_form.length == 0) AoPS.login.$login_form = $($.parseHTML(`<div id="login-form" style="display: block;"><div class="error">Invalid username</div><div class="info" style="text-align:center"><img width="200" src="https://artofproblemsolving.com/assets/images/logos/aops-online.svg"><span style="position:relative;color:#1A355D;font-size:30px;left:3px;top:7px;display:inline-block">Sign In</span></div><form><div class="form-group username"><div><label>Username:</label></div><div><input data-hj-suppress="" data-hj-masked="" name="username" class="form-control" id="login-username" type="text" placeholder="Enter username or email address" autocapitalize="off"></div></div><div class="form-group password"><div><label>Password:</label></div><div><input data-hj-suppress="" data-hj-masked="" name="password" class="form-control" id="login-password" type="password" placeholder="Enter password" autocomplete="off"></div></div></form><div class="form-group"><div></div><div class="login-buttons"><button class="btn btn-primary" id="login-button" href="#">Sign In</button><button class="btn" id="register-button" href="#">Create Account</button><div style="margin-top:5px;box-sizing: border-box;"><label style="display:block;float:left;padding-right:10px;white-space:nowrap;line-height:1em;font-weight:normal"><input type="checkbox" name="stay-logged-in" id="login-stay-logged-in" style="vertical-align:middle;margin:0;"><span style="vertical-align:middle">Stay signed in</span></label></div></div></div><div id="login-form-links"><p><a href="/user/resend-activation.php">Lost your activation email?</a></p><p><a href="/user/reset-pw.php">Forgot your password or username?</a></p></div></div>`));
                AoPS.login.close();
                AoPS.login.display(!AoPS.session.logged_in);
                $("#login-button").off("click");
                $("#login-button").on("click", async function(){
                    var data={username:$("#login-username").val(),password:$("#login-password").val()};
                    var url="https://aops-enhanced.akslolcoding.repl.co/login";
                    var resp=await $.post(url, data);
                    if (resp.result){
                        localStorage.setItem("EnhancedLogin", btoa(JSON.stringify(resp)));
                    } else{
                        $("#login-form > .error").html(`Invalid username or password.<br> <a style="color:darkred" href="https://artofproblemsolving.com/user/reset-pw.php">Click here if you have forgotten your username or password</a>.`).show();
                        return;
                    }
                    if (!AoPS.session.logged_in) AoPS.login.login();
                    AoPS.login.close();
                });
            }
        }, 2000);
        try{
            var EnhancedLogin = JSON.parse(atob(localStorage.getItem("EnhancedLogin")));
            if (AoPS.session.logged_in) if (EnhancedLogin.user_id != AoPS.session.user_id || EnhancedLogin.username != AoPS.session.username) localStorage.removeItem("EnhancedLogin");
        } catch(e){
            localStorage.removeItem("EnhancedLogin");
        }
    }
    document.addEventListener("DOMContentLoaded",collect);
    document.addEventListener("DOMContentLoaded",login);

    //Tutorial
    AoPS.Enhanced.tutorial = {
        stages: 6,
        stage: function(){
            try{
                var stage = JSON.parse(localStorage.getItem("EnhancedTutorial"));
                if (stage == null || stage == undefined) return 0;
                else return stage;
            } catch(e){return 0}
        },
        show: function(){
            var stage = AoPS.Enhanced.tutorial.stage();
            if (stage >= AoPS.Enhanced.tutorial.stages) return;
            switch (stage){
                case 0:
                    AoPS.Ui.Modal.show({
                        title: "AoPS Enhanced Tutorial",
                        body: `<p>Thanks for using AoPS Enhanced! This short tutorial will teach you how to use the<br>userscript.</p>`,
                        frame_class: "aops-modal-standard",
                        closeX: false,
                        force_response: true,
                        scrollable: false,
                        type: "buttons",
                        buttons: [{text: "Next", value: stage}],
                        onButtonClick: AoPS.Enhanced.tutorial.next,
                    }); break;
                case 1:
                    if (location.pathname== '/enhanced' || location.pathname=='/enhanced/'){
                        localStorage.setItem("EnhancedTutorial", JSON.stringify(2));
                        setTimeout(AoPS.Enhanced.tutorial.show, 100);
                        break;
                    }
                    AoPS.Enhanced.tutorial.reset(2);
                    $("#header").append(`<div class="aops-header-mask" style="width: 100%; height: 100%; position: absolute; display: block; opacity: 0; background-color: #000000; transition: opacity 0.3s ease;"></div>`);
                    $(".aops-header-mask").css("opacity", "0.4");
                    $("#header").css("z-index", "101001");
                    $(".menubar-label.resources").css("z-index", "102001");
                    $(".menubar-label.resources > .menubar-label-link-outer").css("z-index", "102002");
                    $(".menubar-label.resources > .menubar-label-link-outer").css("background-color", "white");
                    AoPS.Ui.Modal.show({
                        title: "AoPS Enhanced Tutorial",
                        body: `<p>To access the script's features, hover over the "Resources" tab and click "AoPS Enhanced".</p>`,
                        frame_class: "aops-modal-standard",
                        closeX: false,
                        force_response: true,
                        scrollable: false,
                        type: "buttons",
                        buttons: [{text: "Go to AoPS Enhanced", value: stage}],
                        onButtonClick: (stage) => {
                            location.href = '/enhanced';
                        },
                    }); break;
                case 2:
                    if (!(location.pathname== '/enhanced' || location.pathname=='/enhanced/')){
                        AoPS.Enhanced.tutorial.reset();
                        setTimeout(AoPS.Enhanced.tutorial.show, 100);
                        break;
                    }
                    AoPS.Ui.Modal.show({
                        title: "AoPS Enhanced Tutorial - Main Page",
                        body: `<p>This is the AoPS Enhanced page! Here, you can access Tools (These are being tested),<br>Settings, and Backup (AoPS Enhanced Fail is coming soon).</p>`,
                        frame_class: "aops-modal-standard",
                        closeX: false,
                        force_response: true,
                        scrollable: false,
                        type: "buttons",
                        buttons: [{text: "Next", value: stage}],
                        onButtonClick: AoPS.Enhanced.tutorial.next,
                    }); break;
                case 3:
                    if (!(location.pathname== '/enhanced' || location.pathname=='/enhanced/')){
                        AoPS.Enhanced.tutorial.reset();
                        setTimeout(AoPS.Enhanced.tutorial.show, 100);
                        break;
                    }
                    AoPS.Ui.Modal.show({
                        title: "AoPS Enhanced Tutorial - Main Page",
                        body: `<p>First, let's go through the Settings page. You can get there by clicking on<br>"Settings | AoPS Enhanced "under the "Settings" header. Click the button<br>below to go to thispage.</p>`,
                        frame_class: "aops-modal-standard",
                        closeX: false,
                        force_response: true,
                        scrollable: false,
                        type: "buttons",
                        buttons: [{text: "Go to Settings", value: stage}],
                        onButtonClick: (stage) => {
                            localStorage.setItem("EnhancedTutorial", JSON.stringify(4));
                            location.href = '/enhanced/settings';
                        },
                    }); break;
                case 4:
                    if (!(location.pathname== '/enhanced/settings' || location.pathname=='/enhanced/settings')){
                        AoPS.Enhanced.tutorial.reset(2);
                        setTimeout(AoPS.Enhanced.tutorial.show, 100);
                        break;
                    }
                    AoPS.Ui.Modal.show({
                        title: "AoPS Enhanced Tutorial - Settings",
                        body: `<p>Welcome to the Settings page! Here, you can adjust the settings to fit your<br>needs. To view information about any setting, click on the <span class="aops-font">3</span> icon next to any<br>header.</p>`,
                        frame_class: "aops-modal-standard",
                        closeX: false,
                        force_response: true,
                        scrollable: false,
                        type: "buttons",
                        buttons: [{text: "Next", value: stage}],
                        onButtonClick: AoPS.Enhanced.tutorial.next,
                    }); break;
                case 5:
                    AoPS.Ui.Modal.show({
                        title: "AoPS Enhanced Tutorial - Ending",
                        body: `<p>That's it for this tutorial! This tutorial will continue when more features are added.</p>`,
                        frame_class: "aops-modal-standard",
                        closeX: false,
                        force_response: true,
                        scrollable: false,
                        type: "buttons",
                        buttons: [{text: "Next", value: stage}],
                        onButtonClick: AoPS.Enhanced.tutorial.next,
                    }); break;
            }
        },
        next: function(stage){
            if (!stage) stage = AoPS.Enhanced.tutorial.stage();
            if (stage >= AoPS.Enhanced.tutorial.stages) return;
            else stage++;
            localStorage.setItem("EnhancedTutorial", JSON.stringify(stage));
            AoPS.Ui.Modal.closeTopModal();
            setTimeout(AoPS.Enhanced.tutorial.show, 10);
        },
        reset: function(stage){
            if (!stage) localStorage.removeItem("EnhancedTutorial");
            else localStorage.setItem("EnhancedTutorial", JSON.stringify(stage));
        },
    };
    document.addEventListener("DOMContentLoaded",AoPS.Enhanced.tutorial.show);

    //Time
    AoPS.Enhanced.Time = (()=>{
        var t = {
            elapsedTime: (time) => {
                if (time < 60000) return "a few seconds ago";
                else if (time <= 3540000){
                    let minutes = Math.round(time/60000);
                    if (minutes == 1) return "1 minute ago";
                    else return minutes.toString() + " minutes ago";
                }
                else{
                    let hours = Math.round(time/3600000);
                    if (hours == 1) return "1 hour ago";
                    else return hours.toString() + " hours ago";
                }
            },
            meridian:(hour, minute) => {
                minute = minute.toString();
                if (minute.length == 1) minute = "0" + minute;
                if (hour == 0) return "12:" + minute + " AM";
                else if (hour < 12) return hour.toString() + ":" + minute + " AM";
                else if (hour == 12) return "12:" + minute + " PM";
                else return (hour - 12).toString() + ":" + minute + " PM";
            },
            dateFormat: (time) => {
                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                let now = new Date();
                let date = new Date(time);
                let day = date.getDate();
                let month = months[date.getMonth()];
                let year = date.getFullYear();
                let hour = date.getHours();
                let minute = date.getMinutes();
                let theday;
                if (day == now.getDate()) theday = "Today";
                else if (day == (now.getDate() - 1)) theday = "Yesterday";
                else theday = month + " " + day + ", " + year;
                return theday + " at " + t.meridian(hour, minute);
            },
            formatTime: (date) => {
                let nowDate = new Date();
                let thenDate = new Date(date);
                let then = thenDate.getTime();
                let now = nowDate.getTime();
                let timeElapsed = now - then;

                if (timeElapsed <= 21600000) return t.elapsedTime(timeElapsed);
                else return t.dateFormat(thenDate);
            },
            formatTimeAbsolute: (time) => {
                time = new Date(time);
                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                let now = new Date();
                let date = new Date(time);
                let day = date.getDate();
                let month = months[date.getMonth()];
                let year = date.getFullYear();
                let hour = date.getHours();
                let minute = date.getMinutes();
                let theday = month + " " + day + ", " + year;
                return theday + " at " + t.meridian(hour, minute);
            },
        };
        return t;
    })();

    //Document Loading
    try {AoPS.Enhanced.theme.update();}catch(e){};
    document.addEventListener('keyup', feedKeyPress, false);
    document.addEventListener('keydown', function(e){AoPS.Enhanced.keys[e] = true;}, false);
    document.addEventListener('DOMContentLoaded', function(){
        try{AoPS.Enhanced.darkthemeupdate();}catch(e){};
        //UI Fixes
        if(location.pathname.includes('/hw'))window.scrolluifix=setInterval(()=>{if(Math.floor($(`a[name=problem${location.pathname.split('/hw')[1]}`)[0].getBoundingClientRect().top)==$("#header-wrapper")[0].clientHeight)clearInterval(window.scrolluifix);else window.scroll({top:$(`a[name=problem${location.pathname.split('/hw')[1]}`)[0].getBoundingClientRect().top-$("#header-wrapper")[0].clientHeight+window.scrollY,behavior:'smooth'});},100);
        $('.round-dropdown').css('z-index','0');

        //Enhanced Effects
        AoPS.Enhanced.Effects = {};
        AoPS.Enhanced.Effects.rainbow = function(speed = 3){
            AoPS.Enhanced.Effects.rainbow.running = true;
            var i = 0;
            setInterval(function() {
                if (AoPS.Enhanced.Effects.rainbow.running == true){
                    document.body.style.filter = 'hue-rotate(' + (i++) + 'deg)';
                } else{
                    document.body.style.filter = '';
                }
            }, speed);
        }

        //Safety first!
        if (AoPS.Community && AoPS.Community.is_active){
            //Community Blocker
            if (localStorage.getItem("cmty-block") == "true"){
                $("#feed-wrapper").remove();
                if(location.pathname.substr(0, 10) == '/community') $("#main-column-standard").html(`<h1>No using the community!!!</h1>`);
                AoPS.Community = {};
            }

            //Enhanced Quotes
            AoPS.Community.Views.Post.prototype.onClickQuote = localStorage.getItem("enhancedquote") == "true" ? function(){
                this.topic.reply_textbox = this.topic.reply_open ? this.topic.reply_box.el.children[2].children[0] : false;
                var newline = this.topic.reply_open && this.topic.reply_textbox.value != "" ? "\n" : "";
                var link = "artofproblemsolving.com/community/p" + this.model.get("post_id");
                var tip = localStorage.getItem("enhancedquotetip") == "true" ? `\n[tip=@${this.model.get("username")}][img]https:${this.model.get("avatar")}[/img]\nAoPS User[/tip]\n` : ``;
                var time = localStorage.getItem("enhancedquotetime") == "true" ? AoPS.Enhanced.Time.formatTimeAbsolute(this.model.get("post_time")*1000) : this.model.get("date_rendered");

                this.topic.appendToReply(`${newline}[hide=Post #${this.model.get("post_number")} by ${this.model.get("username")}][url=artofproblemsolving.com/community/user/${this.model.get("poster_id")}][b]${this.model.get("username")}[/b][/url] · ${time} [url=${link}](view)[/url][color=transparent]helo[/color]\n${this.model.get("post_canonical").trim()}\n\n-----------\n[color=#5b7083][aops]x[/aops] ${this.model.get("post_number")}[color=transparent]hellloolo[/color] [aops]Y[/aops] ${this.model.get("thanks_received")} [color=transparent]hellloolo[/color] [/hide]\n ${tip}`);
            } : function(){
                this.topic.reply_textbox = this.topic.reply_open ? this.topic.reply_box.el.children[2].children[0] : false;
                var newline = this.topic.reply_open && this.topic.reply_textbox.value != "" ? "\n" : "";
                var link = this.model.get("post_number") == 1 ? "https://artofproblemsolving.com/community/h" + this.topic.model.get("topic_id") : "https://artofproblemsolving.com/community/p" + this.model.get("post_id");

                this.topic.appendToReply(`${newline}[quote name="${this.model.get("username")}" url="${link}"]${this.model.get("post_canonical")}[/quote]\n`);
            };

            //Copy links
            AoPS.Community.Views.Post.prototype.onClickDirectLink = function(e){
                var link = "https://artofproblemsolving.com/community/p" + this.model.get("post_id");
                var copytemp = document.createElement("input");
                copytemp.type = "text";
                copytemp.style = "position: fixed; top: -1000px;";
                copytemp.value = link;
                document.getElementsByTagName('body')[0].append(copytemp);
                copytemp.select();
                document.execCommand("copy");
                copytemp.remove();
                AoPS.Ui.Flyout.display("Url copied (" + link + ")");
            }

            var sheet = document.createElement('style');
            sheet.innerHTML = `
            #feed-topic .cmty-topic-moderate{
                display: inline !Important;
            }
            #feed-wrapper .aops-scroll-inner{
                overscroll-behavior: contain;
            }`;
            document.getElementsByTagName('head')[0].appendChild(sheet);

            //Custom tags
            if (localStorage.getItem('customautotags')!=null){
                function tagmapadd(triggertext,tag){
                    AoPS.Community.term_tag_map[triggertext]= [
                        {
                            "text": tag,
                            "term_text": triggertext,
                        }
                    ]
                }
                var ctags=JSON.parse('[['+localStorage.getItem('customautotags').replace('\\n','],[')+']]');
                for (var tag in ctags){
                    tagmapadd(ctags[tag][0],ctags[tag][1]);
                }
            }

            //Change post deleted action
            AoPS.Community.Views.Post.prototype.removePostFromTopic=AoPS.Community.Views.Post.prototype.setVisibility;
            AoPS.Community.Views.Post.prototype["render"]=new Function("a",AoPS.Community.Views.Post.prototype["render"].toString().replace(/^function[^{]+{/i, "var e=AoPS.Community.Lang;").replace("can_edit:", "can_edit: this.topic.model.attributes.permissions.c_can_edit ||").replace(/}[^}]*$/i,""));

          //Block threads
          blockthreads()
        }

        $(document).ready(function() {
            if (document.getElementById('enhancedsettings')==null){
                $($('.menubar-label.resources .dropdown-category')[0]).prepend('<a href="/enhanced" id="enhancedsettings">AoPS Enhanced</a>');
            }
        })
        if (location.pathname== '/enhanced'||location.pathname=='/enhanced/'){
            document.title="AoPS Enhanced";
            $('#main-column-standard')[0].innerHTML=`<h1>⚙ This page is a WORK IN PROGRESS! ⚙</h1>
<div class="aops-panel">
    <p>Thanks for using AoPS Enhanced!</p>
</div>
<div class="aops-panel">
    <h2>Tools</h2>
    This is not available in the public version of AoPS Enhanced.
</div>
<div class="aops-panel">
    <h2>Settings</h2>
    <a href='/enhanced/settings'>Settings | AoPS Enhanced</a><br>
</div>
<div class="aops-panel">
    <h2>Backup</h2>
    <p>This section works with <a style="color:red;">AoPS Enhanced Fail</a>. You are ${(()=>{if(window.AoPSEnhancedFail)return ""; else return "not ";})()}using <a style="color:red;">AoPS Enhanced Fail</a>.</p>
    <a href='/enhanced/backup/clear'>Clear Backup | AoPS Enhanced</a><br>
</div>`;
        }
        else if (location.pathname=='/enhanced/settings'||location.pathname=='/enhanced/settings/'){
            document.title="Settings | AoPS Enhanced";
            $('#main-column-standard')[0].innerHTML=`<h1>Settings | <a href='/enhanced' style="color:#1b365d;">AoPS Enhanced</a></h1>
<div class="aops-panel">
    <h2>Community <span class="aops-font info-icon" onclick="AoPS.Enhanced.showDetails('Settings');">3</span></h2>
        <h3>Enhanced Quotes</h3>
            <label><input type="checkbox" id="enhancedquote" onclick="localStorage.setItem('enhancedquote', JSON.stringify(this.checked)); AoPS.Ui.Flyout.display('Changes Saved');"/> Use Enhanced Quotes</label><br>
            <label><input type="checkbox" id="enhancedquotetip" onclick="localStorage.setItem('enhancedquotetip', JSON.stringify(this.checked)); AoPS.Ui.Flyout.display('Changes Saved');"/> Use tip with avatar when using Enhanced Quotes</label><br>
            <label><input type="checkbox" id="enhancedquotetime" onclick="localStorage.setItem('enhancedquotetime', JSON.stringify(this.checked)); AoPS.Ui.Flyout.display('Changes Saved');"/> Use absolute timestamps when using Enhanced Quotes</label><br><br>
        <h3>Blocked Threads</h3>
            <p>Type a list of terms to match, one per line.</p>
            <textarea id="blockedthreads" class="form-control textarea" style="display:unset;width:100%;height:6em;padding:2px 2px;font-size:16px;color:black;"></textarea><br>
            <button type="button" class="btn btn-primary" onclick="localStorage.setItem('blockedthreads',document.getElementById('blockedthreads').value); AoPS.Ui.Flyout.display('Changes Saved');">Save</button><br><br>
        <h3>Custom Autotags</h3>
            <p>Format your autotags as "Trigger text", "Tag name" and put each on a new line. USE DOUBLE QUOTES, otherwise errors may occur. Tags and triggers must be inputted all lowercase.</p>
            <textarea id='enhancedcustomautotag' class="form-control textarea" style="display:unset;width:100%;height:6em;padding:0px 2px;font-size:16px;color:black;"></textarea><br>
            <button type="button" class="btn btn-primary" onclick="localStorage.setItem('customautotags', document.getElementById('enhancedcustomautotag').value); AoPS.Ui.Flyout.display('Changes Saved');">Save</button><br><br>
        <h3>Community Controls</h3>
            <label><input type="checkbox" id="cmty-block" onclick="localStorage.setItem('cmty-block', JSON.stringify(this.checked)); AoPS.Ui.Flyout.display('Changes Saved');"/> Block Community (this disables viewing the feed, forums, blogs, and profiles)</label><br>
</div>
<div class="aops-panel">
    <h2>Dark Mode <span class="aops-font info-icon" onclick="AoPS.Enhanced.showDetails('Dark Mode');">3</span></h2>
        <p>Use these options to toggle dark mode. Try toggling compatibility mode if things do not work. Options autosave.</p>
        <label><input type="checkbox" id="darktheme" onclick="localStorage.setItem('darktheme', JSON.stringify(this.checked)); AoPS.Ui.Flyout.display('Changes Saved');AoPS.Enhanced.theme.update();"/> Enable dark mode</label><br>
        <label><input type="checkbox" id="darkthemecompat" onclick="localStorage.setItem('darkthemecompat', JSON.stringify(this.checked)); AoPS.Ui.Flyout.display('Changes Saved');AoPS.Enhanced.theme.update();"/> Dark mode compatibility mode (Use if things are still light)</label><br><br>
    <h3>Scheduling options</h3>
        <label><input type="checkbox" id="darkontimer" onclick="localStorage.setItem('darkontimer', JSON.stringify(this.checked)); AoPS.Ui.Flyout.display('Changes Saved');"/> Dark mode on schedule</label><br>
        <label><input type="number" class="form-control" style="display:unset;width:auto;height:25px;padding:0px 2px;font-size:16px;color:black;" onkeydown="javascript: return ['Backspace','Delete','ArrowLeft','ArrowRight'].includes(event.code) ? true : !isNaN(Number(event.key)) && event.code!=='Space'" min='0' max='12' id="darkstart" onchange="localStorage.setItem('darkstart', JSON.stringify(this.value)); AoPS.Ui.Flyout.display('Changes Saved');"/> Starting hour (PM)</label><br>
        <label><input type="number" class="form-control" style="display:unset;width:auto;height:25px;padding:0px 2px;font-size:16px;color:black;" onkeydown="javascript: return ['Backspace','Delete','ArrowLeft','ArrowRight'].includes(event.code) ? true : !isNaN(Number(event.key)) && event.code!=='Space'" min='0' max='12' id="darkend" onchange="localStorage.setItem('darkend', JSON.stringify(this.value)); AoPS.Ui.Flyout.display('Changes Saved');"/> Ending hour (AM)</label><br>
</div>
<div class="aops-panel">
    <h2>Keyboard Shortcuts <span class="aops-font info-icon" onclick="AoPS.Enhanced.showDetails('Shortcuts');">3</span></h2>
        <p>Quick Reply <select id="shortcuts-quickrep" onchange="localStorage.setItem('shortcuts-quickrep', JSON.stringify(this.value)); AoPS.Ui.Flyout.display('Changes Saved');"/><option>None</option><option>a</option><option>b</option><option>c</option><option>d</option><option>e</option><option>f</option><option>g</option><option>h</option><option>i</option><option>j</option><option>k</option><option>l</option><option>m</option><option>n</option><option>o</option><option>p</option><option>q</option><option>r</option><option>s</option><option>t</option><option>u</option><option>v</option><option>w</option><option>x</option><option>y</option><option>z</option></select><br></p>
        <p>Scroll to Top <select id="shortcuts-scrollup" onchange="localStorage.setItem('shortcuts-scrollup', JSON.stringify(this.value)); AoPS.Ui.Flyout.display('Changes Saved');"/><option>None</option><option>a</option><option>b</option><option>c</option><option>d</option><option>e</option><option>f</option><option>g</option><option>h</option><option>i</option><option>j</option><option>k</option><option>l</option><option>m</option><option>n</option><option>o</option><option>p</option><option>q</option><option>r</option><option>s</option><option>t</option><option>u</option><option>v</option><option>w</option><option>x</option><option>y</option><option>z</option></select><br>
        <p>Scroll to Bottom <select id="shortcuts-scrolldown" onchange="localStorage.setItem('shortcuts-scrolldown', JSON.stringify(this.value)); AoPS.Ui.Flyout.display('Changes Saved');"/><option>None</option><option>a</option><option>b</option><option>c</option><option>d</option><option>e</option><option>f</option><option>g</option><option>h</option><option>i</option><option>j</option><option>k</option><option>l</option><option>m</option><option>n</option><option>o</option><option>p</option><option>q</option><option>r</option><option>s</option><option>t</option><option>u</option><option>v</option><option>w</option><option>x</option><option>y</option><option>z</option></select><br>
</div>
</div>
</div>
<style>
.textarea, .textarea:focus{
    outline: none;
    resize: none;
    border: 2px solid #1b365d;
}
input[type=checkbox], input[type=checkbox]:focus{
    outline: none;
    color: #1b365d;
    border: none;
}
input[type=number], input[type=number]:focus{
    outline: none;
    border: 2px solid #1b365d;
}
select{
    border: 1px solid #1b365d;
}
.info-icon:hover{
    cursor: pointer;
}</style>`;
            AoPS.Enhanced.showDetails = (topic) => {
                switch (topic.toLowerCase()){
                    case "settings":
                        AoPS.Ui.Modal.show({
                            title: "AoPS Enhanced Settings - Community",
                            body: `<p>The "Community" header contains the following settings for the community:
                        <h4>Enhanced Quotes</h4>Enhanced Quotes are a new type of advanced quote. You can<br>choose to enable/disable them, use tips with the user's avatar,<br>and if relative timestamps (today, tommorow, ect.) should be used.
                        <h4>Blocked Threads</h4>This setting will block all threads with the given names,on<br>all forums.
                        <h4>Custom Autotags</h4>This feature allows you to automatically add tags to a new<br>forum if the trigger text is in the first post.
                        <h4>Community Controls</h4>These allow you to disable or restrict certain parts of the<br>community, including the feed. You should use these if<br>you want to avoid getting distracted.</p>`,
                            frame_class: "aops-modal-standard",
                            closeX: false,
                            scrollable: false,
                            type: "alert",
                        }); break;
                    case "dark mode":
                        AoPS.Ui.Modal.show({
                            title: "AoPS Enhanced Settings - Dark Mode",
                            body: `<p>The "Dark Mode" header contains the following settings for the community:
                        <h4>Dark Mode</h4>Enables dark mode. This setting applies to all pages on the site.
                        <h4>Compatibility Mode</h4>Use compatibility mode of Dark Mode is not working.
                        <h4>Dark Mode Schedule</h4>This allows you to only use dark mode during certain customizable<br>hours.`,
                            frame_class: "aops-modal-standard",
                            closeX: false,
                            scrollable: false,
                            type: "alert",
                        }); break;
                    case "shortcuts":
                        AoPS.Ui.Modal.show({
                            title: "AoPS Enhanced Settings - Keyboard Shortcuts",
                            body: `<p>The "Keyboard Shortcuts" header allows you to set keyboard shortcuts to make doing certain<br>tasks in the community. Leave blank if you do not want to use them.`,
                            frame_class: "aops-modal-standard",
                            closeX: false,
                            scrollable: false,
                            type: "alert",
                        }); break;
                }
            };
            document.getElementById("enhancedcustomautotag").value=localStorage.getItem("customautotags");
            document.getElementById("darktheme").checked=JSON.parse(localStorage.getItem("darktheme"));
            document.getElementById("darkthemecompat").checked=JSON.parse(localStorage.getItem("darkthemecompat"));
            document.getElementById("darkontimer").checked=JSON.parse(localStorage.getItem("darkontimer"));
            document.getElementById("darkstart").value=JSON.parse(localStorage.getItem("darkstart"));
            document.getElementById("cmty-block").checked=JSON.parse(localStorage.getItem("cmty-block"));
            document.getElementById("darkend").value=JSON.parse(localStorage.getItem("darkend"));
            document.getElementById("blockedthreads").value=localStorage.getItem("blockedthreads");
            document.getElementById("enhancedquote").checked=JSON.parse(localStorage.getItem("enhancedquote"));
            document.getElementById("enhancedquotetip").checked=JSON.parse(localStorage.getItem("enhancedquotetip"));
            document.getElementById("enhancedquotetime").checked=JSON.parse(localStorage.getItem("enhancedquotetime"));
            document.getElementById("shortcuts-quickrep").value=JSON.parse(localStorage.getItem("shortcuts-quickrep"));
            document.getElementById("shortcuts-scrollup").value=JSON.parse(localStorage.getItem("shortcuts-scrollup"));
            document.getElementById("shortcuts-scrolldown").value=JSON.parse(localStorage.getItem("shortcuts-scrolldown"));
        } else if (location.pathname == '/enhanced/backup/clear' || location.pathname == '/enhanced/backup/clear/'){
            document.title="Clear Backup | AoPS Enhanced";
            window.clearBackup = () => {
                let t = $("#time")[0].value;
                if (t == "") t = "1";
                let time = parseInt(t) * ({"Seconds":1000,"Minutes":60000,"Hours":3600000,"Days":86400000,"Weeks":604800000,"Months":2592000000,"Years":31536000000})[$("#unit")[0].value];
                alert(time);
                localStorage.removeItem("Enhanced");
                localStorage.setItem("backupClearTime", Date.now() + time);
                $(".aops-panel")[0].innerHTML = "<h3>Backup Cleared!</h3>";
            };
            window.clearBackupAlert = () =>{
                AoPS.Enhanced.UI.alert("Are you sure you want<br>to clear the backup?", {"No": {}, "Yes": {type: "danger", f: window.clearBackup}});
            };
            $('#main-column-standard')[0].innerHTML=`<h1>Clear Backup | <a href='/enhanced' style="color:#1b365d;">AoPS Enhanced</a></h1>
            <div class="aops-panel">
                <h2>Clear Backup</h2>
                <p>Are you sure you want to clear the backup? If you do, AoPS Enhanced will not be able to run if there is an error.</p>
                <p>If you click "Clear Backup", you will only get one confirmation box before the backup is deleted.</p>
                <p style="color:red;">IF YOU DO NOT WANT TO CLEAR THE BACKUP, LEAVE THIS PAGE IMMEDIATELY.</p><br>
                <label><input type="number" id="time" class="form-control" style="display:unset;width:15%;height:25px;padding:0px 2px;font-size:16px;color:black;" onkeydown="javascript: return ['Backspace','Delete','ArrowLeft','ArrowRight'].includes(event.code) ? true : !isNaN(Number(event.key)) && event.code!=='Space'" placeholder="1"><select id="unit"><option>Seconds</option><option>Minutes</option><option>Hours</option><option selected>Days</option><option>Weeks</option><option>Months</option><option>Years</option></select> How long do you want to clear the backup for?</label><br>
                <button class="aops-modal-btn btn btn-danger" onclick='window.clearBackupAlert();'>Clear Backup</button>
            </div>
<style>
input[type=number], input[type=number]:focus{
    outline: none;
    border: 1px solid black;
}
</style>`;
        } else if (location.pathname == '/enhanced/backup/edit' || location.pathname == '/enhanced/backup/edit'){
            document.title="Edit Backup | AoPS Enhanced";
        }
    });

    //Backup
    if (localStorage.getItem("backupClearTime") == null) localStorage.setItem("backupClearTime", 0);
}

AoPS.Enhanced();
if(Date.now() > parseInt(localStorage.getItem("backupClearTime"))) try{localStorage.setItem("EnhancedBeta", AoPS.Enhanced);}catch(e){};
