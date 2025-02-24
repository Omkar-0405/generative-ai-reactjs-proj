import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { createContext } from "react";

const GenerativeAIContext = createContext({
  apiKey: "",
  getGenerativeModel: () => {},
  fileToGenerativePart: () => {},
  scrollToDocumentBottom: () => {},
});

const GenerativeAIProvider = ({ children }) => {
  const apiKey = process.env.REACT_APP_API_KEY;

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
      }}
    >
      {children}
    </GenerativeAIContext.Provider>
  );
};

export { GenerativeAIContext, GenerativeAIProvider };
