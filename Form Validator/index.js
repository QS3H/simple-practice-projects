document.addEventListener("DOMContentLoaded", () => {
  const formEl = document.getElementById("form");

  // Debounce function for performance
  const debounce = (fn, delay = 500) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(null, args), delay);
    };
  };

  // Enhanced password validation
  const validatePasswordStrength = (value) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*]/.test(value);
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const formFields = {
    username: {
      element: document.getElementById("username"),
      minLength: 3,
      validate: (value) => value.length >= 3,
      errorMessage: "Username must be at least 3 characters",
    },
    email: {
      element: document.getElementById("email"),
      validate: (value) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(value.toLowerCase());
      },
      errorMessage: "Please enter a valid email address",
    },
    password: {
      element: document.getElementById("password"),
      minLength: 6,
      validate: (value) => value.length >= 6 && validatePasswordStrength(value),
      errorMessage:
        "Password must be at least 6 characters and contain uppercase, lowercase, number and special character",
    },
    confirmPassword: {
      element: document.getElementById("password-confirmation"),
      validate: (value) => value === formFields.password.element.value,
      errorMessage: "Passwords do not match",
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
      setFieldStatus(field, false, field.errorMessage);
      return false;
    }

    setFieldStatus(field, true);
    return true;
  }

  // Reset form with animation
  function resetForm() {
    Object.keys(formFields).forEach((fieldName) => {
      const field = formFields[fieldName];
      field.element.value = "";
      const formGroup = field.element.parentElement;
      formGroup.className = "form-group";
    });
  }

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();

    const isValid = Object.keys(formFields)
      .map((fieldName) => validateField(fieldName))
      .every((result) => result === true);

    if (isValid) {
      console.log("Form is valid - ready to submit");
      // Add success animation or message
      setTimeout(() => {
        resetForm();
      }, 1000);
    }
  });

  // Add debounced real-time validation
  Object.keys(formFields).forEach((fieldName) => {
    const field = formFields[fieldName];
    const debouncedValidate = debounce(() => validateField(fieldName));
    field.element.addEventListener("input", debouncedValidate);
    field.element.addEventListener("blur", () => validateField(fieldName));
  });

  // Add reset button functionality
  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.textContent = "Reset";
  resetButton.className = "reset-button";
  resetButton.onclick = resetForm;
  formEl.appendChild(resetButton);
});
