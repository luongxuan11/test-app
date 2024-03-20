let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);

const username = document.getElementById("userName");
const form = $("form");
const notifiError = $(".alert");

function showError(message) {
  notifiError.textContent = message;
}

username.addEventListener("focus", function (event) {
  notifiError.textContent = "";
});

const validate = (min, max, input) => {
  const value = input.value.trim();
  if (value.length < min || value.length > max) {
    showError(`Username must be between ${min} and ${max} characters.`);
    return false;
  }
  if (/[\d!@#$%^&*()_+={}|[\]\\';:"<>?]/.test(value)) {
    showError("Username must contain only letters.");
    return false;
  }
  return true;
};

const handleAllForm = () => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let validateUserName = validate(3, 30, username);

    // call api login
    if (validateUserName) {
      const formData = new FormData(form);
      const requestBody = JSON.stringify({ username: username.value });
      fetch("https://agiletech-test-api.zeabur.app/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Network response was not ok.");
          }
        })
        .then(async (data) => {
          if (data.code === 401) {
            return showError("Account does not exist.");
          }
          const check = await Promise.all([
            localStorage.setItem("accessToken", data.accessToken),
            localStorage.setItem("refreshToken", data.refreshToken),
            localStorage.setItem("isLoggedIn", true),
          ]);
          if (check)
            return (window.location.href =
              "https://dreamy-crepe-0172da.netlify.app/test/index.html");
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    }
  });
};

handleAllForm();
