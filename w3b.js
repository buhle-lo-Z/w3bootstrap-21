/* create an <h4>Products<h4>element when you click on Products*/
$(addH4);
document.body.onload = addH4;

function addH4() {
  // const newdiv = document.createElement("div");
  // create new H4 element
  const newH4 = document.createElement("h4");
  // add content of h4 element
  const h4Tittle = document.createTextNode("Products");
  // put the contents/text node to newly created h4 element
  newH4.appendChild(h4Tittle);
  // put h4 inside newdiv
  //newdiv.appendChild(newH4);
  // add both new h4 element & its content to the DOM
  const b4ImgCards = document.getElementById("colCards");
  document.body.insertBefore(newdH4, b4ImgCards); 
}

// Auto update Copyright year ref: https://m.accessc.som/articles.copyright-year-update.html
function updateDt() {
  var today = new Date();
  return today.getFullYear();
}
// Display Copyright year each new Gregorian calendar year i.e. on New Year's day
function updateCopyRight(){
  document.getElementById("copyRite").innerHTML = "&copy;" + updateDt(); // print copyright date
}


// ATTEMPTING https://getbootstrap.com/docs/4.4/components/modal/#varying-modal-content
$('#brandModal').on('show.bs.modal', function (event) { // Occurs when the modal is about to be shown vs shown == Occurs when the modal is fully shown
  var image = $(event.relatedTarget) // image that triggered the modal
  var diffContent = image.data('change') // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  //modal.find('.modal-title').innerHTML = titleByAlt;
  modal.find('.modal-title').text(this.alt);
  modal.find('.modal-content source').val(diffContent);
})



/* function imgModal(){
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

