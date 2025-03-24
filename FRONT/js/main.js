function main() {
  const showBtn = document.querySelector(".show");
  const surveyContainer = document.getElementById("surveyContainer");
  const submitBtn = document.getElementById("submitBtn");

  const data = {
    Questions: [
      {
        Name: "Квартира с мебелью?",
        SubquestionsByAnswer: {
          Да: [
            {
              Name: "Укажите тип мебели:",
              SubquestionsByAnswer: {
                Новая: [{ Name: "Приложите чек о покупке." }],
                "Б/у": [{ Name: "Укажите год приобретения:" }],
              },
            },
          ],
          Нет: [{ Name: "Арендатор обязан приобрести мебель самостоятельно." }],
        },
      },
      {
        Name: "Наличие животных?",
        SubquestionsByAnswer: {
          Да: [{ Name: "Вид животного:" }, { Name: "Количество:" }],
        },
      },
    ],
  };

  let answers = {};

  function initSurvey() {
    surveyContainer.innerHTML = "";
    submitBtn.style.display = "block";
    answers = {};
    renderQuestions(data.Questions, surveyContainer);
  }

  function renderQuestions(questions, container) {
    questions.forEach((question) => {
      const questionDiv = document.createElement("div");
      questionDiv.className = "question-block";
      questionDiv.innerHTML = `<h3>${question.Name}</h3>`;

      const answersDiv = document.createElement("div");
      Object.keys(question.SubquestionsByAnswer).forEach((answer) => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = answer;
        btn.onclick = () => handleAnswer(question, answer, questionDiv);
        answersDiv.appendChild(btn);
      });

      questionDiv.appendChild(answersDiv);
      container.appendChild(questionDiv);
    });
  }

  function handleAnswer(question, answer, parentContainer) {
    const existingSubs = parentContainer.getElementsByClassName("subquestion");
    while (existingSubs[0]) existingSubs[0].remove();

    answers[question.Name] = answer;

    const subquestions = question.SubquestionsByAnswer[answer];
    if (subquestions && subquestions.length > 0) {
      const subContainer = document.createElement("div");
      subContainer.className = "subquestion";
      subContainer.style.marginLeft = "20px";
      renderQuestions(subquestions, subContainer);
      parentContainer.appendChild(subContainer);
    }
  }

  function generateContract() {
    let contractText = "ДОГОВОР АРЕНДЫ\n\n";

    const processQuestions = (questions, level = 0) => {
      questions.forEach((q) => {
        const answer = answers[q.Name];
        contractText += `${"  ".repeat(level)}- ${q.Name}: ${
          answer || "Не указано"
        }\n`;
        if (answer && q.SubquestionsByAnswer[answer]) {
          processQuestions(q.SubquestionsByAnswer[answer], level + 1);
        }
      });
    };

    processQuestions(data.Questions);
    document.getElementById("contractOutput").textContent = contractText;
  }

  showBtn.addEventListener("click", () => {
    initSurvey();
  });

  submitBtn.addEventListener("click", () => {
    generateContract();
  });
}

setTimeout(() => {
  main();
}, 1000);
