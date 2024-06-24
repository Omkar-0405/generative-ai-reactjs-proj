import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { createContext, useState, useEffect } from "react";

const GenerativeAIContext = createContext({
  apiKey: "",
  getGenerativeModel: () => {},
  fileToGenerativePart: () => {},
  //   scrollToDocumentBottom: () => {},
  //   updateUI: () => {},
});

const GenerativeAIProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Fetch API key logic (similar to getGenerativeModel)
    const fetchApiKey = async () => {
      const API_KEY =
        process.env.API_KEY || "AIzaSyBrfql1a8RNw2uKqT2Mni8HYr-SZYDaK2U";
      setApiKey(API_KEY);
    };
    fetchApiKey();
  }, []);

  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  function scrollToDocumentBottom() {
    const scrollingElement = document.scrollingElement || document.body;
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  }

  //   async function updateUI(resultEl, getResult, streaming) {
  //     resultEl.className = "loading";
  //     let text = "";
  //     try {
  //       const result = await getResult();

  //       if (streaming) {
  //         resultEl.innerText = "";
  //         for await (const chunk of result.stream) {
  //           // Get first candidate's current text chunk
  //           const chunkText = chunk.text();
  //           text += chunkText;
  //           resultEl.innerHTML = marked.parse(text);
  //           scrollToDocumentBottom();
  //         }
  //       } else {
  //         const response = await result.response;
  //         text = response.text();
  //       }

  //       resultEl.className = ""; // Remove .loading class
  //     } catch (err) {
  //       text += "\n\n> " + err;
  //       resultEl.className = "error";
  //     }
  //     resultEl.innerHTML = marked.parse(text);
  //     scrollToDocumentBottom();
  //   }

  return (
    <GenerativeAIContext.Provider
      value={{
        apiKey,
        getGenerativeModel: async (params) => {
          const genAI = new GoogleGenerativeAI(apiKey);
          return genAI.getGenerativeModel(params);
        },
        fileToGenerativePart,
        scrollToDocumentBottom,
        // updateUI,
      }}
    >
      {children}
    </GenerativeAIContext.Provider>
  );
};

export { GenerativeAIContext, GenerativeAIProvider };
