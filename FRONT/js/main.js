function generateQuestionId(prefix, index) {
  return `question-${prefix}${index + 1}`;
}

function renderQuestions(questions, container, level, prefix = "") {
  if (!questions || questions.length === 0) {
    return;
  }

  questions.forEach((question, index) => {
    const questionNumber = `${prefix}${index + 1}`;
    const questionId = generateQuestionId(prefix, index);

    const questionBlock = document.createElement("div");
    questionBlock.className = "question-block";
    questionBlock.dataset.questionId = questionId;

    const questionTitle = document.createElement("h3");
    questionTitle.textContent = `${questionNumber}. ${question.name}`;
    questionBlock.appendChild(questionTitle);

    const answerContainer = document.createElement("div");
    answerContainer.className = "answer-container";

    const subQuestionOuterContainerId = `subquestions-for-${questionId}`;
    const subQuestionOuterContainer = document.createElement("div");
    subQuestionOuterContainer.id = subQuestionOuterContainerId;
    subQuestionOuterContainer.className = "subquestion-outer-container";

    if (question.questionType === 1) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "answer-input";
      input.placeholder = `Введите ответ на вопрос ${questionNumber}`;
      input.name = questionId;
      input.onchange = (event) =>
        handleAnswer(question, event.target.value, questionBlock, questionId);
      if (userAnswers[questionId]) {
        input.value = userAnswers[questionId];
      }
      answerContainer.appendChild(input);
    } else if (question.questionType === 0) {
      const possibleAnswers = Object.keys(question.subQuestionsByAnswer || {});

      if (possibleAnswers.length > 0) {
        possibleAnswers.forEach((answerText) => {
          const answerDiv = document.createElement("div");
          answerDiv.className = "answer-option";

          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = questionId;
          radio.value = answerText;
          radio.id = `${questionId}-answer-${answerText.replace(/\s+/g, "-")}`;
          if (userAnswers[questionId] === answerText) {
            radio.checked = true;
          }

          radio.onchange = (event) =>
            handleAnswer(
              question,
              event.target.value,
              questionBlock,
              questionId
            );

          const label = document.createElement("label");
          label.htmlFor = radio.id;
          label.textContent = answerText;

          answerDiv.appendChild(radio);
          answerDiv.appendChild(label);
          answerContainer.appendChild(answerDiv);

          const subContainerId = `subquestions-for-${questionId}-answer-${answerText.replace(
            /\s+/g,
            "-"
          )}`;
          const subContainer = document.createElement("div");
          subContainer.id = subContainerId;
          subContainer.className = "subquestion-container";
          subContainer.style.display = "none";
          subQuestionOuterContainer.appendChild(subContainer);
        });
        if (userAnswers[questionId]) {
          setTimeout(() => {
            handleAnswer(
              question,
              userAnswers[questionId],
              questionBlock,
              questionId
            );
          }, 0);
        }
      } else {
        answerContainer.innerHTML = "<i>Нет вариантов ответа.</i>";
      }
    } else {
      answerContainer.innerHTML = `<i>Неизвестный тип вопроса: ${question.questionType}</i>`;
    }

    questionBlock.appendChild(answerContainer);
    questionBlock.appendChild(subQuestionOuterContainer);
    container.appendChild(questionBlock);
  });
}

function handleAnswer(question, answer, parentQuestionBlock, questionId) {
  console.log(`Ответ на вопрос "${questionId}" (${question.name}):`, answer);

  userAnswers[questionId] = answer;

  if (question.questionType === 0) {
    const subQuestionOuterContainerId = `subquestions-for-${questionId}`;
    const subQuestionOuterContainer = parentQuestionBlock.querySelector(
      `#${subQuestionOuterContainerId}`
    );

    if (!subQuestionOuterContainer) {
      console.error(
        "Не найден контейнер для подвопросов:",
        subQuestionOuterContainerId
      );
      return;
    }

    const allSubContainers = subQuestionOuterContainer.querySelectorAll(
      ".subquestion-container"
    );

    allSubContainers.forEach((container) => {
      container.style.display = "none";
      container.innerHTML = "";
    });

    const oldSeparator = parentQuestionBlock.querySelector(
      "hr.subquestion-separator"
    );
    if (oldSeparator) {
      oldSeparator.remove();
    }

    const subQuestionsData =
      question.subQuestionsByAnswer && question.subQuestionsByAnswer[answer]
        ? question.subQuestionsByAnswer[answer]
        : null;

    if (subQuestionsData && subQuestionsData.length > 0) {
      const targetSubContainerId = `subquestions-for-${questionId}-answer-${answer.replace(
        /\s+/g,
        "-"
      )}`;
      const targetSubContainer = subQuestionOuterContainer.querySelector(
        `#${targetSubContainerId}`
      );

      if (targetSubContainer) {
        console.log("Найден контейнер для подвопросов:", targetSubContainerId);

        if (!parentQuestionBlock.querySelector("hr.subquestion-separator")) {
          const separator = document.createElement("hr");
          separator.className = "subquestion-separator";
          parentQuestionBlock.insertBefore(
            separator,
            subQuestionOuterContainer
          );
        }

        const currentNumber = parentQuestionBlock
          .querySelector("h3")
          .textContent.match(/^(\d+(\.\d+)*)/)[1];
        const nextLevel = (currentNumber.match(/\./g) || []).length + 1;
        const nextPrefix = `${currentNumber}.`;

        renderQuestions(
          subQuestionsData,
          targetSubContainer,
          nextLevel,
          nextPrefix
        );
        targetSubContainer.style.display = "block";
        console.log("Подвопросы отрендерены для ответа:", answer);
      } else {
        console.error(
          "Не найден КОНКРЕТНЫЙ контейнер для подвопросов ответа:",
          targetSubContainerId
        );
      }
    } else {
      console.log(
        "Для ответа '" + answer + "' подвопросов нет или они не определены."
      );
    }
  }
  console.log("Текущие ответы пользователя:", userAnswers);
}

function initSurvey() {
  const surveyContainer = document.getElementById("questionsContainer");
  const submitBtn = document.getElementById("submitBtn");
  const contractOutput = document.getElementById("contractOutput");

  if (!DATA || !DATA.questions) {
    alert(
      "Данные опроса не загружены. Пожалуйста, загрузите DOCX файл кнопкой 'Upload'."
    );
    surveyContainer.innerHTML =
      "<p style='color: red;'>Данные не загружены.</p>";
    submitBtn.style.display = "none";
    contractOutput.textContent = "";
    return;
  }

  console.log("Инициализация опроса с данными:", DATA);

  surveyContainer.innerHTML = "";
  contractOutput.textContent = "";

  renderQuestions(DATA.questions, surveyContainer, 0, "");

  submitBtn.style.display = "block";
}

function generateContract() {
  const contractOutput = document.getElementById("contractOutput");
  if (!DATA || !DATA.questions) {
    contractOutput.textContent = "Ошибка: Данные опроса не загружены.";
    return;
  }

  let contractText = "--- СФОРМИРОВАННЫЙ ДОКУМЕНТ (на основе ответов) ---\n\n";

  const processQuestionsForContract = (questions, level = 0, prefix = "") => {
    questions.forEach((q, index) => {
      const questionNumber = `${prefix}${index + 1}`;
      const questionId = generateQuestionId(prefix, index);
      const answer = userAnswers[questionId];

      contractText += `${"  ".repeat(level)}${questionNumber}. ${q.name}: ${
        answer !== undefined && answer !== "" ? answer : "Ответ не дан"
      }\n`;

      if (
        q.questionType === 0 &&
        answer &&
        q.subQuestionsByAnswer &&
        q.subQuestionsByAnswer[answer]
      ) {
        const nextPrefix = `${questionNumber}.`;
        processQuestionsForContract(
          q.subQuestionsByAnswer[answer],
          level + 1,
          nextPrefix
        );
      }
    });
  };

  processQuestionsForContract(DATA.questions, 0, "");

  contractOutput.textContent = contractText;
  console.log("Сформированный текст:", contractText);
  console.log("Финальные ответы пользователя:", userAnswers);
}

function main() {
  const showBtn = document.querySelector(".show");
  const submitBtn = document.getElementById("submitBtn");

  showBtn.addEventListener("click", () => {
    console.log("Кнопка Show нажата");
    initSurvey();
  });

  submitBtn.addEventListener("click", () => {
    console.log("Кнопка Submit нажата");
    generateContract();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    main();
  }, 500);
});
