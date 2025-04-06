const formEl = document.getElementById("form");
const formFields = {
  username: {
    element: document.getElementById("username"),
    minLength: 3,
    validate: (value) => value.length >= 3,
  },
  email: {
    element: document.getElementById("email"),
    validate: (value) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(value.toLowerCase());
    },
  },
  password: {
    element: document.getElementById("password"),
    minLength: 6,
    validate: (value) => value.length >= 6,
  },
  confirmPassword: {
    element: document.getElementById("password-confirmation"),
    validate: (value) => value === formFields.password.element.value,
  },
};

function setFieldStatus(field, isValid, message = "") {
  const formGroup = field.element.parentElement;
  formGroup.className = `form-group ${isValid ? "success" : "error"}`;
  const smallEl = formGroup.querySelector("small");
  smallEl.innerText = message;
}

function validateField(fieldName) {
  const field = formFields[fieldName];
  const value = field.element.value.trim();

  if (!value) {
    setFieldStatus(
      field,
      false,
      `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
    );
    return false;
  }

  if (!field.validate(value)) {
    const errorMessage =
      fieldName === "confirmPassword"
        ? "Passwords do not match"
        : `Invalid ${fieldName}${
            field.minLength ? ` (minimum ${field.minLength} characters)` : ""
          }`;
    setFieldStatus(field, false, errorMessage);
    return false;
  }

  setFieldStatus(field, true);
  return true;
}

formEl.addEventListener("submit", function (e) {
  e.preventDefault();

  const isValid = Object.keys(formFields)
    .map((fieldName) => validateField(fieldName))
    .every((result) => result === true);

  if (isValid) {
    console.log("Form is valid - ready to submit");
    // formEl.submit(); // Uncomment to enable actual form submission
  }
});

// Add real-time validation
Object.keys(formFields).forEach((fieldName) => {
  const field = formFields[fieldName];
  field.element.addEventListener("blur", () => validateField(fieldName));
});
