
/*
Copyright 2020 Google LLC
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
  https://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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

