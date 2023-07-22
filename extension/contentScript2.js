// Define the floating modal HTML and CSS
const modalHTML = `
<div id="floatingModal" class="extension-modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Floating Modal</h2>
    <p>This is a floating modal on the user's tab.</p>
  </div>
</div>
`;

const modalCSS = `
/* Your CSS styles for the modal */
.extension-modal {
  display: block;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.extension-modal .modal-content {
  padding: 20px;
}

.extension-modal .close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
`;

// Create a new <style> element to hold the modal CSS code
const styleElement = document.createElement('style');
styleElement.textContent = modalCSS;

// Create a new <div> element to hold the modal HTML code
const containerElement = document.createElement('div');
containerElement.innerHTML = modalHTML;

// Append the <style> and <div> elements to the <body> of the user's tab
document.body.appendChild(styleElement);
document.body.appendChild(containerElement);

// Define the hideModal function within the content script
function hideModal() {
  const modal = document.getElementById('floatingModal');
  modal.style.display = 'none';
}

const closeButton = document.querySelector('.extension-modal .close');
console.log(closeButton)
closeButton.addEventListener('click', () => {
  console.log('d')
});

// Rest of your content script code...
