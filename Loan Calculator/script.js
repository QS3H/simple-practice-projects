const calculateLoan = () => {
  const loanAmount = document.getElementById("loan-amount").value;
  const interestRate = document.getElementById("interest-rate").value;
  const monthsToPay = document.getElementById("months-to-pay").value;

  interest = (loanAmount * interestRate * 0.01) / monthsToPay;
  monthlyPayment = loanAmount / monthsToPay + interest;

  document.getElementById(
    "monthly-payment"
  ).innerHTML = `Monthly Payment: $${monthlyPayment.toFixed(2)}`;
};
