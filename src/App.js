import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import "./App.css";
import { GenerativeAIProvider } from "./context/GenerativeAIContext";
import GenerativeAI from "./components/GenerativeAI";

function App() {
  return (
    <>
      <GenerativeAIProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<GenerativeAI />} />
          </Routes>
        </BrowserRouter>
      </GenerativeAIProvider>
    </>
  );
}

export default App;
