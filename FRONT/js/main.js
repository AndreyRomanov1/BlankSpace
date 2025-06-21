let isDocumentLoaded = false;
window.addEventListener("load", () => {
  isDocumentLoaded = true;
  setTimeout(openModal, 100);
  updateSubmitButtonState();
});

function updateSubmitButtonState() {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;
  const survey = SURVEYS.find(s => s.id === currentSurveyId);
  const hasMissing = !survey || checkSurveyCompletionMain(survey).length > 0;
  submitBtn.disabled = !isDocumentLoaded || hasMissing;
}

function generateQuestionId(prefix = "", index) {
  const num = index + 1;
  return prefix ? `${prefix}.${num}` : `q${num}`;
}

function renderSurvey(survey) {
  const container = document.getElementById("survey-container");
  if (!container) return;
  if (!survey.json?.questions) {
    container.innerHTML = "<p style='color:red;'>Нет данных опроса.</p>";
    return;
  }
  container.innerHTML = "";
  renderQuestions(survey.json.questions, container, survey, "", "");
}

document.getElementById("submitBtn")?.addEventListener("click", finalizeCurrentSurvey);
updateSubmitButtonState();

function removeSubAnswers(answers, question, parentId, selected) {
  for (const [opt, subs] of Object.entries(question.subQuestionsByAnswer || {})) {
    if (opt !== selected) removeAnswersRecursive(answers, subs, parentId);
  }
}

function removeAnswersRecursive(answers, questions, prefix) {
  if (!Array.isArray(questions) || !questions.length) return;
  questions.forEach((q, idx) => {
    const id = generateQuestionId(prefix, idx);
    delete answers[id];
    if (q.subQuestionsByAnswer) {
      Object.values(q.subQuestionsByAnswer)
          .forEach(subs => removeAnswersRecursive(answers, subs, id));
    }
  });
}

function renderQuestions(questions, container, survey, level, prefix) {
  if (!questions?.length) return;
  questions.forEach((question, idx) => {
    const id = generateQuestionId(prefix, idx);
    const num = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;

    const block = document.createElement("div");
    block.className = "question-block";
    block.dataset.questionId = id;
    const title = document.createElement("h3");
    title.textContent = `${num}. ${question.name}`;
    block.append(title);

    const answerContainer = document.createElement("div");
    answerContainer.className = "answer-container";
    const subOuter = document.createElement("div");
    subOuter.className = "subquestion-outer-container";

    if (question.questionType === 1) {
      // 7.1. Текстовый ввод
      const input = document.createElement("input");
      Object.assign(input, {
        type: "text",
        className: "answer-input",
        placeholder: `Введите ответ на вопрос ${num}`,
        name: id,
        value: survey.answers[id] || ""
      });
      input.addEventListener("input", () => {
        survey.answers[id] = input.value;
        saveSurveysToStorage();
        updateSubmitButtonState();
        saveMetrik(id);
      });
      answerContainer.append(input);

    } else if (question.questionType === 0) {
      const opts = Object.keys(question.subQuestionsByAnswer || {});
      if (!opts.length) {
        answerContainer.innerHTML = "<i>Нет вариантов ответа.</i>";
      } else {
        opts.forEach(text => {
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = id;
          radio.value = text;
          radio.id = `${id}-answer-${text.replace(/\s+/g, "-")}`;
          if (survey.answers[id] === text) radio.checked = true;
          radio.addEventListener("change", e => {
            const val = e.target.value;
            survey.answers[id] = val;
            handleSubQuestions(question, val, block, survey, id);
            removeSubAnswers(survey.answers, question, id, val);
            saveSurveysToStorage();
            updateSubmitButtonState();
            saveMetrik(id);
          });
          const label = document.createElement("label");
          label.htmlFor = radio.id;
          label.textContent = text;
          const div = document.createElement("div");
          div.className = "answer-option";
          div.append(radio, label);

          const subContainer = document.createElement("div");
          subContainer.id = `sub-${radio.id}`;
          subContainer.className = "subquestion-container";
          subContainer.style.display = "none";
          subOuter.append(subContainer);

          answerContainer.append(div);
        });
        if (survey.answers[id]) {
          setTimeout(() =>
                  handleSubQuestions(question, survey.answers[id], block, survey, id),
              0
          );
        }
      }

    } else {
      answerContainer.innerHTML = `<i>Неизвестный тип вопроса: ${question.questionType}</i>`;
    }

    block.append(answerContainer, subOuter);
    container.append(block);
  });
}

function handleSubQuestions(question, answer, parentBlock, survey, id) {
  const subOuter = parentBlock.querySelector(".subquestion-outer-container");
  if (!subOuter) return;
  subOuter.querySelectorAll(".subquestion-container").forEach(el => {
    el.style.display = "none";
    el.innerHTML = "";
  });
  parentBlock.querySelector("hr.subquestion-separator")?.remove();
  const subs = question.subQuestionsByAnswer?.[answer];
  if (!subs?.length) return;

  const sep = document.createElement("hr");
  sep.className = "subquestion-separator";
  parentBlock.insertBefore(sep, subOuter);

  const target = document.getElementById(`sub-${id}-answer-${answer.replace(/\s+/g, "-")}`);
  if (target) {
    renderQuestions(subs, target, survey, 0, id);
    target.style.display = "block";
  }
}

async function finalizeCurrentSurvey() {
  const survey = SURVEYS.find(s => s.id === currentSurveyId);
  if (!survey) return;
  const missing = checkSurveyCompletionMain(survey);
  if (missing.length) {
    alert("Ответьте на все вопросы main");
    return;
  }
  const { fileId: GUID } = await submitSurvey(survey.answers, survey.fileId);
  console.log(GUID);

  const res = await fetch(`${baseApiUrl}/FileStorage/${GUID}`);
  const blob = await res.blob();
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: currentSurveyName,
        types: [{ description: "Документ", accept: { "application/octet-stream": [".docx", ".doc", ".txt"] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log("Файл сохранён пользователем.");
    } catch {}
  } else {
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), { href: url, download: currentSurveyName });
    document.body.append(link);
    link.click();
    link.remove();
    alert("Ваш браузер не поддерживает showSaveFilePicker. Выполнена обычная загрузка.");
  }
}

async function submitSurvey(frontendResults, fileId) {
  const backendData = createSurveyResult(frontendResults, fileId);
  const res = await fetch(`${baseApiUrl}/Survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backendData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

function createSurveyResult(flatAnswers, fileId) {
  const survey = SURVEYS.find(s => s.id === currentSurveyId);
  const questions = survey?.json?.questions;
  if (!questions) {
    console.error("Не удалось найти текущий опрос.");
    return null;
  }
  const mapType = t => (t === 0 || t === 1 ? t : null);
  function recurse(list, prefix = "", active) {
    return list.map((q, idx) => {
      const id = generateQuestionId(prefix, idx);
      const answer = active ? flatAnswers[id] || null : null;
      const result = {
        questionType: mapType(q.questionType),
        name: q.name,
        questionAnswer: answer,
        subQuestionsByAnswer: {}
      };
      if (q.subQuestionsByAnswer) {
        Object.entries(q.subQuestionsByAnswer).forEach(([opt, subs]) => {
          result.subQuestionsByAnswer[opt] =
              recurse(subs, id, active && flatAnswers[id] === opt);
        });
      }
      return result;
    });
  }
  return { fileId, answeredQuestions: recurse(questions, "", true) };
}

function checkSurveyCompletionMain(survey) {
  const missing = [];
  const answers = survey.answers || {};
  (function check(list, prefix = "") {
    list.forEach((q, idx) => {
      const id = generateQuestionId(prefix, idx);
      if (!answers[id]) missing.push(id);
      if (q.questionType === 0 && answers[id] && q.subQuestionsByAnswer?.[answers[id]]) {
        check(q.subQuestionsByAnswer[answers[id]], id);
      }
    });
  })(survey.json.questions);
  return missing;
}
