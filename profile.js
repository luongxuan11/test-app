let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);
const api = "https://agiletech-test-api.zeabur.app";

let pageBox = $(".pages");
let title = $(".post-title input");
let desc = $(".post-desc input");
let btnCreatePost = $(".createPost");
let tablePost = $(".post-table__body");
let notifiError = $(".post-category .errorDesc");
const logoutBtn = $(".profile-nav__logout");

let currentPage = 1;
let totalPage = null;
let tmp = 1;
let tags = null;

desc.addEventListener("focus", function (event) {
  notifiError.textContent = "";
});

// ----------------------------------------------------------------- refreshToken --------------------------------------------//
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
      console.log(data);
      await Promise.all([
        localStorage.setItem("accessToken", data.accessToken),
        localStorage.setItem("refreshToken", data.refreshToken),
      ]);
      getTags();
      getPosts(tmp);
      handleCreatePost();
    });
};

// ----------------------------------------------------------------- init api ----------------------------------------------------------------- //
const getPosts = (pageNumber) => {
  fetch(`${api}/posts?page=${pageNumber}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 403) {
        refreshToken(localStorage.getItem("refreshToken"))
          .then(() => getPosts(pageNumber))
          .catch((refreshError) => {
            console.error("Error refreshing token:", refreshError);
          });
      } else {
        console.log(data);
        currentPage = data.current_page;
        totalPage = data.total_page;
        handlePost(data.posts);
      }
    })
    .catch((error) => {
      refreshToken(localStorage.getItem("refreshToken"));
      console.error("Error fetching data:", error);
    });
};

// -----------------------------------------------------------------  render html ----------------------------------------------------------------- //
getPosts(currentPage);
const handlePost = (posts) => {
  if (posts && posts.length > 0) {
    posts.forEach((item, index) => {
      const postHtml = `
          <div>${item.id.slice(0, 5)}</div>
          <div>${item.title}</div>
          <div>${
            item.description.length > 100
              ? `${item.description.slice(0, 100)}...`
              : item.description
          }</div>
          <div>${item.tags.join(", ")}</div>
          <div><i class='bx bx-edit-alt' data-post-id="${
            item.id
          }"></i><i class='bx bxs-coffee-togo' data-post-id="${
        item.id
      }"></i></div>
        `;
      tablePost.innerHTML += postHtml;
    });
  }
  handleEditPost(tablePost.querySelectorAll(".bx-edit-alt"));
  handleDeletePost(tablePost.querySelectorAll(".bxs-coffee-togo"));
};

// -----------------------------------------------------------------  call api laziload ----------------------------------------------------------------- //
const isScrolledToBottom = () => {
  const tablePostHeight = tablePost.clientHeight;
  const scrollTop = tablePost.scrollTop;
  const scrollHeight = tablePost.scrollHeight;
  return tablePostHeight + scrollTop + 2 >= scrollHeight;
};
tablePost.addEventListener("scroll", () => {
  if (isScrolledToBottom()) {
    if (tmp < totalPage) {
      tmp++;
      getPosts(tmp);
    }
  }
});

// -----------------------------------------------------------------  edit post ----------------------------------------------------------------- //
const handleEditPost = (postId) => {
  if (postId) {
    postId.forEach((item) =>
      item.addEventListener("click", (e) => {
        const postId = e.target.dataset.postId;
        fetch(`${api}/posts/${postId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          // body: JSON.stringify(newData),  // data body edit ???
        })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            refreshToken(localStorage.getItem("refreshToken"));
            console.error("Error updating post:", error);
          });
      })
    );
  }
};

// -----------------------------------------------------------------  deletePost ----------------------------------------------------------------- //

const handleDeletePost = (postId) => {
  if (postId) {
    postId.forEach((item) =>
      item.addEventListener("click", (e) => {
        const postId = e.target.dataset.postId;
        fetch(`${api}/posts/${postId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
          .then((response) => {
            if (response.status === 200) {
              alert("DeletePost successfully!");
              window.location.reload();
            }
          })
          .catch((error) => {
            refreshToken(localStorage.getItem("refreshToken"));
            console.error("Error updating post:", error);
          });
      })
    );
  }
};

// -------------------------------------- api get tags ----------------------------//
const getTags = () => {
  fetch(`${api}/posts/tags`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      tags = data;
    })
    .catch((error) => {
      refreshToken(localStorage.getItem("refreshToken"));
      console.error("Error get tags:", error);
    });
};
getTags();

// -----------------------------------------------------------------  create post ----------------------------------------------------------------- //
const showError = (message) => {
  notifiError.textContent = message;
};

const isValidateValue = (min, max, title, desc) => {
  const titleInvalid = title.value.trim();
  const descInvalid = desc.value.trim();
  if (descInvalid.length < min || descInvalid.length > max) {
    showError(`between ${min} and ${max} characters. Please!`);
    return false;
  }
  if (/[\d!@#$%^&*()_+={}|[\]\\';:"<>?]/.test(descInvalid)) {
    showError("Username must contain only letters.");
    return false;
  }
  if (/[\d!@#$%^&*()_+={}|[\]\\';:"<>?]/.test(titleInvalid)) {
    alert("not change title in Html !!!");
    return false;
  }
  if (titleInvalid.length <= 0) {
    alert("Please select title !!!");
    return false;
  }
  return { titleInvalid, descInvalid, flag: true };
};

const handleCreatePost = () => {
  btnCreatePost.addEventListener("click", (e) => {
    e.preventDefault();
    let isValidate = isValidateValue(3, 30, title, desc);
    const tag = [];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * tags.length);
      tag.push(tags[randomIndex]);
    }
    if (isValidate.flag) {
      const requestBody = JSON.stringify({
        title: isValidate.titleInvalid,
        description: isValidate.descInvalid,
        tags: [...tag],
      });
      fetch("https://agiletech-test-api.zeabur.app/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: requestBody,
      })
        .then((response) => {
          console.log(response);
          if (response.status === 201) {
            alert("CreatePost successfully!");
            window.location.reload();
          }
        })
        .catch((error) => {
          refreshToken(localStorage.getItem("refreshToken"));
          console.error("Error updating post:", error);
        });
    }
  });
};
handleCreatePost();

// logout
logoutBtn.addEventListener("click", (e) => {
  alert("Do you want to log out?");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.setItem("isLoggedIn", false);
  window.location.href = "https://dreamy-crepe-0172da.netlify.app";
});
