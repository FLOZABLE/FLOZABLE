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



const programmingSkillDragElements = document.querySelectorAll('#programming-skills .skill');
const programmingSkillDragendArea = document.querySelector('.programming-skills');
const programmingCardBody = document.querySelector('.col-sm-6.mb-3#programming-skills .card-body');

for (let i = 1; i <= 9; i++) {
  const dragElement = programmingSkillDragElements[i - 1];
  const rangeInput = document.querySelector(`#programming-skills #range-${i}`);

  rangeInput.addEventListener('input', () => {
    // disable dragging when input is being used
    dragElement.setAttribute('draggable', false);
    console.log("change")
    document.querySelector(`#programming-skills #range-${i}-con h4`).innerHTML = document.querySelector(`#programming-skills #range-${i}`).value + '<span></span>';
    document.querySelectorAll(`#programming-skills #range-${i}, #programming-skills #range-${i}-con h4 > span`).forEach(function(element) {
      element.style.filter = 'hue-rotate(-' + document.querySelector(`#programming-skills #range-${i}`).value + 'deg)';
    });
    document.querySelector(`#programming-skills #range-${i}-con h4`).style.cssText = 'transform: translateX(-50%) scale(' + (1+(document.querySelector(`#programming-skills #range-${i}`).value/100)) + '); left: ' + document.querySelector(`#programming-skills #range-${i}`).value + '%;';
  });

  rangeInput.addEventListener('mouseup', () => {
    // enable dragging again when input is no longer being used
    dragElement.setAttribute('draggable', true);
  });
}


let originalX, originalY;
let draggedElement = null;

programmingSkillDragElements.forEach((dragElement) => {
  dragElement.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', 'This is the draggable element.');
  
    // set a CSS class to the element being dragged
    event.target.classList.add('dragging');
    draggedElement = event.target;
  });
  
  dragElement.addEventListener('dragend', (event) => {
    // remove the CSS class from the element being dragged
    event.target.classList.remove('dragging');
    draggedElement = null;
  
    // check if the element was dropped inside the programmingSkillDragendArea
    if (event.target.parentElement === programmingSkillDragendArea) {
      console.log('Element was dropped inside the programmingSkillDragendArea!');
      // do something here, e.g. add the element to a list or update a counter
    } else {
      // reset the position of the element if it was not dropped inside the programmingSkillDragendArea
      event.target.style.left = originalX + 'px';
      event.target.style.top = originalY + 'px';
    }
  });
  
  dragElement.addEventListener('dragover', (event) => {
    // prevent default behavior to allow drop
    event.preventDefault();
  });
  
  dragElement.addEventListener('mousedown', (event) => {
    // get the initial position of the element
    originalX = event.clientX;
    originalY = event.clientY;
  });
});

programmingSkillDragendArea.addEventListener('dragover', (event) => {
  // prevent default behavior to allow drop
  event.preventDefault();
});

programmingSkillDragendArea.addEventListener('drop', (event) => {
  // get the data transferred
  const data = event.dataTransfer.getData('text/plain');
  console.log(data);

  // get the dragged element from the programmingCardBody, remove it and append it to the programmingSkillDragendArea
  if (draggedElement) {
    draggedElement.classList.remove('dragging');
    programmingSkillDragendArea.appendChild(draggedElement);
    draggedElement = null;
  }
});

programmingCardBody.addEventListener('dragover', (event) => {
  // prevent default behavior to allow drop
  event.preventDefault();
});

programmingCardBody.addEventListener('drop', (event) => {
  // get the data transferred
  const data = event.dataTransfer.getData('text/plain');
  console.log(data);

  // get the dragged element from the programmingSkillDragendArea, remove it and append it to the programmingCardBody
  if (draggedElement && draggedElement.parentElement === programmingSkillDragendArea) {
    draggedElement.classList.remove('dragging');
    programmingCardBody.appendChild(draggedElement);
    draggedElement = null;
  }
});


//create programming langauges
const programming_languages = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "PHP",
  "C++",
  "TypeScript",
  "Ruby",
  "Swift",
  "Objective-C",
  "Kotlin",
  "R",
  "Go",
  "Scala",
  "Perl",
  "Visual Basic",
  "Assembly",
  "Lua",
  "Dart",
  "Haskell",
  "Groovy",
  "Shell",
  "PowerShell",
  "MATLAB",
  "CoffeeScript",
  "Erlang",
  "Julia",
  "Rust",
  "F#",
  "Clojure",
  "Scheme",
  "VB.NET",
  "OCaml",
  "Visual Basic for Applications",
  "Delphi/Object Pascal",
  "ActionScript",
  "Lisp",
  "Ada",
  "Prolog",
  "Smalltalk",
  "Transact-SQL",
  "PL/SQL",
  "Apex",
  "T-SQL",
  "Node.js",
  "React",
  "Angular",
  "Vue.js",
  "Express.js",
  "Spring",
  "Hibernate",
  "Ruby on Rails",
  "Django",
  "Flask",
  "Laravel",
  "Symfony",
  "CodeIgniter",
  "ASP.NET",
  "jQuery",
  "Bootstrap",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Oracle",
  "Microsoft SQL Server",
  "SQLite",
  "Firebase",
  "Cassandra",
  "Amazon EC2",
  "Amazon S3",
  "Docker",
  "Kubernetes",
  "Jenkins",
  "Git",
  "Unity",
  "Unreal Engine",
  "Godot Engine"
];

let programming_lang_n = 1;
const programminglangDragendArea = document.querySelector('.programming-language-skills');
const programminglangCardBody = document.querySelector('.col-sm-6.mb-3#programming-language-skills .card-body');
programming_languages.forEach((programming_lang) => {
  let div = document.createElement("div");
  div.setAttribute('class', 'skill');
  div.setAttribute('draggable', 'true');
  div.setAttribute('id', `skill-${programming_lang_n}`);
  div.innerHTML=`
  <h5 class = "skill-title">${programming_lang}</h5 class = "skill-title">
  <input type="range" value="0" id = "range-${programming_lang_n}"/>
  <div class="h4-container" id = "range-${programming_lang_n}-con"><div class="h4-subcontainer"><h4>0<span></span></h4></div></div>
  `
  programminglangDragendArea.appendChild(div);
  programming_lang_n += 1;
})

const skillSelection1 = document.querySelector("input#option-1");
const skillSelection2 = document.querySelector("input#option-2");

skillSelection1.addEventListener('change', () => {
  programminglangDragendArea.style = "display: none";
  programmingSkillDragendArea.style = "display: flex";
})

skillSelection2.addEventListener('change', () => {
  programminglangDragendArea.style = "display: flex";
  programmingSkillDragendArea.style = "display: none";
})

const programminglangDragElements = document.querySelectorAll('#programming-language-skills .skill');
for (let i = 1; i <= programming_languages.length; i++) {
  const dragElement = programminglangDragElements[i - 1];
  const rangeInput = document.querySelector(`#programming-language-skills #range-${i}`);
  
  rangeInput.addEventListener('input', () => {
    // disable dragging when input is being used
    dragElement.setAttribute('draggable', false);
    console.log("change-2")
    document.querySelector(`#programming-language-skills #range-${i}-con h4`).innerHTML = document.querySelector(`#programming-language-skills #range-${i}`).value + '<span></span>';
    document.querySelectorAll(`#programming-language-skills #range-${i}, #programming-language-skills #range-${i}-con h4 > span`).forEach(function(element) {
      element.style.filter = 'hue-rotate(-' + document.querySelector(`#programming-language-skills #range-${i}`).value + 'deg)';
    });
    document.querySelector(`#programming-language-skills #range-${i}-con h4`).style.cssText = 'transform: translateX(-50%) scale(' + (1+(document.querySelector(`#programming-language-skills #range-${i}`).value/100)) + '); left: ' + document.querySelector(`#programming-language-skills #range-${i}`).value + '%;';
  });

  rangeInput.addEventListener('mouseup', () => {
    // enable dragging again when input is no longer being used
    dragElement.setAttribute('draggable', true);
  });
}


let lang_originalX, lang_originalY;
let lang_draggedElement = null;

programminglangDragElements.forEach((dragElement) => {
  dragElement.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', 'This is the draggable element.');
    console.log(event.target)
    // set a CSS class to the element being dragged
    event.target.classList.add('dragging');
    lang_draggedElement = event.target;
  });
  
  dragElement.addEventListener('dragend', (event) => {
    // remove the CSS class from the element being dragged
    event.target.classList.remove('dragging');
    lang_draggedElement = null;
  
    // check if the element was dropped inside the programminglangDragendArea
    if (event.target.parentElement === programminglangDragendArea) {
      console.log('Element was dropped inside the programminglangDragendArea!');
      // do something here, e.g. add the element to a list or update a counter
    } else {
      // reset the position of the element if it was not dropped inside the programminglangDragendArea
      event.target.style.left = lang_originalX + 'px';
      event.target.style.top = lang_originalY + 'px';
    }
  });
  
  dragElement.addEventListener('dragover', (event) => {
    // prevent default behavior to allow drop
    event.preventDefault();
  });
  
  dragElement.addEventListener('mousedown', (event) => {
    // get the initial position of the element
    lang_originalX = event.clientX;
    lang_originalY = event.clientY;
  });
});

programminglangDragendArea.addEventListener('dragover', (event) => {
  // prevent default behavior to allow drop
  event.preventDefault();
});

programminglangDragendArea.addEventListener('drop', (event) => {
  // get the data transferred
  const data = event.dataTransfer.getData('text/plain');
  console.log(data);

  // get the dragged element from the programminglangCardBody, remove it and append it to the programminglangDragendArea
  if (lang_draggedElement) {
    lang_draggedElement.classList.remove('dragging');
    programminglangDragendArea.insertBefore(lang_draggedElement, programminglangDragendArea.firstChild);
    lang_draggedElement = null;
  }
});

programminglangCardBody.addEventListener('dragover', (event) => {
  // prevent default behavior to allow drop
  event.preventDefault();
});

programminglangCardBody.addEventListener('drop', (event) => {
  // get the data transferred
  const data = event.dataTransfer.getData('text/plain');
  console.log(data);

  // get the dragged element from the programminglangDragendArea, remove it and append it to the programminglangCardBody
  if (lang_draggedElement && lang_draggedElement.parentElement === programminglangDragendArea) {
    lang_draggedElement.classList.remove('dragging');
    programminglangCardBody.appendChild(lang_draggedElement);
    lang_draggedElement = null;
  }
});

//moving elements
(async() => {
  const response = await fetch('/myaccount/skills', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const result = await response.json();
  console.log(result);
    /* .then()
    .then(data => console.log(data))
    .catch(error => console.error(error)); */
})();

const save_btn = document.querySelector("input#submit");

save_btn.addEventListener("click", () => {
  const profile_picture = document.querySelector("#profile-file");
  const name = document.querySelector("input#name").value;
  const email = document.querySelector("input#email").value;
  const aboutme = document.querySelector("input#aboutme").value;
  let programming_skills_el = document.querySelectorAll("#programming-skills .card-body .skill");
  let programming_skills = [];
  for(let i = 0; i < programming_skills_el.length; i++){
    programming_skills.push({[programming_skills_el[i].id]: programming_skills_el[i].querySelector('input').value});
  }

  let programming_lang_skills_el = document.querySelectorAll("#programming-language-skills .card-body .skill");
  let programming_lang_skills = [];
  for(let i = 0; i < programming_lang_skills_el.length; i++){
    programming_lang_skills.push({[programming_lang_skills_el[i].id]: programming_lang_skills_el[i].querySelector('input').value});
  }
  
  if (profile_picture.files.length > 0) {
    // If an image file is selected, read it and upload it
    const reader = new FileReader();
    reader.readAsDataURL(profile_picture.files[0]);
  
    reader.onload = () => {
      const base64ImageData = reader.result.split(',')[1];
      (async() => {
        const response = await fetch('/myaccount/update', {
          method: 'post',
          body: JSON.stringify({ picture: base64ImageData, name: name, email: email, aboutme: aboutme, programming_skills: programming_skills, programming_lang_skills: programming_lang_skills }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        // handle the response as needed
      })();
    }
  } else {
    // If no image file is selected, simply send the other form data to the server
    (async() => {
      const response = await fetch('/myaccount/update', {
        method: 'post',
        body: JSON.stringify({ picture: null, name: name, email: email, aboutme: aboutme, programming_skills: programming_skills, programming_lang_skills: programming_lang_skills }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // handle the response as needed
    })();
  }
});

//move selected elements in the database

(async() => {
  const response = await fetch('/myaccount/skills', {
    method: 'post',
  })

  const skills = await response.json();
  console.log(skills);
  const programming_skills = JSON.parse(skills.programming_skills);
  const programming_language_skills = JSON.parse(skills.programming_language_skills);

  const programmingCardBody = document.querySelector('.col-sm-6.mb-3#programming-skills .card-body');
  const programminglangCardBody = document.querySelector('.col-sm-6.mb-3#programming-language-skills .card-body');
  for(let i = 0; i < programming_skills.length; i++){
    const programming_skill = document.querySelector(`#programming-skills .skill#${Object.keys(programming_skills[i])[0]}`);
    programming_skill.querySelector("input").setAttribute("value", programming_skills[i][Object.keys(programming_skills[i])[0]]);
    programmingCardBody.appendChild(programming_skill);
    programming_skill.querySelector("input").style.filter = 'hue-rotate(-' + programming_skills[i][Object.keys(programming_skills[i])[0]] + 'deg)';
    document.querySelector(`#programming-skills #${Object.keys(programming_skills[i])[0]} h4`).style.cssText = 'transform: translateX(-50%) scale(' + (1+(programming_skills[i][Object.keys(programming_skills[i])[0]]/100)) + '); left: ' + programming_skills[i][Object.keys(programming_skills[i])[0]] + '%;';
  }

  for(let i = 0; i < programming_language_skills.length; i++){
    const programming_language_skill = document.querySelector(`#programming-language-skills .skill#${Object.keys(programming_language_skills[i])[0]}`);
    programming_language_skill.querySelector("input").setAttribute("value", programming_language_skills[i][Object.keys(programming_language_skills[i])[0]])
    programminglangCardBody.appendChild(programming_language_skill);
    programming_language_skill.querySelector("input").style.filter = 'hue-rotate(-' + programming_language_skills[i][Object.keys(programming_language_skills[i])[0]] + 'deg)';
    document.querySelector(`#programming-language-skills #${Object.keys(programming_language_skills[i])[0]} h4`).style.cssText = 'transform: translateX(-50%) scale(' + (1+(programming_language_skills[i][Object.keys(programming_language_skills[i])[0]]/100)) + '); left: ' + programming_language_skills[i][Object.keys(programming_language_skills[i])[0]] + '%;';
  }
  // handle the response as needed
})();