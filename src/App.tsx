import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import AceEditor from "./AceEditor";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <AceEditor />
        </div>
      </header>
    </div>
  );
}

export default App;
