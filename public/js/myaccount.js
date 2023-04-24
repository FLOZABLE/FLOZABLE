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
    document.querySelector(`#programming-skills #${div_id} h4`).style.cssText = 'transform: translateX(-50%) scale(' + (1+(programming_skills[i][div_id]/100)) + '); left: ' + programming_skills[i][div_id] + '%;';
    programmingCardBody.appendChild(div);
  }
  for(let i = 0; i < programming_language_skills.length; i++) {

  }
})();