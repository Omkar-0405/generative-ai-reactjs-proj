import React, { useState, useEffect, useContext } from "react";
import { GenerativeAIContext } from "../context/GenerativeAIContext";
import { marked } from "https://esm.run/marked";

const GenerativeAI = () => {
  const {
    apiKey,
    getGenerativeModel,
    fileToGenerativePart,
    scrollToDocumentBottom,
  } = useContext(GenerativeAIContext);

  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [resultStream, setResultStream] = useState("");
  const [copyNotification, setCopyNotification] = useState(null); // New state for notification

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles(newFiles);
    setThumbnails([]); // Clear thumbnails on new file selection
    newFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setThumbnails((prevThumbnails) => [...prevThumbnails, url]);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(""); // Clear previous result

    const imageParts = await Promise.all(files.map(fileToGenerativePart));

    try {
      const model = await getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });
      const response = await model.generateContentStream([
        ...imageParts,
        prompt,
      ]);
      setResult(response); // Update result with generated content
    } catch (error) {
      console.error("Error:", error);
      setResult("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      thumbnails.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbnails]);

  useEffect(() => {
    const updateUI = async (streaming = true) => {
      setResultStream("loading...");
      let text = "";
      try {
        if (result.stream) {
          if (streaming) {
            setResultStream("");
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              text += chunkText;
              setResultStream(marked.parse(text));
              scrollToDocumentBottom();
            }
          } else {
            const response = await result.response;
            text = response.text();
          }
        }
      } catch (err) {
        text += "\n\n> " + err;
        console.error(err);
      }
      setResultStream(marked.parse(text));
      scrollToDocumentBottom();
    };

    if (result) updateUI();
  }, [result, scrollToDocumentBottom]);

  // Function to copy resultStream to clipboard
  const handleCopy = () => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = resultStream;
    const plainText = tempElement.innerText || tempElement.textContent;

    navigator.clipboard
      .writeText(plainText)
      .then(() => {
        setCopyNotification("Copied to clipboard!");
        setTimeout(() => setCopyNotification(null), 2000); // Hide after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setCopyNotification("Failed to copy.");
        setTimeout(() => setCopyNotification(null), 2000); // Hide after 2 seconds
      });
  };

  return (
    <div className="container">
      <header>Generative AI - Text and Image</header>
      <form id="form" onSubmit={handleSubmit}>
        <div className="file-upload-container">
          <input
            type="file"
            id="file"
            multiple
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="file" className="file-upload-label">
            <span className="file-upload-text">
              Choose files from the device
            </span>
          </label>
        </div>
        <input
          type="text"
          id="prompt"
          placeholder="Enter your prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Send"}
        </button>
      </form>

      {thumbnails.length > 0 && (
        <div id="thumbnails">
          {thumbnails.map((url) => (
            <img key={url} className="thumb" src={url} alt="Uploaded image" />
          ))}
        </div>
      )}
      <div className="result-container">
        <blockquote
          id="result"
          dangerouslySetInnerHTML={{ __html: resultStream }}
        />
        {resultStream && resultStream !== "loading..." && (
          <>
            <button className="copy-button" onClick={handleCopy}>
              Copy
            </button>
            {copyNotification && (
              <span className="copy-notification">{copyNotification}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenerativeAI;
