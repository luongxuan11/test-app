let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);
const api = "https://agiletech-test-api.zeabur.app";

const option = $(".bx.bx-cog");
const optionActive = $(".option-slide");
const optionBack = $(".bx.bx-right-arrow-alt.option");
const list = $(".list__wrapper");
const back = $(".bx-left-arrow-alt.icon-left");
const next = $(".bx-right-arrow-alt.icon-right");
const userInfo = $(".user-info > .user-info__span");
const btnSignIn = $$(".signIn");
const btnLogged = $$(".logged");
const logout = $$(".nav-btn--active--out");

option.addEventListener("click", function () {
  optionActive.classList.add("option-slide--active");
});

optionBack.addEventListener("click", function () {
  optionActive.classList.remove("option-slide--active");
});

// check login
// let headers;
let isLoggedIn = localStorage.getItem("isLoggedIn");
// const accessToken = localStorage.getItem("accessToken");
(function () {
  if (!isLoggedIn) {
    localStorage.setItem("isLoggedIn", false);
  }
  // headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
})();

function updateLoginStatus(isLoggedIn) {
  if (isLoggedIn === "true") {
    btnSignIn.forEach((item) => {
      item.classList.add("hidden");
    });
    btnLogged.forEach((item) => {
      item.classList.remove("hidden");
    });
  } else {
    btnLogged.forEach((item) => {
      item.classList.add("hidden");
    });
    btnSignIn.forEach((item) => {
      item.classList.remove("hidden");
    });
  }
}
updateLoginStatus(isLoggedIn);

// call data img
let active = 0;
fetch(`${api}/galleries`)
  .then((response) => response.json())
  .then((data) => {
    if (data && data.length) {
      data.forEach((item, index) => {
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.desctiption;
        img.classList.add("list__wrapper--item");
        img.style.display = index === 0 ? "block" : "none";
        list.appendChild(img);
      });

      const listItem = $$(".list__wrapper--item");
      updateDescription(data[active].desctiption);

      next.addEventListener("click", () => {
        changeSlide(listItem, data, 1);
      });

      back.addEventListener("click", () => {
        changeSlide(listItem, data, -1);
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

const changeSlide = (items, data, direction) => {
  items[active].style.display = "none";
  active += direction;
  if (active >= items.length) {
    active = 0;
  } else if (active < 0) {
    active = items.length - 1;
  }
  items[active].style.display = "block";
  updateDescription(data[active].desctiption, active);
};

const updateDescription = (description, active) => {
  userInfo.textContent = description;
};

const refreshToken = (refreshToken) => {
  console.log(JSON.stringify({ refreshToken: refreshToken }));
  fetch(`${api}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: refreshToken }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .then(async (data) => {
      await Promise.all([
        localStorage.setItem("accessToken", data.accessToken),
        localStorage.setItem("refreshToken", data.refreshToken),
      ]);
      handleLogout();
    });
};

// logout
if (logout) {
  logout.forEach((item) =>
    item.addEventListener("click", () => {
      handleLogout();
    })
  );
}

const handleLogout = () => {
  fetch(`${api}/auth/logout`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 204) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("isLoggedIn", false);
        window.location.reload();
      } else {
        refreshToken(localStorage.getItem("refreshToken"));
      }
    })
    .catch((error) => {
      refreshToken(localStorage.getItem("refreshToken"));
      console.error("Error fetching data:", error);
    });
};
