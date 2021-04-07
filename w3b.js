$("#heroLocation").css({ height: $(window).height() + "px" });

$(window).on("resize", function() {
  $("#heroLocation").css({ height: $(window).height() + "px" });
});