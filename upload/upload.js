addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file");
  const progressBar = document.querySelector("progress");
  const log = document.querySelector("output");

  fileInput.addEventListener("change", () => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 60 * 1000; // 1 minute

    // When the upload starts, we display the progress bar
    xhr.upload.addEventListener("loadstart", (event) => {
      progressBar.classList.add("visible");
      progressBar.value = 0;
      progressBar.max = event.total;
      log.textContent = "Uploading (0%)…";
    });

    // Each time a progress event is received, we update the bar
    xhr.upload.addEventListener("progress", (event) => {
      progressBar.value = event.loaded;
      log.textContent = `Uploading (${(
        (event.loaded / event.total) *
        100
      ).toFixed(2)}%)…`;
    });

    // When the upload is finished, we hide the progress bar.
    xhr.upload.addEventListener("loadend", (event) => {
      progressBar.classList.remove("visible");
      if (event.loaded !== 0) {
        log.textContent = "上传成功";
      }
    });

    // In case of an error, an abort, or a timeout, we hide the progress bar
    // Note that these events can be listened to on the xhr object too
    function errorAction(event) {
      progressBar.classList.remove("visible");
      log.textContent = `Upload failed: ${event.type}`;
    }
    xhr.upload.addEventListener("error", errorAction);
    xhr.upload.addEventListener("timeout", errorAction);

    // Build the payload
    const fileData = new FormData();
    const fileName = fileInput.files[0] ? fileInput.files[0].name : null;
    const regex = /.jpg|.png|.gif|.jpeg|.svg/gi;
    console.log(fileName)
    if (fileName.match(regex)) {
      fileData.append("file", fileInput.files[0]);
      // Theoretically, event listeners could be set after the open() call
      // but browsers are buggy here
      xhr.open("POST", "https://sberm.cn/upload-file", true);
      // Note that the event listener must be set before sending (as it is a preflighted request)
      xhr.send(fileData);
    } else {
      log.textContent = "请上传图片";
    }
  });
});
