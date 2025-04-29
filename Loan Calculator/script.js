// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Theme Toggle
  const themeToggle = document.getElementById("theme-toggle-checkbox");
  // Form Elements
  const loanForm = document.getElementById("loan-form");
  const loanAmountInput = document.getElementById("loan-amount");
  const loanAmountSlider = document.getElementById("loan-amount-slider");
  const interestRateInput = document.getElementById("interest-rate");
  const interestRateSlider = document.getElementById("interest-rate-slider");
  const loanTermInput = document.getElementById("loan-term");
  const loanTermSlider = document.getElementById("loan-term-slider");
  const paymentFrequency = document.getElementById("payment-frequency");
  const termButtons = document.querySelectorAll(".term-btn");
  const loanTypeButtons = document.querySelectorAll(".loan-type-btn");
  const calculateBtn = document.getElementById("calculate-btn");
  const resetBtn = document.getElementById("reset-btn");

  // Results Elements
  const monthlyPaymentEl = document.getElementById("monthly-payment");
  const totalPaymentEl = document.getElementById("total-payment");
  const totalInterestEl = document.getElementById("total-interest");
  const paymentChart = document.getElementById("payment-chart");
  const amortizationTable = document.getElementById("amortization-table");
  const amortizationBody = document.getElementById("amortization-body");

  // Advanced Options
  const advancedToggle = document.querySelector(".advanced-toggle");
  const advancedContent = document.querySelector(".advanced-content");
  const downPaymentInput = document.getElementById("down-payment");
  const additionalPaymentInput = document.getElementById("additional-payment");
  const startDateInput = document.getElementById("start-date");
  const taxInsuranceInput = document.getElementById("tax-insurance");

  // Comparison Elements
  const comparisonToggle = document.querySelector(".comparison-toggle");
  const comparisonContent = document.querySelector(".comparison-content");
  const addScenarioBtn = document.getElementById("add-scenario-btn");
  const scenarioContainer = document.getElementById("scenario-container");
  const comparisonChart = document.getElementById("comparison-chart");

  // Action Buttons
  const saveBtn = document.getElementById("save-btn");
  const printBtn = document.getElementById("print-btn");
  const exportBtn = document.getElementById("export-btn");

  // State variables
  let currentTermType = "years";
  let currentLoanType = "personal";
  let scenarios = [];
  let paymentChartInstance = null;
  let comparisonChartInstance = null;

  // Set current year in footer
  document.getElementById("current-year").textContent =
    new Date().getFullYear();

  // Set default start date to today
  const today = new Date().toISOString().split("T")[0];
  startDateInput.value = today;

  // Initialize UI
  initializeUI();

  // Event Listeners
  themeToggle.addEventListener("change", toggleTheme);
  loanAmountInput.addEventListener("input", syncInputWithSlider);
  loanAmountSlider.addEventListener("input", syncSliderWithInput);
  interestRateInput.addEventListener("input", syncInputWithSlider);
  interestRateSlider.addEventListener("input", syncSliderWithInput);
  loanTermInput.addEventListener("input", syncInputWithSlider);
  loanTermSlider.addEventListener("input", syncSliderWithInput);

  // Term type buttons (Years/Months)
  termButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateTermType(this.dataset.term);
    });
  });

  // Loan type buttons
  loanTypeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateLoanType(this.dataset.type);
    });
  });

  // Main buttons
  calculateBtn.addEventListener("click", calculateLoan);
  resetBtn.addEventListener("click", resetForm);

  // Toggle sections
  advancedToggle.addEventListener("click", () =>
    toggleSection(advancedContent, advancedToggle)
  );
  comparisonToggle.addEventListener("click", () =>
    toggleSection(comparisonContent, comparisonToggle)
  );

  // Comparison buttons
  addScenarioBtn.addEventListener("click", addScenario);

  // Action buttons
  saveBtn.addEventListener("click", saveResults);
  printBtn.addEventListener("click", printResults);
  exportBtn.addEventListener("click", exportToPDF);

  // Functions

  /**
   * Initialize UI components
   */
  function initializeUI() {
    // Set default values for sliders
    syncInputWithSlider.call(loanAmountInput);
    syncInputWithSlider.call(interestRateInput);
    syncInputWithSlider.call(loanTermInput);

    // Set default loan presets based on loan type
    updateLoanPresets();

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      themeToggle.checked = savedTheme === "light";
    }
  }

  /**
   * Toggle between light and dark theme
   */
  function toggleTheme() {
    const newTheme = themeToggle.checked ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Update charts if they exist
    updateCharts();
  }

  /**
   * Synchronize input field with its slider
   */
  function syncInputWithSlider() {
    const inputId = this.id;
    let sliderId, min, max, step;

    if (inputId === "loan-amount") {
      sliderId = "loan-amount-slider";
      min = 1000;
      max = 100000;
      step = 1000;
    } else if (inputId === "interest-rate") {
      sliderId = "interest-rate-slider";
      min = 0.1;
      max = 30;
      step = 0.1;
    } else if (inputId === "loan-term") {
      sliderId = "loan-term-slider";
      min = 1;
      max = currentTermType === "years" ? 30 : 360;
      step = 1;
    }

    const value = parseFloat(this.value);
    if (!isNaN(value)) {
      const slider = document.getElementById(sliderId);
      // Check if value is within range
      if (value < min) this.value = min;
      if (value > max) this.value = max;

      // Update slider
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = this.value;
    }
  }

  /**
   * Synchronize slider with its input field
   */
  function syncSliderWithInput() {
    const sliderId = this.id;
    let inputId;

    if (sliderId === "loan-amount-slider") {
      inputId = "loan-amount";
    } else if (sliderId === "interest-rate-slider") {
      inputId = "interest-rate";
    } else if (sliderId === "loan-term-slider") {
      inputId = "loan-term";
    }

    const input = document.getElementById(inputId);
    input.value = this.value;
  }

  /**
   * Update term type (years/months) and adjust related UI
   */
  function updateTermType(termType) {
    currentTermType = termType;

    // Update active button
    termButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.term === termType);
    });

    // Update slider max value
    if (termType === "years") {
      loanTermSlider.max = 30;
      loanTermSlider.min = 1;
      // Convert months to years if needed
      if (parseInt(loanTermInput.value) > 30) {
        loanTermInput.value = Math.ceil(parseInt(loanTermInput.value) / 12);
        loanTermSlider.value = loanTermInput.value;
      }
    } else {
      loanTermSlider.max = 360;
      loanTermSlider.min = 1;
      // Convert years to months if needed
      if (
        parseInt(loanTermInput.value) < 12 &&
        parseInt(loanTermInput.value) > 0
      ) {
        loanTermInput.value = parseInt(loanTermInput.value) * 12;
        loanTermSlider.value = loanTermInput.value;
      }
    }

    // Update slider labels
    const sliderLabels =
      loanTermSlider.parentElement.querySelector(".slider-labels");
    if (termType === "years") {
      sliderLabels.innerHTML = "<span>1 Year</span><span>30 Years</span>";
    } else {
      sliderLabels.innerHTML = "<span>1 Month</span><span>360 Months</span>";
    }
  }

  /**
   * Update loan type and set presets based on selection
   */
  function updateLoanType(type) {
    currentLoanType = type;

    // Update active button
    loanTypeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.type === type);
    });

    // Set loan presets based on type
    updateLoanPresets();
  }

  /**
   * Set default values based on loan type
   */
  function updateLoanPresets() {
    switch (currentLoanType) {
      case "mortgage":
        loanAmountInput.value = 250000;
        interestRateInput.value = 3.5;
        loanTermInput.value = currentTermType === "years" ? 30 : 360;
        downPaymentInput.value = 50000;
        taxInsuranceInput.value = 250;
        break;
      case "auto":
        loanAmountInput.value = 25000;
        interestRateInput.value = 4.5;
        loanTermInput.value = currentTermType === "years" ? 5 : 60;
        downPaymentInput.value = 5000;
        taxInsuranceInput.value = 50;
        break;
      case "personal":
      default:
        loanAmountInput.value = 10000;
        interestRateInput.value = 7.5;
        loanTermInput.value = currentTermType === "years" ? 3 : 36;
        downPaymentInput.value = 0;
        taxInsuranceInput.value = 0;
        break;
    }

    // Update sliders
    syncInputWithSlider.call(loanAmountInput);
    syncInputWithSlider.call(interestRateInput);
    syncInputWithSlider.call(loanTermInput);
  }

  /**
   * Validate form inputs
   * @returns {boolean} - Whether the form is valid
   */
  function validateForm() {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll(".error-message").forEach((el) => el.remove());
    document
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));

    // Validate loan amount
    if (loanAmountInput.value <= 0) {
      showError(loanAmountInput, "Loan amount must be greater than 0");
      isValid = false;
    }

    // Validate interest rate
    if (interestRateInput.value < 0) {
      showError(interestRateInput, "Interest rate cannot be negative");
      isValid = false;
    }

    // Validate loan term
    if (loanTermInput.value <= 0) {
      showError(loanTermInput, "Loan term must be greater than 0");
      isValid = false;
    }

    return isValid;
  }

  /**
   * Show error message for a form field
   * @param {HTMLElement} element - The input element
   * @param {string} message - Error message
   */
  function showError(element, message) {
    element.classList.add("error");
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.textContent = message;
    element.parentElement.appendChild(errorMessage);
  }

  /**
   * Calculate loan and update UI
   */
  function calculateLoan() {
    if (!validateForm()) return;

    // Get values from form
    let loanAmount = parseFloat(loanAmountInput.value);
    const interestRate = parseFloat(interestRateInput.value);
    let loanTerm = parseInt(loanTermInput.value);
    const frequency = paymentFrequency.value;

    // Get advanced options
    const downPayment = parseFloat(downPaymentInput.value) || 0;
    const additionalPayment = parseFloat(additionalPaymentInput.value) || 0;
    const taxInsurance = parseFloat(taxInsuranceInput.value) || 0;

    // Adjust loan amount for down payment
    loanAmount -= downPayment;

    // Convert term to months if needed
    const termInMonths = currentTermType === "years" ? loanTerm * 12 : loanTerm;

    // Calculate payments based on frequency
    const paymentsPerYear = getPaymentsPerYear(frequency);
    const totalPayments = (termInMonths / 12) * paymentsPerYear;
    const periodicInterestRate = interestRate / 100 / paymentsPerYear;

    // Calculate payment using the amortization formula
    let payment;
    if (periodicInterestRate === 0) {
      payment = loanAmount / totalPayments;
    } else {
      payment =
        (loanAmount *
          (periodicInterestRate *
            Math.pow(1 + periodicInterestRate, totalPayments))) /
        (Math.pow(1 + periodicInterestRate, totalPayments) - 1);
    }

    // Add tax and insurance to payment if applicable
    const totalPayment = payment + taxInsurance / (12 / (paymentsPerYear / 12));

    // Calculate total payment and interest
    let totalPaid = totalPayment * totalPayments;
    let totalInterest = totalPaid - loanAmount;

    // Calculate impact of additional payments
    if (additionalPayment > 0) {
      const amortizationSchedule = calculateAmortizationSchedule(
        loanAmount,
        interestRate,
        termInMonths,
        frequency,
        additionalPayment,
        taxInsurance
      );

      // Update values based on additional payments
      const lastRow = amortizationSchedule[amortizationSchedule.length - 1];
      totalPaid = lastRow.totalPaid;
      totalInterest = lastRow.totalInterest;
    }

    // Update UI
    monthlyPaymentEl.textContent = formatCurrency(totalPayment);
    totalPaymentEl.textContent = formatCurrency(totalPaid);
    totalInterestEl.textContent = formatCurrency(totalInterest);

    // Create amortization schedule
    const schedule = calculateAmortizationSchedule(
      loanAmount,
      interestRate,
      termInMonths,
      frequency,
      additionalPayment,
      taxInsurance
    );

    // Build the amortization table
    buildAmortizationTable(schedule);

    // Create chart
    createPaymentChart(loanAmount, totalInterest);

    // Add to scenarios for comparison
    addToScenarios(
      loanAmount,
      interestRate,
      termInMonths,
      frequency,
      totalPayment,
      totalPaid,
      totalInterest
    );
  }

  /**
   * Calculate payments per year based on frequency
   * @param {string} frequency - Payment frequency
   * @returns {number} - Payments per year
   */
  function getPaymentsPerYear(frequency) {
    switch (frequency) {
      case "weekly":
        return 52;
      case "bi-weekly":
        return 26;
      case "monthly":
      default:
        return 12;
    }
  }

  /**
   * Calculate amortization schedule
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate (%)
   * @param {number} termInMonths - Loan term in months
   * @param {string} frequency - Payment frequency
   * @param {number} additionalPayment - Additional payment amount
   * @param {number} taxInsurance - Monthly tax and insurance
   * @returns {Array} - Amortization schedule
   */
  function calculateAmortizationSchedule(
    principal,
    annualRate,
    termInMonths,
    frequency,
    additionalPayment,
    taxInsurance
  ) {
    const schedule = [];
    let balance = principal;
    let totalInterestPaid = 0;
    let totalPaid = 0;
    let paymentNumber = 0;

    // Get frequency settings
    const paymentsPerYear = getPaymentsPerYear(frequency);
    const totalPayments = (termInMonths / 12) * paymentsPerYear;
    const periodicRate = annualRate / 100 / paymentsPerYear;

    // Calculate base payment
    let basePayment;
    if (periodicRate === 0) {
      basePayment = principal / totalPayments;
    } else {
      basePayment =
        (principal *
          (periodicRate * Math.pow(1 + periodicRate, totalPayments))) /
        (Math.pow(1 + periodicRate, totalPayments) - 1);
    }

    // Calculate tax and insurance per payment period
    const taxInsurancePerPeriod = taxInsurance / (12 / (paymentsPerYear / 12));

    // Get start date
    const startDate = new Date(startDateInput.value);
    let currentDate = new Date(startDate);

    // Generate schedule
    while (balance > 0 && paymentNumber < totalPayments) {
      paymentNumber++;

      // Calculate interest for this period
      const interestPayment = balance * periodicRate;

      // Calculate principal for this period (including additional payment)
      let principalPayment = basePayment - interestPayment;
      principalPayment += additionalPayment;

      // Make sure we don't overpay
      if (principalPayment > balance) {
        principalPayment = balance;
      }

      // Update balance
      balance -= principalPayment;

      // Update running totals
      totalInterestPaid += interestPayment;
      totalPaid += principalPayment + interestPayment + taxInsurancePerPeriod;

      // Format date for this payment
      const paymentDate = formatDate(currentDate);

      // Add to schedule
      schedule.push({
        paymentNumber,
        paymentDate,
        payment: basePayment + additionalPayment + taxInsurancePerPeriod,
        principal: principalPayment,
        interest: interestPayment,
        balance,
        totalInterest: totalInterestPaid,
        totalPaid,
      });

      // Increment date for next payment
      incrementDate(currentDate, frequency);

      // Break if balance is zero
      if (balance <= 0) break;
    }

    return schedule;
  }

  /**
   * Format date to MM/DD/YYYY
   * @param {Date} date - Date object
   * @returns {string} - Formatted date
   */
  function formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  /**
   * Increment date based on payment frequency
   * @param {Date} date - Date object to modify
   * @param {string} frequency - Payment frequency
   */
  function incrementDate(date, frequency) {
    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "bi-weekly":
        date.setDate(date.getDate() + 14);
        break;
      case "monthly":
      default:
        date.setMonth(date.getMonth() + 1);
        break;
    }
  }

  /**
   * Build amortization table from schedule
   * @param {Array} schedule - Amortization schedule
   */
  function buildAmortizationTable(schedule) {
    // Clear existing table
    amortizationBody.innerHTML = "";

    // Create rows for each payment
    schedule.forEach((payment) => {
      const row = document.createElement("tr");

      row.innerHTML = `
              <td>${payment.paymentNumber}</td>
              <td>${payment.paymentDate}</td>
              <td>${formatCurrency(payment.payment)}</td>
              <td>${formatCurrency(payment.principal)}</td>
              <td>${formatCurrency(payment.interest)}</td>
              <td>${formatCurrency(payment.balance)}</td>
          `;

      amortizationBody.appendChild(row);
    });

    // Show table
    const tableSection = document.querySelector(".amortization-section");
    tableSection.style.display = "block";
  }

  /**
   * Create pie chart for payment breakdown
   * @param {number} principal - Principal amount
   * @param {number} interest - Total interest
   */
  function createPaymentChart(principal, interest) {
    // Clean up previous chart
    if (paymentChartInstance) {
      paymentChartInstance.destroy();
    }

    // Get theme colors
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    const textColor = theme === "dark" ? "#FFFFFF" : "#333333";

    // Create chart
    paymentChartInstance = new Chart(paymentChart, {
      type: "pie",
      data: {
        labels: ["Principal", "Interest"],
        datasets: [
          {
            data: [principal, interest],
            backgroundColor: [
              getComputedStyle(document.documentElement).getPropertyValue(
                "--chart-color-principal"
              ),
              getComputedStyle(document.documentElement).getPropertyValue(
                "--chart-color-interest"
              ),
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw;
                return `${context.label}: ${formatCurrency(value)}`;
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update charts with current theme colors
   */
  function updateCharts() {
    if (paymentChartInstance) {
      const theme =
        document.documentElement.getAttribute("data-theme") || "dark";
      const textColor = theme === "dark" ? "#FFFFFF" : "#333333";

      paymentChartInstance.options.plugins.legend.labels.color = textColor;
      paymentChartInstance.update();
    }

    if (comparisonChartInstance) {
      const theme =
        document.documentElement.getAttribute("data-theme") || "dark";
      const textColor = theme === "dark" ? "#FFFFFF" : "#333333";

      comparisonChartInstance.options.plugins.legend.labels.color = textColor;
      comparisonChartInstance.options.scales.x.ticks.color = textColor;
      comparisonChartInstance.options.scales.y.ticks.color = textColor;
      comparisonChartInstance.update();
    }
  }

  /**
   * Format number as currency
   * @param {number} value - Value to format
   * @returns {string} - Formatted currency string
   */
  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  /**
   * Toggle section visibility
   * @param {HTMLElement} content - Content element to toggle
   * @param {HTMLElement} toggle - Toggle element
   */
  function toggleSection(content, toggle) {
    content.classList.toggle("hidden");
    toggle.classList.toggle("active");
  }

  /**
   * Reset form to defaults
   */
  function resetForm() {
    // Reset to loan type defaults
    updateLoanPresets();

    // Reset advanced options
    downPaymentInput.value = 0;
    additionalPaymentInput.value = 0;
    taxInsuranceInput.value = 0;

    // Set today's date
    startDateInput.value = new Date().toISOString().split("T")[0];

    // Clear results
    monthlyPaymentEl.textContent = "$0.00";
    totalPaymentEl.textContent = "$0.00";
    totalInterestEl.textContent = "$0.00";

    // Clear table
    amortizationBody.innerHTML = "";

    // Destroy charts
    if (paymentChartInstance) {
      paymentChartInstance.destroy();
      paymentChartInstance = null;
    }
  }

  /**
   * Add current loan calculation to scenarios for comparison
   * @param {number} loanAmount - Principal amount
   * @param {number} interestRate - Interest rate
   * @param {number} termInMonths - Loan term in months
   * @param {string} frequency - Payment frequency
   * @param {number} monthlyPayment - Monthly payment amount
   * @param {number} totalPaid - Total amount paid
   * @param {number} totalInterest - Total interest paid
   */
  function addToScenarios(
    loanAmount,
    interestRate,
    termInMonths,
    frequency,
    monthlyPayment,
    totalPaid,
    totalInterest
  ) {
    // Create unique ID for this scenario
    const id = "scenario-" + Date.now();

    // Create scenario object
    const scenario = {
      id,
      name: getScenarioName(),
      loanAmount,
      interestRate,
      termInMonths,
      termType: currentTermType,
      frequency,
      monthlyPayment,
      totalPaid,
      totalInterest,
    };

    // Add to scenarios array
    scenarios.push(scenario);

    // Update comparison UI
    updateComparisonUI();
  }

  /**
   * Create a new scenario
   */
  function addScenario() {
    // Only calculate if there's a current calculation
    if (monthlyPaymentEl.textContent !== "$0.00") {
      // Toggle the comparison section if hidden
      if (comparisonContent.classList.contains("hidden")) {
        toggleSection(comparisonContent, comparisonToggle);
      }

      // Add current calculation to scenarios
      calculateLoan();
    }
  }

  /**
   * Generate name for new scenario
   * @returns {string} - Scenario name
   */
  function getScenarioName() {
    return `${
      currentLoanType.charAt(0).toUpperCase() + currentLoanType.slice(1)
    } Loan - ${formatCurrency(parseFloat(loanAmountInput.value))} @ ${parseFloat(interestRateInput.value)}%`;
  }

  /**
   * Update comparison UI with current scenarios
   */
  function updateComparisonUI() {
    // Clear container
    scenarioContainer.innerHTML = "";

    // Create cards for each scenario
    scenarios.forEach((scenario) => {
      const card = document.createElement("div");
      card.className = "scenario-card";
      card.dataset.id = scenario.id;

      card.innerHTML = `
              <div class="scenario-header">
                  <h3>${scenario.name}</h3>
                  <button class="delete-scenario" data-id="${scenario.id}">
                      <i class="fas fa-times"></i>
                  </button>
              </div>
              <p><strong>Loan Amount:</strong> ${formatCurrency(
                scenario.loanAmount
              )}</p>
              <p><strong>Interest Rate:</strong> ${scenario.interestRate}%</p>
              <p><strong>Term:</strong> ${
                scenario.termType === "years"
                  ? Math.floor(scenario.termInMonths / 12) + " years"
                  : scenario.termInMonths + " months"
              }</p>
              <p><strong>Payment:</strong> ${formatCurrency(
                scenario.monthlyPayment
              )}</p>
              <p><strong>Total Paid:</strong> ${formatCurrency(
                scenario.totalPaid
              )}</p>
              <p><strong>Total Interest:</strong> ${formatCurrency(
                scenario.totalInterest
              )}</p>
          `;

      scenarioContainer.appendChild(card);

      // Add delete event
      card
        .querySelector(".delete-scenario")
        .addEventListener("click", function () {
          deleteScenario(this.dataset.id);
        });
    });

    // Create comparison chart
    createComparisonChart();
  }

  /**
   * Delete scenario from comparison
   * @param {string} id - Scenario ID
   */
  function deleteScenario(id) {
    // Remove from array
    scenarios = scenarios.filter((scenario) => scenario.id !== id);

    // Update UI
    updateComparisonUI();
  }

  /**
   * Create comparison chart
   */
  function createComparisonChart() {
    // Only create chart if there are scenarios
    if (scenarios.length === 0) {
      if (comparisonChartInstance) {
        comparisonChartInstance.destroy();
        comparisonChartInstance = null;
      }
      return;
    }

    // Clean up previous chart
    if (comparisonChartInstance) {
      comparisonChartInstance.destroy();
    }

    // Prepare data
    const labels = scenarios.map((s) => s.name);
    const principalData = scenarios.map((s) => s.loanAmount);
    const interestData = scenarios.map((s) => s.totalInterest);

    // Get theme colors
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    const textColor = theme === "dark" ? "#FFFFFF" : "#333333";

    // Create chart
    comparisonChartInstance = new Chart(comparisonChart, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Principal",
            data: principalData,
            backgroundColor: getComputedStyle(
              document.documentElement
            ).getPropertyValue("--chart-color-principal"),
            borderWidth: 1,
          },
          {
            label: "Interest",
            data: interestData,
            backgroundColor: getComputedStyle(
              document.documentElement
            ).getPropertyValue("--chart-color-interest"),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: {
                family: "'Poppins', sans-serif",
                size: 10,
              },
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            ticks: {
              color: textColor,
              font: {
                family: "'Poppins', sans-serif",
              },
              callback: function (value) {
                return formatCurrency(value);
              },
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: textColor,
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw;
                return `${context.dataset.label}: ${formatCurrency(value)}`;
              },
            },
          },
        },
      },
    });
  }

  /**
   * Save current loan calculation results to localStorage
   */
  function saveResults() {
    // Get current calculation data
    const calculationData = {
      loanAmount: parseFloat(loanAmountInput.value),
      interestRate: parseFloat(interestRateInput.value),
      loanTerm: parseInt(loanTermInput.value),
      termType: currentTermType,
      downPayment: parseFloat(downPaymentInput.value) || 0,
      additionalPayment: parseFloat(additionalPaymentInput.value) || 0,
      taxInsurance: parseFloat(taxInsuranceInput.value) || 0,
      startDate: startDateInput.value,
      frequency: paymentFrequency.value,
      monthlyPayment: monthlyPaymentEl.textContent,
      totalPayment: totalPaymentEl.textContent,
      totalInterest: totalInterestEl.textContent,
      savedAt: new Date().toISOString(),
      scenarios: scenarios,
    };

    // Save to localStorage
    try {
      // Get existing saved calculations or create new array
      const savedCalculations =
        JSON.parse(localStorage.getItem("loanCalculations")) || [];

      // Add current calculation
      savedCalculations.unshift(calculationData);

      // Limit to 10 saved calculations
      const limitedCalculations = savedCalculations.slice(0, 10);

      // Save back to localStorage
      localStorage.setItem(
        "loanCalculations",
        JSON.stringify(limitedCalculations)
      );

      // Show success message
      showNotification("Calculation saved successfully!", "success");
    } catch (error) {
      // Show error message
      showNotification("Failed to save calculation: " + error.message, "error");
    }
  }

  /**
   * Print loan calculation results
   */
  function printResults() {
    // Create a printable version of the results
    const printWindow = window.open("", "_blank");

    // Get current date and time
    const currentDate = new Date().toLocaleString();

    // Get loan details
    const loanAmount = parseFloat(loanAmountInput.value);
    const interestRate = parseFloat(interestRateInput.value);
    const loanTerm = parseInt(loanTermInput.value);
    const termText = currentTermType === "years" ? "years" : "months";
    const frequency = paymentFrequency.value;

    // Get advanced options
    const downPayment = parseFloat(downPaymentInput.value) || 0;
    const additionalPayment = parseFloat(additionalPaymentInput.value) || 0;
    const taxInsurance = parseFloat(taxInsuranceInput.value) || 0;

    // Create printable content
    let printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Loan Calculator Results</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1, h2 {
                    color: #00a0c0;
                }
                .header {
                    border-bottom: 2px solid #00a0c0;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .results-container {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                .result-item {
                    text-align: center;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                    flex: 1;
                    margin: 0 10px;
                }
                .result-label {
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .result-value {
                    font-size: 1.2rem;
                    color: #00a0c0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 0.8rem;
                    color: #6c757d;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Loan Calculator Results</h1>
                <p>Generated: ${currentDate}</p>
            </div>
            
            <h2>Loan Details</h2>
            <ul>
                <li><strong>Loan Type:</strong> ${
                  currentLoanType.charAt(0).toUpperCase() +
                  currentLoanType.slice(1)
                }</li>
                <li><strong>Loan Amount:</strong> ${formatCurrency(
                  loanAmount
                )}</li>
                <li><strong>Interest Rate:</strong> ${interestRate}%</li>
                <li><strong>Loan Term:</strong> ${loanTerm} ${termText}</li>
                <li><strong>Payment Frequency:</strong> ${
                  frequency.charAt(0).toUpperCase() + frequency.slice(1)
                }</li>
            </ul>
            
            <h3>Advanced Options</h3>
            <ul>
                <li><strong>Down Payment:</strong> ${formatCurrency(
                  downPayment
                )}</li>
                <li><strong>Additional Monthly Payment:</strong> ${formatCurrency(
                  additionalPayment
                )}</li>
                <li><strong>Monthly Tax & Insurance:</strong> ${formatCurrency(
                  taxInsurance
                )}</li>
                <li><strong>Start Date:</strong> ${startDateInput.value}</li>
            </ul>
            
            <h2>Results Summary</h2>
            <div class="results-container">
                <div class="result-item">
                    <div class="result-label">Monthly Payment</div>
                    <div class="result-value">${
                      monthlyPaymentEl.textContent
                    }</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Total Payment</div>
                    <div class="result-value">${
                      totalPaymentEl.textContent
                    }</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Total Interest</div>
                    <div class="result-value">${
                      totalInterestEl.textContent
                    }</div>
                </div>
            </div>
    `;

    // Add amortization table if it exists
    if (amortizationBody.children.length > 0) {
      printContent += `
            <h2>Amortization Schedule</h2>
            <table>
                <thead>
                    <tr>
                        <th>Payment #</th>
                        <th>Payment Date</th>
                        <th>Payment Amount</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Remaining Balance</th>
                    </tr>
                </thead>
                <tbody>
        `;

      // Limit to first 24 payments and last payment for printing
      const tableRows = amortizationBody.children;
      const rowCount = tableRows.length;

      if (rowCount <= 25) {
        // If there are 25 or fewer rows, include all
        for (let i = 0; i < rowCount; i++) {
          printContent += tableRows[i].outerHTML;
        }
      } else {
        // Otherwise include first 24 and last row
        for (let i = 0; i < 24; i++) {
          printContent += tableRows[i].outerHTML;
        }

        printContent += `
                <tr>
                    <td colspan="6" style="text-align: center;">... ${
                      rowCount - 25
                    } payments omitted ...</td>
                </tr>
                ${tableRows[rowCount - 1].outerHTML}
            `;
      }

      printContent += `
                </tbody>
            </table>
        `;
    }

    // Add footer
    printContent += `
            <div class="footer">
                <p>This document is for informational purposes only and does not constitute a loan offer or commitment.</p>
                <p>Advanced Loan Calculator &copy; ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;

    // Write content to print window and print
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for resources to load before printing
    printWindow.onload = function () {
      printWindow.print();
    };
  }

  /**
   * Export calculation results to PDF
   * Note: This is a simplified version that prompts print dialog in PDF mode
   * For real PDF generation, a library like jsPDF would be needed
   */
  function exportToPDF() {
    // For now, we'll just use the print function and let the user save as PDF
    printResults();

    // Show message to user
    showNotification('Please select "Save as PDF" in the print dialog', "info");

    // In a production app, we would use a proper PDF library like jsPDF:
    /*
    // Example with jsPDF (would require including the library)
    const doc = new jsPDF();
    
    // Add content
    doc.text("Loan Calculator Results", 20, 20);
    doc.text(`Loan Amount: ${formatCurrency(parseFloat(loanAmountInput.value))}`, 20, 30);
    // ... add more content ...
    
    // Save PDF
    doc.save("loan-calculation.pdf");
    */
  }

  /**
   * Show notification message
   * @param {string} message - Message to display
   * @param {string} type - Notification type ('success', 'error', 'info')
   */
  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    // Add icon based on type
    let icon = "info-circle";
    if (type === "success") icon = "check-circle";
    if (type === "error") icon = "exclamation-circle";

    // Set content
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Add show class after a brief delay (for animation)
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Add close button functionality
    const closeButton = notification.querySelector(".notification-close");
    closeButton.addEventListener("click", () => {
      closeNotification(notification);
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      closeNotification(notification);
    }, 5000);
  }

  /**
   * Close notification
   * @param {HTMLElement} notification - Notification element to close
   */
  function closeNotification(notification) {
    // Remove show class to trigger fade-out animation
    notification.classList.remove("show");

    // Remove element after animation completes
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
});
