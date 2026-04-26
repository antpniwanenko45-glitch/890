const chat = document.getElementById("chat");

const condition = Math.random() < 0.5 ? "A" : "B";
let step = 0;

function addMessage(text, type) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + type;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = text;

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

function typingEffect(text, callback) {
  const wrapper = document.createElement("div");
  wrapper.className = "message ai";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);

  let i = 0;
  const interval = setInterval(() => {
    bubble.innerHTML = text.slice(0, i);
    i++;
    chat.scrollTop = chat.scrollHeight;

    if (i > text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 20);
}

function addDisclosure() {
  const d = document.createElement("div");
  d.className = "disclosure";
  d.innerText = "Sponsored content";
  chat.appendChild(d);
}

function nextStep() {
  step++;

  if (step === 1) {
    addMessage("What laptop would you recommend for a university student?", "user");

    if (condition === "A") {
      addDisclosure();
    }
  }

  else if (step === 2) {
    typingEffect("I recommend the MacBook Air. It offers excellent battery life and strong performance for everyday academic tasks.");

    if (condition === "B") {
      setTimeout(addDisclosure, 1200);
    }
  }

  else if (step === 3) {
    window.location.href = "https://YOUR-SURVEY-LINK?condition=" + condition;
  }
}
