$(document).ready(function(){

	var listSum = 0,
		checkSum = 0,
		listContent = $(".list-content"),
		checkedArr = [],
		firebaseConfig = {
			apiKey: "AIzaSyD7xsV-3ddqrc7RMZ9ItX2K4s_iPB5jDfM",
			authDomain: "todolist-b356c.firebaseapp.com",
			databaseURL: "https://todolist-b356c.firebaseio.com",
			storageBucket: "todolist-b356c.appspot.com",
			messagingSenderId: "930760113299"
		},
		uid = "SuYuWei";

	firebase.initializeApp(firebaseConfig);
	
	var database = firebase.database(),
		commentsRef = database.ref('users/' + uid + '/');

	// commentsRef.on('value',function(data){
	// });

	commentsRef.orderByChild("time").on('child_added',function(data){
		var addList = data.val();
		if(!addList.status){
			listContentMake(data.key, addList.desc, addList.time);
			listSum++;
		}
		count();
	});

	commentsRef.on('child_changed',function(data){
		var updateList = data.val();
		$(".list-item[data-lid=\""+ data.key +"\"]").find(".check-text").html(updateList.desc);
	});

	commentsRef.on('child_removed',function(data){
		$(".list-item[data-lid=\""+ data.key +"\"]").remove();
	});

	$(".input-text").on("keypress blur",function(e) {
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
        if(checkSum > 0){
        	$(".clear-btn").show();
        }else{
        	$(".clear-btn").hide();
        }
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

	//刪除選中list
	$(".clear-btn").on("click",function(){
		$("input[type=\"checkbox\"]:checked").parent().parent().remove();
		$.each(checkedArr, function(index, val) {
			updateListData(val,{status: true});
		});
		listSum = listSum - checkSum;
		checkSum = 0;
		count();
		$(this).hide();
	});

	function listContentMake(listId, desc, time){
		var listHtml = "<div class=\"list-item\" data-lid=\""+ listId +"\">"+
								"<div class=\"box-content\">"+
					                "<input id=\""+listId+"\" type=\"checkbox\">"+
					                "<label for=\""+listId+"\" class=\"check-btn\"></label>"+
					                "<div class=\"check-text\" contenteditable=\"true\">"+ desc +"</div>"+
					                "<div class=\"cancel-btn\"></div>"+
				                "</div>"+
				                "<div class=\"check-time\">"+ dateFormat(time) +"</div>"+
				            "</div>";
     	listContent.append($(listHtml).fadeIn(500));
	}

	function getListData(key){
		database.ref('users/' + uid + '/' + key).on('value',function(data){
			console.log("asdsadsa");
			var listData = data.val();
			$(".list-item[data-lid=\""+ data.key +"\"]").find(".check-text").html(listData.desc);
		});
	}

	function addListData(description, time, status) {
		commentsRef.push({
			desc: description,
			time: time,
			status: status
		});
	}

	function updateListData(key, obj){
		database.ref('users/' + uid + '/' + key).update(obj);
	}

	function removeListData(key){
		database.ref('users/' + uid + '/' + key).remove();
	}

	//印出List數 & 選中數
	function count(){
		$(".list-count").html(listSum + " list");
		$(".check-count").html("checked: " + checkSum);
		if(listSum > 0){
			listContent.removeClass("no-list");
		}else{
			listContent.addClass("no-list");
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