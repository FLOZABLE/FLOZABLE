var fileUpload = document.querySelector(".upload");
 
fileUpload.addEventListener("dragover", function() {
  this.classList.add("drag");
  this.classList.remove("drop", "done");
});
 
fileUpload.addEventListener("dragleave", function() {
  this.classList.remove("drag");
});
 
fileUpload.addEventListener("drop", start, false);
fileUpload.addEventListener("change", start, false);
 
function start() { 
  this.classList.remove("drag");
  this.classList.add("drop");
  setTimeout(() => this.classList.add("done"), 3000);
}

const save_btn = document.querySelector("input#submit");

save_btn.addEventListener("click", () => {
  const profile_picture = document.querySelector("#profile-file");
  console.log(profile_picture.files[0]);
  const reader = new FileReader();
  reader.readAsDataURL(profile_picture.files[0]);

  reader.onload = () => {
    const base64ImageData = reader.result.split(',')[1];
    (async() => {
      const response = await fetch('/myaccount/update', {
        method: 'post',
        body: JSON.stringify({ picture: base64ImageData }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // handle the response as needed
    })();
  }
})