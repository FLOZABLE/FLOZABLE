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
  const name = document.querySelector("input#name").value;
  const email = document.querySelector("input#email").value;
  const aboutme = document.querySelector("input#aboutme").value;
  
  if (profile_picture.files.length > 0) {
    // If an image file is selected, read it and upload it
    const reader = new FileReader();
    reader.readAsDataURL(profile_picture.files[0]);
  
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];
      /* const formData = new FormData();
      formData.append('picture', profile_picture.files[0]);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('aboutme', aboutme); */
  
      try {
        const response = await fetch('/myaccount/update', {
          method: 'POST',
          body: JSON.stringify({picture: base64Data, name: name, email: email, aboutme: aboutme}),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        // handle the response as needed
      } catch (error) {
        console.error('Error:', error);
      }
    };
  } else {
    // If no image file is selected, simply send the other form data to the server
    (async () => {
      try {
        const response = await fetch('/myaccount/update', {
          method: 'POST',
          body: new URLSearchParams({
            picture: null,
            name: name,
            email: email,
            aboutme: aboutme
          })
        });
        // handle the response as needed
      } catch (error) {
        console.error('Error:', error);
      }
    })();
  }
});
