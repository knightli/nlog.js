/**
 * @description 一个和badjs后端对接的前端错误上报脚本, 支持console关联上报.
 * @author knightli
 */

(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['nlog'] = factory();
    }

}(this, function () {

    var consoleLv = {
        'debug':1,
        'info':2,
        'warn':4,
        'error':8
    };

    var orgiConsole = {};

    for(var p in consoleLv){
        orgiConsole[p] = window.console[p];
    }

    var _config = {
        shutdown:true,
        bid: 102,
        onerror:{
            mid: 195375
        },
        bindConsole:true,
        logLv:4,
        console: {
            'debug':{},
            'info':{},
            'warn':{},
            'error':{}
        }
    };

    var getBrowserInfo = (function(){
        var _info;

        return function(){
            if(!_info){
                _info = ((window['Simple']||{}).browser||{}).info;
                if(!_info){
                    _info = { type: "" };
                    var ua = navigator.userAgent.toLowerCase();
                    if ( /webkit/.test( ua ) ) {
                        _info = { type: "webkit", version: /webkit[\/ ]([\w.]+)/ };
                    } else if ( /opera/.test( ua ) ) {
                        _info = { type: "opera", version:  /version/.test( ua ) ? /version[\/ ]([\w.]+)/ : /opera[\/ ]([\w.]+)/ };
                    } else if ( /msie/.test( ua ) ) {
                        _info = { type: "msie", version: /msie ([\w.]+)/ };
                    } else if ( /mozilla/.test( ua ) && !/compatible/.test( ua ) ) {
                        _info = { type: "ff", version: /rv:([\w.]+)/ };
                    }
                    _info.version = (_info.version && _info.version.exec( ua ) || [0, "0"])[1];
                }
            }
            return _info;
        };
    })();

    var cgi_js_report = function(bid, level, msg, mid){
        var arr = [];
        arr.push('bid='+bid);
        arr.push('level='+level);
        arr.push('msg='+msg);
        if(mid) arr.push('mid='+mid);
        arr.push('r='+Math.random());

        var params = arr.join('&');

        var endPoint;

        if(!_config.shutdown && _config.endPoint){
            endPoint = _config.endPoint;
        }
        else{
            //console.log('js_report:'+params);//注意, 只有console.log没被覆写, 所以建议这里只用console.log
            endPoint = '/cgi-bin-dev/badjs_mock/js_report';
        }

        var url = endPoint+'?'+params;

        var img = new Image();
        img.src = url;
        img = null;

    };

    var get_msg = function(content,url,line){
        var arr = [];
        arr.push(content);
        arr.push(encodeURIComponent(url));
        arr.push(line);

        var binfo = getBrowserInfo();
        if(binfo){
            arr.push(
                'browser:['+
                ['type:'+binfo.type,'ver:'+binfo.version].join(',') +
                ']'
            );
        }

        return arr.join('|_|');
    };

    var bindOnError = function(){

        window.onerror = function(content, url, line){

            var msg = get_msg('Script Error:'+content, url, line);

            var bid = _config.bid;
            var mid = _config.onerror.mid;

            cgi_js_report(bid, 4, msg, mid);
        };

    };

    var makeConsoleFn = function(p){

        return function(){

            orgiConsole[p].apply(this,arguments);

            var p_lv = consoleLv[p];
            var log_lv = _config.logLv;

            var log_flag = p_lv>0 && p_lv>=log_lv;//当配置的logLv大于等于对应的console级别时,才会上报nlog
            var content = arguments[0];
            if(typeof content==='object'){
                var text, hasErr;
                try{
                    text = JSON.stringify(content);
                }catch(e){
                    hasErr = true;
                }
                if(!hasErr){
                    content = text;
                }
            }

            //有一种例外是配置中设置了一个正则表达式, 若
            if(!log_flag && _config.console[p].reg){

                var reg = _config.console[p].reg;

                for(var i=0,len=reg.length; i<len; i++){

                    if(content.test(reg[i])){
                        log_flag = true;
                        break;
                    }

                }
            }

            if(log_flag){

                var msg = get_msg('LOG('+p+')['+content+']', window.location.href, 0);
                var bid = _config.bid;
                var mid = _config.console[p].mid;

                cgi_js_report(bid, p_lv, msg, mid);
            }
        };
    };


    var bindConsole = function(){

        for(var p in consoleLv){

            window.console[p] = makeConsoleFn(p);

        }
    };

    var nlog = function(content, opt){

        var level;
        if('level' in opt){
            level = opt.level;
        }
        else if('type' in opt){
            level = consoleLv[opt.type];
        }

        opt.level = level || 2;

        opt = $.extend({'bid':_config.bid},opt);

        var url = opt.url || window.location.href;

        var msg = get_msg('LOG['+content+']', url , 0);

        var bid = opt.bid;
        var mid = opt.mid;

        cgi_js_report(bid, level, msg, mid);
    };

    nlog.init = function(config){

        config = config || {};
        $.extend(_config,config);

        bindOnError();

        if(_config.bindConsole){

            bindConsole();

        }

    };

    return nlog;

}));
