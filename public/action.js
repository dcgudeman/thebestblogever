$(document).ready(function(){




	$('.showForm').on('click',function(e){
		// e.preventDefault();

		$(this).parent().find('.newPost').fadeToggle();
		/*$('.newPost').fadeToggle();*/
		$(this).parent().parent().find('.showForm').hide();

	});

	$('.cancelBtn').on('click',function(e){

		e.preventDefault();

		$(this).closest('.newPostDiv')

		$(this).parent().fadeToggle({complete: function(){

				$('.showForm').show();			
		}});
	});

	$('.cancelBtnComments').on('click',function(e){
		
		e.preventDefault();

		var commentDiv = $(this).closest(".comment");

		$(this).parent().fadeToggle({complete: function(){

				commentDiv.find('.showForm').show();			
		}});
	});


$('.deleteCommentBtn').parent().on('submit',function(event){

	event.preventDefault();
	var that = $(this);
	var id = that.find('.comment_id_class').val();
	
	$.ajax({
		type: "POST",
		dataType: "json",
		url: "/deleteCommentNew",
		data: { comment_id: id},
		success: function(res) {

			var commentDiv = that.closest(".comment");

			commentDiv.find('.commentContent').text(res.content).css({
   		'font-style': 'italic',
   		color: '#888'
		});
			commentDiv.find('.newPostDiv').hide();
			commentDiv.find('small').hide();

			console.log(res);
		},
		error: function(err) {
			console.log(err);
		}
	});
});



$('.editCommentBtn').parent().on('submit',function(event){

	event.preventDefault();
	var that = $(this);
	var id = that.find('.comment_id_class').val();
	var content = that.find('#content').val();
	
	$.ajax({
		type: "POST",
		dataType: "json",
		url: "/editCommentNew",
		data: { comment_id: id, comment_content: content},
		success: function(res) {

			var commentDiv = that.closest(".comment");

			commentDiv.find('.commentContent').text(res.content);

			that.fadeToggle({complete: function(){

				commentDiv.find('.showForm').show();			
			}});

			console.log(res);
		},
		error: function(err) {
			console.log(err);
		}
	});
});







});
