$("#heroLocation").css({ height: $(window).height() + "px" });

$(window).on("resize", function() {
  $("#heroLocation").css({ height: $(window).height() + "px" });
});

$('#brandModal').on('show.bs.modal', function (event) { // or is it: 'shown.bs.modal'
  var image = $(event.relatedTarget) // image that triggered the modal
  var diffContent = image.data('change') // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  //modal.find('.modal-title').innerHTML = titleByAlt;
  modal.find('.modal-title').text(this.alt);
  modal.find('.modal-content source').val(diffContent);
})

/*function imgModal(){
// Get the modal
var modal = document.getElementById("brandModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var img = document.getElementById("imgBradford");
var modalImg = document.getElementById("img01"); // modal-content
var captionText = document.getElementById("brandAlt"); // modal-title
img.onclick = function(){
  modal.style.display = "block";
  modalImg.src = this.src;
  captionText.innerHTML = this.alt;
}

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() { 
  modal.style.display = "none";
}
}*/

