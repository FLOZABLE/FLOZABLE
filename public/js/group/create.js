current_fs = this.parentNode;
next_fs = this.parentNode.nextElementSibling;

//activate next step on progressbar using the index of next_fs
document.querySelectorAll("#progressbar li")[Array.prototype.indexOf.call(document.querySelectorAll("fieldset"), next_fs)].classList.add("active");

//show the next fieldset
next_fs.style.display = ""; 
//hide the current fieldset with style
current_fs.animate({opacity: 0}, {
	step: function(now, mx) {
		//as the opacity of current_fs reduces to 0 - stored in "now"
		//1. scale current_fs down to 80%
		scale = 1 - (1 - now) * 0.2;
		//2. bring next_fs from the right(50%)
		left = (now * 50)+"%";
		//3. increase opacity of next_fs to 1 as it moves in
		opacity = 1 - now;
		current_fs.style.transform = 'scale('+scale+')';
		current_fs.style.position = 'absolute';
		next_fs.style.left = left;
		next_fs.style.opacity = opacity;
	}, 
	duration: 800, 
	complete: function(){
		current_fs.style.display = "none";
		animating = false;
	}, 
	//this comes from the custom easing plugin
	easing: 'easeInOutBack'
});


document.querySelector(".previous").addEventListener("click", function(){
if(animating) return false;
animating = true;

javascript
current_fs = this.parentNode;
previous_fs = this.parentNode.previousElementSibling;

//de-activate current step on progressbar
document.querySelectorAll("#progressbar li")[Array.prototype.indexOf.call(document.querySelectorAll("fieldset"), current_fs)].classList.remove("active");

//show the previous fieldset
previous_fs.style.display = ""; 
//hide the current fieldset with style
current_fs.animate({opacity: 0}, {
	step: function(now, mx) {
		//as the opacity of current_fs reduces to 0 - stored in "now"
		//1. scale previous_fs from 80% to 100%
		scale = 0.8 + (1 - now) * 0.2;
		//2. take current_fs to the right(50%) - from 0%
		left = ((1-now) * 50)+"%";
		//3. increase opacity of previous_fs to 1 as it moves in
		opacity = 1 - now;
		current_fs.style.left = left;
		previous_fs.style.transform = 'scale('+scale+')';
		previous_fs.style.opacity = opacity;
	}, 
	duration: 800, 
	complete: function(){
		current_fs.style.display = "none";
		animating = false;
	}, 
	//this comes from the custom easing plugin
	easing: 'easeInOutBack'
});
});