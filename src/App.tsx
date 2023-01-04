import React, { useState } from "react";

function App() {
  const [board, setBoard] = useState<string[][]>([
      ["rd", "nd", "bd", "qd", "kd", "bd", "nd", "rd"],
      ["pd", "pd", "pd", "pd", "pd", "pd", "pd", "pd"],
      ["_", "_", "_", "_", "_", "_", "_", "_"],    
      ["_", "_", "_", "_", "_", "_", "_", "_"],
      ["_", "_", "_", "_", "_", "_", "_", "_"],
      ["_", "_", "_", "_", "_", "_", "_", "_"],
      ["pl", "pl", "pl", "pl", "pl", "pl", "pl", "pl"],
      ["rl", "nl", "bl", "ql", "kl", "bl", "nl", "rl"]
  ]);

  return (
    <div>
        Hello.
    </div>
  );
}

export default App;