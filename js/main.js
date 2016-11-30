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
	// var todolist = new todolist();

	function todolist(){
		this.header = $(".header");
		this.listContent = $(".listContent");
		this.listSum = 0;
		this.checkSum = 0;
		this.checkedArr = [];

		this.initFirebase();
	}

	todolist.prototype.initFirebase = function() {
		this.auth = firebase.auth();
		this.database = firebase.database();
		this.storage = firebase.storage();

		this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
	};

	todolist.prototype.signInGoogle = function() {
		var provider = new firebase.auth.GoogleAuthProvider();
		this.auth.signInWithPopup(provider);
	}

	todolist.prototype.signOut = function() {
		this.auth.auth.signOut();
	}

	todolist.prototype.onAuthStateChanged = function(user) {
		if(user) {
			var userName = user.providerData[0].displayName;
			var photoURL = user.providerData[0].photoURL || "img/nolist.png";
			$(".userName").text(userName);
			$(".userAvatar").attr("src",photoURL);
			this.loginState();
			this.loadLists();
		}else {
			this.logoutState();
		}
	}

	todolist.prototype.loadlists = function(){
		this.commentsRef = this.database.ref('users/' + user.uid + '/lists/');
		this.commentsRef.off();
		this.commentsRef.on('child_added',function(data){
			console.log("add");
			var addList = data.val();
			if(!addList.complete){
				listContentMake(data.key, addList.desc, addList.time);
				listSum++;
			}
			count();
		});
		this.commentsRef.on('child_changed',function(data){
			console.log("change");
			var updateList = data.val();
			$(".list-item[data-lid=\""+ data.key +"\"]").find(".check-text").html(updateList.desc);
			if(updateList.complete){
				$(".list-item[data-lid=\""+ data.key +"\"]").remove();
			}
		});

		this.commentsRef.on('child_removed',function(data){
			console.log("remove");
			$(".list-item[data-lid=\""+ data.key +"\"]").remove();
		});
	}

	todolist.prototype.logoutState = function() {
		header.find(".userContent").hide();
		header.find(".logBtn").addClass("login").text("login");
		$(".inputText").hide();
		$(".noListContent").show();
		$(".list-item").remove();
		listSum = 0;
		checkSum = 0;
		count();
	}

	todolist.prototype.loginState = function() {
		header.find(".userContent").show();
		header.find(".logBtn").addClass("logout").removeClass("login").text("logout");
		$(".inputText").show();
		$("#loginContent").hide();
		$(".noListContent").hide();
	}

});