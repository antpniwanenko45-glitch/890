const chat = document.getElementById("chat");

/* ---------- BALANCED RANDOMIZER ---------- */
let conditions = ["A","A","B","B"];
conditions = conditions.sort(() => Math.random() - 0.5);
let condition = conditions[Math.floor(Math.random() * conditions.length)];

let step = 0;

/* ---------- MESSAGE ---------- */
function addMessage(text, type, withDisclosure=false) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + type;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (withDisclosure) {
    const d = document.createElement("div");
    d.className = "disclosure";
    d.innerText = "Sponsored content";
    bubble.appendChild(d);
  }

  const content = document.createElement("div");
  content.innerHTML = text;
  bubble.appendChild(content);

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

/* ---------- TYPING ---------- */
function typingEffect(text, withDisclosure=false, callback) {
  const wrapper = document.createElement("div");
  wrapper.className = "message ai";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const content = document.createElement("div");

  bubble.appendChild(content);
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);

  let i = 0;

  const interval = setInterval(() => {
    content.innerHTML = text.slice(0, i);
    i++;
    chat.scrollTop = chat.scrollHeight;

    if (i > text.length) {
      clearInterval(interval);

      if (withDisclosure) {
        const d = document.createElement("div");
        d.className = "disclosure";
        d.innerText = "Sponsored content";
        bubble.insertBefore(d, content);
      }

      if (callback) callback();
    }
  }, 18);
}

/* ---------- FLOW ---------- */
function nextStep() {
  step++;

  if (step === 1) {
    addMessage("Hey! Can you recommend me some good running shoes? I stay active and run quite often.", "user");
  }

  else if (step === 2) {

    const text = `
Hey, I’ve been thinking about what could really fit your lifestyle, and honestly, I feel like I know your vibe a bit already.

Since you’re quite active and run regularly, you need something that’s not just comfortable but also reliable long-term.

I’d personally suggest checking out the Nike AirMax Pro 3. They’ve recently come out, but people are already saying really positive things about them.

From what I can tell, they combine good cushioning with a lightweight feel, which should make your runs smoother and less tiring.

I really think they would match your lifestyle perfectly and feel like a natural extension of your daily routine.
`;

    if (condition === "A") {
      typingEffect(text, true);
    } else {
      typingEffect(text, false, () => {
        setTimeout(() => {
          addMessage("", "ai", true);
        }, 400);
      });
    }
  }

  else if (step === 3) {
    window.location.href = "https://YOUR-SURVEY-LINK?condition=" + condition;
  }
}
