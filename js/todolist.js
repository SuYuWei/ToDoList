$(document).ready(function(){

	var sum = 0; 
	var check_sum = 0;
	$(".clear_btn").hide();
	
	$("#in_list").keypress(function(event) {
		var text = $(this).val();
		if(event.keyCode==13){
			if($(this).val()==''){
				alert("please write a list");
			}else{
				$("#list").append("<li><div class='view'><input class='check' type='checkbox'><label>"+text+"</label><a class='btn'></a></div><div class='edit'><input type='text'></div></li>");
				$(this).val('');	
				sum++	
				count();
				$(".edit").hide();
			}
		}	
	});

	//checkbox選中
	$("ul").on('change','.check',function(){
		if($(this).is(":checked")) {
		   $(".clear_btn").show();
           $(this).next().css({'text-decoration':'line-through','color':'gray'});
           check_sum++;
           count();
        }else{
        	$(this).next().css({'text-decoration':'none','color':'black'});
        	check_sum--;
            count();
        }
	});

	//雙擊編輯list
	$("ul").on('dblclick','.view',function(){
		//$(this).siblings().children().focus();
		$(this).siblings().show();
		$(this).hide();
		$(this).siblings().children().val($(this).children("label").text());

			$($(this).siblings().children()).keypress(function(event) {
			if(event.keyCode==13){
				$(this).parent().hide();
				$(this).parent().siblings().show();
				$(this).parent().siblings().children("label").text($(this).val());
			}	
		});
			$($(this).siblings().children()).focusout(function() {
				$(this).parent().hide();
				$(this).parent().siblings().show();
				$(this).parent().siblings().children("label").text($(this).val());
		});
	});

	//刪除list
	$("ul").on('click','.btn',function(){
		console.log($(this).parent().parent());
		$(this).parent().parent().remove();
		sum--;
		if($(this).siblings().is(":checked")){
			check_sum--;
		}
		count();
	});

	//刪除選中list
	$(".clear_btn").click(function(){
		$(".clear_btn").hide();
		if($(".check").is(":checked")){
			$(".check:checked").parent().parent().remove();
			sum = sum - check_sum;
			check_sum=0;
			count();
		}
	});

	//計算List數 & 選中數
	function count(){
		$(".count").text(sum + " left");
		$(".check_count").text("checked: " + check_sum);
	}

});
