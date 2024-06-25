import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { GenerativeAIProvider } from "./context/GenerativeAIContext";
import GenerativeAI from "./components/GenerativeAI";

function App() {
  return (
    <>
      <GenerativeAIProvider REACT_APP_API_KEY={process.env.REACT_APP_API_KEY}>
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
