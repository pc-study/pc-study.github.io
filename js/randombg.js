var backimg=["url(/img/bg1.JPG)","url(/img/bg2.JPG)","url(/img/bg3.JPG)","url(/img/bg4.JPG)","url(/img/bg5.JPG)","url(/img/bg6.JPG)","url(/img/bg7.JPG)"],bgindex=Math.floor(Math.random()*backimg.length);document.getElementById("web_bg").style.backgroundImage=backimg[bgindex];var bannerimg=["url(/img/bg1.JPG)","url(/img/bg2.JPG)","url(/img/bg3.JPG)","url(/img/bg4.JPG)","url(/img/bg5.JPG)","url(/img/bg6.JPG)","url(/img/bg7.JPG)"],bannerindex=Math.floor(Math.random()*bannerimg.length);document.getElementById("page-header").style.backgroundImage=bannerimg[bannerindex];