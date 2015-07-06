function fixSizing() {
  $('#text').height(window.innerHeight-$('#window').position().top - 5);
}

$(function() {
  fixSizing();
});
