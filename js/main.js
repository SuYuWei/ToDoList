$(document).ready(function(){

	var	firebaseConfig = {
		apiKey: "AIzaSyD7xsV-3ddqrc7RMZ9ItX2K4s_iPB5jDfM",
		authDomain: "todolist-b356c.firebaseapp.com",
		databaseURL: "https://todolist-b356c.firebaseio.com",
		storageBucket: "todolist-b356c.appspot.com",
		messagingSenderId: "930760113299"
	};

	firebase.initializeApp(firebaseConfig);

	window.onload = function() {

		window.todolist = new todolist();
	};

	function todolist(){

		this.main = $("#main");
		this.listContent = $(".listContent");
		this.historyContent = $(".historyContent");
		this.loginContent = $("#loginContent");

		this.listSum = 0;
		this.checkSum = 0;
		this.checkedArr = [];

		this.main.on("click",".login",function(){
			this.loginContent.show();
		}).end().on("click",".logout",function(){
			this.logoutUI();
			this.signOut();
		}).end().on("click",".close",function(){
			this.loginContent.hide();
		});

		this.loginContent.on("click",".loginBtn",this.signInEmailAndPassword).end()
		.on("click",".googleBtn",this.signInGoogle).end()
		.on("click",".facebookBtn",this.signInFacebook);

		this.initFirebase();
	}

	todolist.prototype.initFirebase = function() {
		this.auth = firebase.auth();
		this.database = firebase.database();
		this.databaseRef = this.database.ref();
		this.storage = firebase.storage();
		this.storageRef = this.storage.ref();

		this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
	};

	todolist.prototype.signInEmailAndPassword = function() {
		var email = $("input[name=\"email\"]").val();
		var password = $("input[name=\"psw\"]").val();
		this.auth.signInWithEmailAndPassword(email,password).catch(function(e){
			alert(e.message);
		});
	}

	todolist.prototype.signInGoogle = function() {
		var provider = new firebase.auth.GoogleAuthProvider();
		this.auth.signInWithPopup(provider);
	}

	todolist.prototype.signInFacebook = function() {
		var provider = new firebase.auth.FacebookAuthProvider();
		this.auth.signInWithPopup(provider);
	}

	todolist.prototype.signOut = function() {
		this.auth.auth.signOut();
	}

	todolist.prototype.onAuthStateChanged = function(user) {
		if(user) {
			this.loginUI();
			var userName = user.providerData[0].displayName;
			var photoURL = user.providerData[0].photoURL || "img/user.png";
			$(".userName").text(userName);
			$(".userAvatar").attr("src",photoURL);
			this.loadlists(user.uid);
		}else {
			this.logoutUI();
		}
	}

	todolist.prototype.loadlists = function(uid){
		this.databaseRef = this.database.ref('users/' + uid + '/lists/');
		this.databaseRef.off();

		// databaseRef.on('value',function(data){
		// });

		this.databaseRef.on('child_added',function(data){
			var addList = data.val();
			if(addList.complete){
				this.historyItemMake(data.key, addList.desc, addList.time);
			}else{
				this.listItemMake(data.key, addList.desc, addList.time);
				this.listSum++;
			}
			count();
		});

		this.databaseRef.on('child_changed',function(data){
			var updateList = data.val();
			$(".list-item[data-lid=\""+ data.key +"\"]").find(".check-text").html(updateList.desc);
			if(updateList.complete){
				$(".list-item[data-lid=\""+ data.key +"\"]").remove();
				this.historyItemMake(data.key, updateList.desc, updateList.time);
			}
		});

		this.databaseRef.on('child_removed',function(data){
			$(".list-item[data-lid=\""+ data.key +"\"]").remove();
		});

	}

	todolist.prototype.loginUI = function() {
		this.main.find(".userContent").show();
		this.main.find(".logBtn").addClass("logout").removeClass("login").text("logout");
		this.listContent.find(".inputText").show();
		this.loginContent.hide();
		this.main.find(".noListContent").hide();
	}

	todolist.prototype.logoutUI = function() {
		this.main.find(".userContent").hide();
		this.main.find(".logBtn").addClass("login").text("login");
		this.listContent.find(".inputText").hide();
		this.listContent.find(".list-item").remove();
		this.historyContent.find(".history-item").remove();
		this.main.find(".noListContent").show();
		this.listSum = 0;
		this.checkSum = 0;
		this.count();
	}


	todolist.prototype.listItemMake = function(listId, desc, time){
		var listItem = "<div class=\"list-item\" data-lid=\""+ listId +"\">"+
								"<div class=\"box-content\">"+
					                "<input id=\""+listId+"\" type=\"checkbox\">"+
					                "<label for=\""+listId+"\" class=\"check-btn\"></label>"+
					                "<div class=\"check-text\" contenteditable=\"true\">"+ desc +"</div>"+
					                "<div class=\"cancel-btn\"></div>"+
				                "</div>"+
				                "<div class=\"check-time\">"+ dateFormat(time) +"</div>"+
				            "</div>";
     	this.listContent.append($(listItem).fadeIn(500));
	}

	todolist.prototype.historyItemMake = function(listId, desc, time){
		var historyItem = "<div class=\"history-item\" data-lid=\""+ listId +"\">"+
					            "<div class=\"history-text\">"+ desc +"</div>"+
				                "<div class=\"history-time\">"+ dateFormat(time) +"</div>"+
				            "</div>";
		this.historyContent.append($(historyItem));
	}

	todolist.prototype.getListData = function(key){
		this.databaseRef.child(key).once('value',function(data){
			var listData = data.val();
			$(".list-item[data-lid=\""+ data.key +"\"]").find(".check-text").html(listData.desc);
		});
	}

	todolist.prototype.addListData = function(description, time, status) {
		this.databaseRef.push({
			desc: description,
			time: time,
			complete: status
		});
	}

	todolist.prototype.updateListData = function(key, obj){
		this.databaseRef.child(key).update(obj);
	}

	todolist.prototype.removeListData = function(key){
		this.databaseRef.child(key).remove();
	}

	//印出List數 & 選中數
	todolist.prototype.count = function(history){
		$(".listCount").html(this.listSum + " list");
		$(".checkCount").html("checked: " + this.checkSum);
		if(this.checkSum > 0){
        	$(".clearBtn").show();
        }else{
        	$(".clearBtn").hide();
        }
	}

	function dateFormat(milliseconds){
		var d = new Date(milliseconds);
		var year = d.getFullYear();
		var month = d.getMonth()+1;
		var day = d.getDate();
		var hour = d.getHours();
		var min = d.getMinutes();
		var sec = d.getSeconds();
		if(hour < 10) hour = "0"+hour;
		if(min < 10) min = "0"+min;
		if(sec < 10) sec = "0"+sec;
		return year+"/"+month+"/"+day+" "+hour+":"+min+":"+sec;
	}

});