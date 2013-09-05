
function save_options() {
  var host = document.getElementById("host").value;
  localStorage["host"] = host;
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var host = localStorage["host"];
  if (!host) {
    host = 'ganlu.name/me';
    localStorage["host"] = host;
  }
  var text = document.getElementById("host");
  text.value = host;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

