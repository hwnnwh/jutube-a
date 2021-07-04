const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const delBtns = document.querySelectorAll(".delBtns");
const sendBtn = document.getElementById("sendBtn");

const handleDelete = async (event) => {
  const targetComment = event.target.parentElement;
  const { id } = event.target.parentElement.dataset;
  const response = await fetch(`/api/comments/${id}/delete`, {
    method: "DELETE",
  });
  if (response.status === 204) {
    targetComment.remove();
  }
};

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  const iconComment = document.createElement("i");
  const span = document.createElement("span");
  const iconDelete = document.createElement("i");

  newComment.className = "video__comment";
  iconComment.className = "fas fa-comment";
  iconDelete.className = "fas fa-times";
  span.innerText = ` ${text}`;

  newComment.appendChild(iconComment);
  newComment.appendChild(span);
  newComment.appendChild(iconDelete);
  videoComments.prepend(newComment);
  newComment.dataset.id = id;
  iconDelete.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const { id } = videoContainer.dataset;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    const { newCommentId } = await response.json();
    textarea.value = "";
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

for (const delBtn of delBtns) {
  delBtn.addEventListener("click", handleDelete);
}
