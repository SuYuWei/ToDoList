$(document).ready(function(){

	var listSum = 0,
		checkSum = 0,
		main = $("#main"),
		loginContent = $("#loginContent"),
		listContent = $(".listContent"),
		historyContent = $(".historyContent"),
		checkedArr = [];

	var	firebaseConfig = {
		apiKey: "AIzaSyD7xsV-3ddqrc7RMZ9ItX2K4s_iPB5jDfM",
		authDomain: "todolist-b356c.firebaseapp.com",
		databaseURL: "https://todolist-b356c.firebaseio.com",
		storageBucket: "todolist-b356c.appspot.com",
		messagingSenderId: "930760113299"
	};

	firebase.initializeApp(firebaseConfig);

	var auth = firebase.auth(),
		database = firebase.database(),	//初始化DB
		databaseRef = database.ref(),
		storage = firebase.storage(),
		storageRef = storage.ref();

	auth.onAuthStateChanged(function(user) {
		if(user) {
			loginUI();
			var userName = user.providerData[0].displayName;
			var photoURL = user.providerData[0].photoURL || "img/user.png";
			$(".userName").text(userName);
			$(".userAvatar").attr("src",photoURL);
			loadlists(user.uid);
		}else {
			logoutUI();
		}
	});

	main.on("click",".login",function(){
		loginContent.show();
	});

	main.on("click",".logout",function(){
		logoutUI();
		auth.signOut();
	});

	$(".close").on("click",function(){
		loginContent.hide();
	});

	loginContent.on("click",".loginBtn",function(){
		var email = $("input[name=\"email\"]").val();
		var password = $("input[name=\"psw\"]").val();
		auth.signInWithEmailAndPassword(email,password).catch(function(e){
			alert(e.message);
		});
	});

	loginContent.on("click",".googleBtn",function(){
		var provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	});

	loginContent.on("click",".facebookBtn",function(){
		var provider = new firebase.auth.FacebookAuthProvider();
		auth.signInWithPopup(provider);
	});

	$(".tabItem").click(function(){
		var tabId = $(this).data("tab");
		$(".tabItem").removeClass('active');
		$(this).addClass('active');
		$(".tab-content").hide();
		$("."+tabId).show();
	});

	function logoutUI() {
		main.find(".userContent").hide();
		main.find(".logBtn").addClass("login").text("login");
		listContent.find(".inputText").hide();
		listContent.find(".list-item").remove();
		historyContent.find(".history-item").remove();
		main.find(".noListContent").show();
		listSum = 0;
		checkSum = 0;
		count();
	}

	function loginUI() {
		main.find(".userContent").show();
		main.find(".logBtn").addClass("logout").removeClass("login").text("logout");
		listContent.find(".inputText").show();
		loginContent.hide();
		main.find(".noListContent").hide();
	}

	function loadlists(uid){
		databaseRef = database.ref('users/' + uid + '/lists/');
		databaseRef.off();

		// databaseRef.on('value',function(data){
		// });

		databaseRef.on('child_added',function(data){
			var addList = data.val();
			if(addList.complete){
				historyItemMake(data.key, addList.desc, addList.time);
			}else{
				listItemMake(data.key, addList.desc, addList.time);
				listSum++;
			}
			count();
		});

		databaseRef.on('child_changed',function(data){
			var updateList = data.val();
			$(".list-item[data-lid=\""+ data.key +"\"]").find(".check-text").html(updateList.desc);
			if(updateList.complete){
				$(".list-item[data-lid=\""+ data.key +"\"]").remove();
				historyItemMake(data.key, updateList.desc, updateList.time);
			}
		});

		databaseRef.on('child_removed',function(data){
			$(".list-item[data-lid=\""+ data.key +"\"]").remove();
		});

		// var myConnectionsRef = firebase.database().ref('users/'+ uid +'/connections');
		// var lastOnlineRef = firebase.database().ref('users/'+ uid +'/lastOnline');

		// database.ref(".info/connected").on("value",function(connect){
		// 	if(connect.val()){
		// 		// ...連線
		// 		var con = myConnectionsRef.push(true);
		// 		con.onDisconnect().remove();
		// 		lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
		// 	}else{
		// 		// ...離線
		// 	}
		// });
	}

	listContent.find(".inputText").on("keypress blur",function(e) {
		var desc = $(this).html();
		var time = new Date().getTime();
		if(e.keyCode == 13 && !e.shiftKey){
			e.preventDefault();
			if(desc == '')	return false;
			addListData(desc, time, false);
			$(this).html('').blur();
		} else if(e.type == "blur" || e.type == "focusout"){
			$(this).html('');
			return false;
		}
	});

	listContent.on("keypress blur",".check-text",function(e){
		var desc = $(this).html();
		var listId = $(this).parent().parent().data("lid");
		if((e.keyCode == 13 && !e.shiftKey)){
			e.preventDefault();
			if(desc == ''){
				getListData(listId);
				$(this).blur();
				return false;
			}
			updateListData(listId, {desc: desc});
			$(this).blur();
		}else if(e.type == "blur" || e.type == "focusout"){
			getListData(listId);
			return false;
		}
	});

	$(".uploadBtn").off("click").click(function() {
		$(".fileUpload").trigger('click');
	});

	$(".fileUpload").change(function() {
		var fileOri = $(this);
		var imageType = /image.*/;

		$.each(fileOri[0].files, function (i, file){
			var metadata = {
				contentType: file.type
			};
			if (metadata.contentType.match(imageType)){
				var reader = new FileReader();
					reader.onload = function (e) {
						var img = new Image(50,50);
						img.src = reader.result;
						$(".inputText").html(img);
					}
				reader.readAsDataURL(file);
				// uploadFile(file,metadata);
			}
		});

		fileOri.replaceWith(fileOri.val('').clone(true));
	});

	$(document).on("paste","div[contentEditable=true]",function(e){
 		e.preventDefault();
		document.execCommand('insertHTML', false, e.originalEvent.clipboardData.getData('text'));
 	})

	//checkbox選中
	listContent.on('change','input[type="checkbox"]',function(){
		var listId = $(this).parent().parent().data("lid")
		if($(this).is(":checked")) {
			checkedArr.push(listId);
          	$(this).siblings(".check-text").css({'text-decoration':'line-through','color':'#ccc'});
           	checkSum++;
        }else{
        	var index = checkedArr.indexOf(listId);
        	if (index > -1) {
			    checkedArr.splice(index, 1);
			}
        	$(this).siblings(".check-text").css({'text-decoration':'none','color':'black'});
        	checkSum--;
            
        }
        count();
	});

	//刪除list
	listContent.on('click','.cancel-btn',function(){
		var listId = $(this).parent().parent().data("lid");
		removeListData(listId);
		listSum--;
		if($(this).siblings("input[type=\"checkbox\"]").is(":checked")){
			checkSum--;
		}
		count();
	});

	//完成選中list送出
	$(".clearBtn").on("click",function(){
		$.each(checkedArr, function(index, val) {
			updateListData(val,{complete: true});
		});
		checkedArr = [];
		listSum = listSum - checkSum;
		checkSum = 0;
		count();
		$(this).hide();
	});

	function listItemMake(listId, desc, time){
		var listItem = "<div class=\"list-item\" data-lid=\""+ listId +"\">"+
								"<div class=\"box-content\">"+
					                "<input id=\""+listId+"\" type=\"checkbox\">"+
					                "<label for=\""+listId+"\" class=\"check-btn\"></label>"+
					                "<div class=\"check-text\" contenteditable=\"true\">"+ desc +"</div>"+
					                "<div class=\"cancel-btn\"></div>"+
				                "</div>"+
				                "<div class=\"check-time\">"+ dateFormat(time) +"</div>"+
				            "</div>";
     	listContent.append($(listItem).fadeIn(500));
	}

	function historyItemMake(listId, desc, time){
		var historyItem = "<div class=\"history-item\" data-lid=\""+ listId +"\">"+
					            "<div class=\"history-text\">"+ desc +"</div>"+
				                "<div class=\"history-time\">"+ dateFormat(time) +"</div>"+
				            "</div>";
		historyContent.append($(historyItem));
	}

	function getListData(key){
		databaseRef.child(key).once('value',function(data){
			var listData = data.val();
			$(".list-item[data-lid=\""+ data.key +"\"]").find(".check-text").html(listData.desc);
		});
	}

	function addListData(description, time, status) {
		databaseRef.push({
			desc: description,
			time: time,
			complete: status
		});
	}

	function updateListData(key, obj){
		databaseRef.child(key).update(obj);
	}

	function removeListData(key){
		databaseRef.child(key).remove();
	}

	function uploadFile(file, metadata){
		var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);
		uploadTask.on("state_changed",

			function progress(snapshot){
				var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				console.log(progress + "%");
				// switch(snapshot.state){
				// 	case "pause":
				// 		break;
				// 	case "runing":
				// 		break;
				// }
			},

			function error(error){
				console.log(error.code);
			},

			function complete(){
				var downloadURL = uploadTask.snapshot.downloadURL;
			}
		);
	}

	//印出List數 & 選中數
	function count(history){
		$(".listCount").html(listSum + " list");
		$(".checkCount").html("checked: " + checkSum);
		if(checkSum > 0){
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