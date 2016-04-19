(function(){
	Object.prototype.$ = function $(x){
		var that = this==window?document:this;
		return Array.prototype.slice.call(that.querySelectorAll(x),0);
	}

	function addEvent(event, callback, tar){
		var obj = tar?tar:window;
		if(event == "mousewheel" || event == "DOMMouseScroll"){
			if(isFireFox) event = "DOMMouseScroll";
		}
	    if(window.addEventListener) 
	        obj.addEventListener(event, callback);
	    else if(window.attachEvent)
	        obj.attachEvent("on"+event, callback);
	    else obj["on"+event]=callback;
	}

	var _prefix = (function(tmp){
		var prefix = ["webkit","Moz","o","ms"];
		var ret = "";
		for(var i in prefix){
			ret = prefix[i]+"Transition";
			if(tmp.style[ret] != undefined)
				return "-" + prefix[i].toLowerCase() + "-";
		}
		return false;
	})(document.createElement(Scroll));

	var isFireFox = (function(){
		if(navigator.userAgent.toLowerCase().indexOf("firefox") < 0) return false;
		return true;
	})();


	var Scroll = (function(){
		function Scroll(item){
			console.log(this);
			this.setting = Object.prototype.Scroll.Default;
			this.ele = item;
			this.init();
			this.lock = false;
			this.stop = false;
		};

		Scroll.prototype = {
			init: function(){
				this.wrapper = this.ele.$(this.setting.selector.wrapper)[0];

				this.wrapper.style.top="-100%";
				this.item = this.ele.$(this.setting.selector.item);
				this.imgCount = this.imgCount();
				this.index = this.setting.index?(this.setting.index<this.imgCount?this.setting.index:this.imgCount-1):0;
				this.direction = this.setting.direction == "vertical" ? 1 : 0;

				this._initPage();
				this._initEvent(); 
			},

			imgCount: function(){
				return this.item.length;
			},

			_initPage: function(){

				var pageclass = this.setting.selector.page.substring(1);
				var activeclass = this.setting.selector.active.substring(1);
				var activeindex = this.index;
				var html = "";
				var dom = document.createElement("div");
				
				dom.className = pageclass;

				for(var i=0;i<this.imgCount;i++){
					if(i==this.index)
						html+="<span class='"+activeclass+"' data-index="+i+">";
					else html += "<span data-index="+i+">";
					html+=i+1+"</span>";
				}
				
				dom.innerHTML = html;
				this.ele.appendChild(dom);

				this.page = this.ele.$("."+pageclass + " span");
				this.wrapper.style.cssText = _prefix + "transition: all " + this.setting.transTime + "ms " + this.setting.easing;
			},

			_doScroll: function(){
				var dest = "-"+this.index*100+ "%";
				if(this.direction){
					this.wrapper.style.cssText += "top:" + dest;
				}else{
					this.wrapper.style.cssText += "left:" + dest;
				}
				var page = this.page;
				for(var i=0;i<page.length;i++){
					page[i].className = "";
				}
				page[this.index].className = "active";
			},

			_prevImg: function(){
				this.index--;
				
				if(this.index < 0)
					this.index = this.imgCount - 1;
				this._doScroll();
			},

			_nextImg: function(){
				this.index++;
				if(this.index >= this.imgCount)
					this.index = 0;
				this._doScroll();
			},

			_roundPlay: function(ele){

				return function(){
					if(!ele.stop) ele._nextImg();
					setTimeout(ele._roundPlay(ele), ele.setting.timeduration);
				};
			},

			_initEvent: function(){
				var that = this;
				that.ele.onclick = function(event){
					event = event || window.event;
					var tar = event.target;
					if(tar.tagName.toLowerCase() == "span"){
						that.index = parseInt(tar.getAttribute("data-index"));
						that._doScroll();
					}
				}
				
				addEvent("mousewheel",function(event){
					event = event || window.event;

					if(that.lock) return;
					var delta = event.detail || -event.wheelDelta;

					that.lock = true;
					if(delta > 0) that._prevImg();
					else if(delta < 0) that._nextImg();
					that.lock = false;
				},that.ele);

				addEvent("mouseenter",function(){
					that.stop = true;
				},that.ele);
				
				addEvent("mouseleave", function(){
					that.stop = false;
				}, that.ele);

				setTimeout(that._roundPlay(that), that.setting.timeduration);
			}
		}
		return Scroll;
	})();

	Object.prototype.Scroll = function(option){
		return this.forEach(function(item){
			var data =item.data;
			if(!data) item.data = new Scroll(item);
			else console.log(item);
			return data;
		});
	};
	Object.prototype.Scroll.Default = {
		selector:{
			active: ".active",
			wrapper: ".box",
			page: ".btn",
			item: ".item"
		},
		index: 0,
		transTime: 400,
		timeduration: 6000,
		loop: true,
		easing: "linear",
		direction: "vertical",
		keyboard: true,
		callback: ""
	}

})();

