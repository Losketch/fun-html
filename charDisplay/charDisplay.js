const input = document.getElementById("text");
const boldStatus = document.getElementById("boldStatus");
const italicStatus = document.getElementById("italicStatus");

const selectBold = () => {
  if (input.style.fontWeight === "bold") {
    input.style.fontWeight = "normal";
    boldStatus.innerHTML = "：关";
  } else {
    input.style.fontWeight = "bold";
    boldStatus.innerHTML = "：开";
  }
}
const selectItalic = () => {
  if (input.style.fontStyle === "italic") {
    input.style.fontStyle = "normal";
    italicStatus.innerHTML = "：关";
  } else {
    input.style.fontStyle = "italic";
    italicStatus.innerHTML = "：开";
  }
}