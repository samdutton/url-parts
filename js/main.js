/* Copyright 2020 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

const form = document.querySelector('form');
const saveAddressButton = document.querySelector('button#save-address');

form.addEventListener('submit', handleFormSubmission);                       

function handleFormSubmission(event) {
  event.preventDefault();
  validate();
  form.reportValidity();
  if (form.checkValidity() === false) {
    // Handle invalid form data.
  } else {
    // On a production site do form submission.
    saveAddressButton.textContent = 'Saving...';
    saveAddressButton.disabled = 'true';
    alert('Saving address!');
  }
}

// Do form validation.
function validate() {
  // let message= '';
  // if (!/someregex/.test(someInput.value)) {
  //   console.log(`Invalid value ${someInput.value} for someInput`);
	// 	 message = 'Explain how to enter a valid value';
  // }
  // someInput.setCustomValidity(message);
}

