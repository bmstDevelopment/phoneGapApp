 //This function runs once the page is loaded, but appMobi is not yet active */
            //$.ui.animateHeaders=false;
             var search=document.location.search.toLowerCase().replace("?","");
             //if(!search)
                //$.os.useOSThemes=false;
                
            if(search) //Android fix has too many buggy issues on iOS - can't preview with $.os.android
            {

               $.os.useOSThemes=true;
                if(search=="win8")
                    $.os.ie=true;
                $.ui.ready(function(){
                    $("#afui").get(0).className=search;
                });
            }
            
            var webRoot = "./";
            // $.os.android=true;
            $.ui.autoLaunch = false;
            $.ui.openLinksNewTab = false;
            //$.ui.resetScrollers=false;
            

           $(document).ready(function(){
               
                  $.ui.launch();

            });
             /* This code is used to run as soon as appMobi activates */
            var onDeviceReady = function () {
                AppMobi.device.setRotateOrientation("portrait");
                AppMobi.device.setAutoRotate(false);
                webRoot = AppMobi.webRoot + "";
                //hide splash screen
                AppMobi.device.hideSplashScreen();
                $.ui.blockPageScroll(); //block the page from scrolling at the header/footer
                $.ui.launch();

            };
            document.addEventListener("intel.xdk.device.ready", onDeviceReady, false);

            function showHide(obj, objToHide) {
                var el = $("#" + objToHide)[0];

                if (obj.className == "expanded") {
                    obj.className = "collapsed";
                } else {
                    obj.className = "expanded";
                }
               
                $(el).toggle();
            }


            if($.os.android||$.os.ie||search=="android"){
                $.ui.ready(function(){
                    $("#main .list").append("<li><a id='toggleAndroidTheme'>Toggle Theme Color</a></li>");
                    var $el=$("#afui");
                    $("#toggleAndroidTheme").bind("click",function(e){
                        if($el.hasClass("light"))
                            $el.removeClass("light");
                        else
                            $el.addClass("light");
                    });
                });
            }
            //触摸
            if (!((window.DocumentTouch && document instanceof DocumentTouch) || 'ontouchstart' in window)) {
                var script = document.createElement("script");
                script.src = "plugins/af.desktopBrowsers.js";
                var tag = $("head").append(script);
            }
        
           /* $.ui.autoLaunch=false;
            $.ui.useOSThemes=false;
            $.ui.blockPageScroll();

            $(document).ready(function(){
                if($.ui.useOSThemes&&!$.os.ios&&$("#afui").get(0).className!=="ios")
                $("#afui").removeClass("ios");//去除ios样式
                
                
             
            });*/