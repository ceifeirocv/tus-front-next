"use client";
import { useState } from "react";
import * as tus from "tus-js-client";

export default function Home() {
  const [progress, setProgress] = useState(0);
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget; // safer and more correct than e.target
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    if (!fileInput || !fileInput.files) {
      return;
    }

    var file = fileInput?.files[0];

    console.log({ file });

    // Create a new tus upload
    var upload = new tus.Upload(file, {
      endpoint: `https://tus-express.onrender.com/uploads`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError: function (error) {
        console.log("Failed because: " + error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + "%");
        setProgress(Number(percentage));
      },
      onSuccess: function () {
        console.log(
          "Download %s from %s",
          (upload.file as File).name,
          upload.url
        );
      },
    });

    console.log({ upload });

    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      // Start the upload
      upload.start();
    });
  }
  return (
    <div className="p-10">
      <form onSubmit={handleSubmit}>
        File:
        <input type="file" name="file" /> <br />
        <input type="submit" name="submit" value="Upload to Amazon S3" />
      </form>
      {progress && <p>{progress}%</p>}
    </div>
  );
}
