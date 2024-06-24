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
  const [resultStream, setResultStream] = useState();

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
        if (result.stream)
          if (streaming) {
            setResultStream("");
            for await (const chunk of result.stream) {
              // Get first candidate's current text chunk
              const chunkText = chunk.text();
              text += chunkText;
              setResultStream(marked.parse(text));
              scrollToDocumentBottom();
            }
          } else {
            const response = await result.response;
            text = response.text();
          }
      } catch (err) {
        text += "\n\n> " + err;
        console.error(err);
      }
      setResultStream(marked.parse(text));
      scrollToDocumentBottom();
    };

    updateUI();
  }, [result]);

  return (
    <div className="container">
      <header>Generative AI - Text and Image</header>
      <form id="form" onSubmit={handleSubmit}>
        <input type="file" id="file" multiple onChange={handleFileChange} />
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
      <blockquote
        id="result"
        dangerouslySetInnerHTML={{ __html: resultStream }}
      />
    </div>
  );
};

export default GenerativeAI;
