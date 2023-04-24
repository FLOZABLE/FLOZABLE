(async() => {
  const response = await fetch('/myaccount/skills', {
    method: 'post',
  })

  const skills = await response.json();
  console.log(skills);
  const programming_skills = JSON.parse(skills.programming_skills);
  const programming_language_skills = JSON.parse(skills.programming_language_skills);
  console.log(programming_skills, programming_language_skills, Object.keys(programming_skills[0])[0]);
  const programmingCardBody = document.querySelector('.col-sm-6.mb-3#programming-skills .card-body');
  const programminglangCardBody = document.querySelector('.col-sm-6.mb-3#programming-language-skills .card-body');
  
  const programming_skills_list = [
    "Web Development (Front-end)",
    "Web Development (Back-end)",
    "Mobile App Development (iOS, Android)",
    "Database Management and Development",
    "Game Development",
    "Network Programming",
    "Desktop Application Development",
    "Data Science and Analysis",
    "Cybersecurity and Ethical Hacking"
  ]

  const programming_languages_list = [
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
  
  for(let i = 0; i < programming_skills.length; i++) {
    let div_id = Object.keys(programming_skills[i])[0];
    const div = document.createElement("div");
    div.setAttribute('class', 'skill');
    div.setAttribute('id', `${div_id}`);
    div.innerHTML=`
    <h5 class = "skill-title">${programming_skills_list[i]}</h5 class = "skill-title">
    <input type="range" value=${programming_skills[i][div_id]} id = range-${div_id.split('-')[1]} disabled/>
    <div class="h4-container" id = range-${div_id.split('-')[1]}-con"><div class="h4-subcontainer"><h4>${programming_skills[i][div_id]}<span></span></h4></div></div>
    `;
    div.querySelector("input").setAttribute("value", programming_skills[i][div_id]);
    div.querySelector("input").style.filter = 'hue-rotate(-' + programming_skills[i][div_id] + 'deg)';
    console.log(programming_skills[i][div_id], div_id.split('-')[1])
    programmingCardBody.appendChild(div);
    document.querySelector(`#programming-skills #${div_id} h4`).style.cssText = 'transform: translateX(-50%) scale(' + (1+(programming_skills[i][div_id]/100)) + '); left: ' + programming_skills[i][div_id] + '%;';
  }
  for(let i = 0; i < programming_language_skills.length; i++) {
    let div_id = Object.keys(programming_language_skills[i])[0];
    const div = document.createElement("div");
    div.setAttribute('class', 'skill');
    div.setAttribute('id', `${div_id}`);
    div.innerHTML=`
    <h5 class = "skill-title">${programming_languages_list[parseInt(div_id.split('-')[1]) - 1]}</h5 class = "skill-title">
    <input type="range" value=${programming_language_skills[i][div_id]} id = range-${div_id.split('-')[1]} disabled/>
    <div class="h4-container" id = range-${div_id.split('-')[1]}-con"><div class="h4-subcontainer"><h4>${programming_language_skills[i][div_id]}<span></span></h4></div></div>
    `;
    div.querySelector("input").setAttribute("value", programming_language_skills[i][div_id]);
    div.querySelector("input").style.filter = 'hue-rotate(-' + programming_language_skills[i][div_id] + 'deg)';
    console.log(programming_language_skills[i][div_id], div_id.split('-')[1])
    programminglangCardBody.appendChild(div);
    document.querySelector(`#programming-language-skills #${div_id} h4`).style.cssText = 'transform: translateX(-50%) scale(' + (1+(programming_language_skills[i][div_id]/100)) + '); left: ' + programming_language_skills[i][div_id] + '%;';
  }

  if(document.querySelectorAll("#programming-skills .skill").length > 0){
    console.log("gone")
    document.querySelectorAll('p.not-selected')[0].style = "display: none;";
  }

  if(document.querySelectorAll("#programming-language-skills .skill").length > 0){
    console.log("gone")
    document.querySelectorAll('p.not-selected')[1].style = "display: none;";
}
})();