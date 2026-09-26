// ===============================
// QUIZ APP
// ===============================

let questions = [];
let currentQuestion = 0;

let userAnswers = [];
let bookmarked = [];


// ===============================
// LOAD QUESTIONS
// ===============================

async function loadQuestions() {

    try {

        const response = await fetch("questions.json");

        if (!response.ok) {
            throw new Error("Could not load questions.json");
        }

        questions = await response.json();

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("questions.json is empty or invalid");
        }

        // Create arrays according to number of questions
        userAnswers = new Array(questions.length).fill(null);
        bookmarked = new Array(questions.length).fill(false);

        // Start quiz
        displayQuestion();
        createQuestionMap();

    } catch (error) {

        console.error(error);

        document.getElementById("questions").textContent =
            "Unable to load questions.";

        document.getElementById("progress").textContent =
            "Error loading quiz";
    }
}


// ===============================
// DISPLAY QUESTION
// ===============================

function displayQuestion() {

    const question = questions[currentQuestion];

    if (!question) {
        return;
    }


    // ===============================
    // PROGRESS
    // ===============================

    document.getElementById("progress").textContent =
        `Question ${currentQuestion + 1} of ${questions.length}`;


    // ===============================
    // QUESTION
    // ===============================

    const questionElement =
        document.getElementById("questions");

    questionElement.innerHTML = "";


    // Question text
    if (question.question) {

        const text =
            document.createElement("div");

        text.className = "question-text";

        // IMPORTANT:
        // Use textContent instead of innerHTML.
        // This prevents things like <details>
        // from being interpreted as HTML.

        text.textContent = question.question;

        questionElement.appendChild(text);
    }


    // ===============================
    // CODE / PSEUDOCODE
    // ===============================

    if (question.code) {

        const codeBlock =
            document.createElement("pre");

        codeBlock.className = "code-block";


        const code =
            document.createElement("code");

        // Code must also be treated as plain text
        code.textContent = question.code;


        codeBlock.appendChild(code);

        questionElement.appendChild(codeBlock);
    }


    // ===============================
    // OPTIONS
    // ===============================

    const optionsContainer =
        document.getElementById("options");

    optionsContainer.innerHTML = "";


    if (Array.isArray(question.options)) {

        question.options.forEach((option, index) => {

            // Label
            const label =
                document.createElement("label");

            label.className = "option";


            // Radio button
            const radio =
                document.createElement("input");

            radio.type = "radio";

            radio.name = "answer";

            radio.value = index;


            // Restore previous answer
            if (userAnswers[currentQuestion] === index) {

                radio.checked = true;
            }


            // When user selects an option
            radio.addEventListener("change", function () {

                userAnswers[currentQuestion] = index;

                updateQuestionMap();
            });


            // Option text
            const text =
                document.createElement("span");


            // IMPORTANT:
            // DO NOT use innerHTML here.
            //
            // Example:
            // "<details ></details>"
            //
            // should appear as text and NOT become
            // an actual HTML element.

            text.textContent = option;


            // Build option
            label.appendChild(radio);

            label.appendChild(text);

            optionsContainer.appendChild(label);
        });
    }


    // ===============================
    // UPDATE UI
    // ===============================

    updateBookmarkButton();

    updateQuestionMap();
}


// ===============================
// CREATE QUESTION MAP
// ===============================

function createQuestionMap() {

    const map =
        document.getElementById("questionMap");

    map.innerHTML = "";


    questions.forEach((question, index) => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "question-number";

        button.textContent = index + 1;


        // Jump directly to question
        button.addEventListener("click", function () {

            currentQuestion = index;

            displayQuestion();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });


        map.appendChild(button);
    });


    updateQuestionMap();
}


// ===============================
// UPDATE QUESTION MAP
// ===============================

function updateQuestionMap() {

    const buttons =
        document.querySelectorAll(".question-number");


    buttons.forEach((button, index) => {

        // Remove old states
        button.classList.remove(
            "current",
            "answered",
            "bookmarked"
        );


        // Current question
        if (index === currentQuestion) {

            button.classList.add("current");
        }


        // Answered question
        if (userAnswers[index] !== null) {

            button.classList.add("answered");
        }


        // Bookmarked question
        if (bookmarked[index]) {

            button.classList.add("bookmarked");
        }
    });
}


// ===============================
// NEXT QUESTION
// ===============================

function next() {

    if (currentQuestion < questions.length - 1) {

        currentQuestion++;

        displayQuestion();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } else {

        showResult();
    }
}


// ===============================
// PREVIOUS QUESTION
// ===============================

function prev() {

    if (currentQuestion > 0) {

        currentQuestion--;

        displayQuestion();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


// ===============================
// BOOKMARK QUESTION
// ===============================

function bookmarkQuestion() {

    bookmarked[currentQuestion] =
        !bookmarked[currentQuestion];


    updateBookmarkButton();

    updateQuestionMap();
}


// ===============================
// UPDATE BOOKMARK BUTTON
// ===============================

function updateBookmarkButton() {

    const button =
        document.getElementById("bookmarkBtn");


    if (bookmarked[currentQuestion]) {

        button.textContent =
            "🔖 Bookmarked";

        button.classList.add("bookmarked");

    } else {

        button.textContent =
            "🔖 Bookmark";

        button.classList.remove("bookmarked");
    }
}


// ===============================
// TOGGLE QUESTION MAP
// ===============================

function toggleMap() {

    const content =
        document.getElementById("mapContent");

    const button =
        document.getElementById("mapToggle");


    content.classList.toggle("hide");


    if (content.classList.contains("hide")) {

        button.textContent = "Show";

    } else {

        button.textContent = "Hide";
    }
}


// ===============================
// CHECK ANSWER
// ===============================

function isCorrect(question, userAnswer) {

    // No answer selected
    if (userAnswer === null) {

        return false;
    }


    // Answer is not verified
    if (
        question.answer === null ||
        question.answer === undefined ||
        question.answer === ""
    ) {

        return null;
    }


    const correctAnswer =
        question.answer;


    // ===============================
    // NUMBER ANSWER
    // ===============================

    if (typeof correctAnswer === "number") {

        return userAnswer === correctAnswer;
    }


    // ===============================
    // STRING ANSWER
    // ===============================

    if (typeof correctAnswer === "string") {

        const answer =
            correctAnswer.trim();


        // ===============================
        // A / B / C / D
        // ===============================

        if (/^[A-Da-d]$/.test(answer)) {

            const correctIndex =
                answer.toUpperCase().charCodeAt(0) - 65;

            return userAnswer === correctIndex;
        }


        // ===============================
        // OPTION 1 / OPTION 2
        // ===============================

        const match =
            answer.match(/(?:option\s*)?([1-9]\d*)/i);


        if (match) {

            const correctIndex =
                parseInt(match[1], 10) - 1;

            return userAnswer === correctIndex;
        }


        // ===============================
        // COMPARE OPTION TEXT
        // ===============================

        if (Array.isArray(question.options)) {

            const selectedOption =
                question.options[userAnswer];


            if (selectedOption === undefined) {

                return false;
            }


            return String(selectedOption)
                .trim()
                .toLowerCase() ===
                answer.toLowerCase();
        }
    }


    return null;
}


// ===============================
// SHOW RESULT
// ===============================

function showResult() {

    let correct = 0;

    let wrong = 0;

    let unanswered = 0;

    let unverified = 0;


    questions.forEach((question, index) => {

        const userAnswer =
            userAnswers[index];


        // ===============================
        // UNANSWERED
        // ===============================

        if (userAnswer === null) {

            unanswered++;

            return;
        }


        const result =
            isCorrect(question, userAnswer);


        // ===============================
        // UNVERIFIED
        // ===============================

        if (result === null) {

            unverified++;

            return;
        }


        // ===============================
        // CORRECT / WRONG
        // ===============================

        if (result === true) {

            correct++;

        } else {

            wrong++;
        }
    });


    // ===============================
    // PERCENTAGE
    // ===============================

    const percentage =
        questions.length > 0
            ? ((correct / questions.length) * 100).toFixed(1)
            : 0;


    // ===============================
    // RESULT CARD
    // ===============================

    const scoreCard =
        document.getElementById("scoreCard");

    scoreCard.innerHTML = "";


    const resultSection =
        document.createElement("section");

    resultSection.className = "result";


    // Heading
    const heading =
        document.createElement("h2");

    heading.textContent =
        "Quiz Result";


    // Score
    const score =
        document.createElement("div");

    score.className = "score";

    score.textContent =
        `${correct} / ${questions.length}`;


    // Percentage
    const percentageText =
        document.createElement("p");

    percentageText.textContent =
        `${percentage}%`;


    // ===============================
    // STAT CARDS
    // ===============================

    const stats =
        document.createElement("div");

    stats.className = "stats";


    stats.appendChild(
        createStat(correct, "Correct")
    );


    stats.appendChild(
        createStat(wrong, "Wrong")
    );


    stats.appendChild(
        createStat(unanswered, "Unanswered")
    );


    stats.appendChild(
        createStat(unverified, "Unverified")
    );


    // ===============================
    // REVIEW SECTION
    // ===============================

    const review =
        document.createElement("div");

    review.className = "review-section";


    const reviewHeading =
        document.createElement("h3");

    reviewHeading.textContent =
        "Review";


    review.appendChild(reviewHeading);


    // ===============================
    // REVIEW EACH QUESTION
    // ===============================

    questions.forEach((question, index) => {

        const userAnswer =
            userAnswers[index];


        const result =
            isCorrect(question, userAnswer);


        // Show only:
        // Wrong
        // Unanswered
        // Unverified
        // Bookmarked

        if (
            result === true &&
            !bookmarked[index]
        ) {

            return;
        }


        const reviewQuestion =
            document.createElement("div");

        reviewQuestion.className =
            "review-question";


        // Bookmark styling
        if (bookmarked[index]) {

            reviewQuestion.classList.add(
                "bookmark-review"
            );
        }


        // ===============================
        // QUESTION
        // ===============================

        const title =
            document.createElement("div");


        const questionNumber =
            document.createElement("strong");

        questionNumber.textContent =
            `Q${index + 1}. `;


        const questionText =
            document.createElement("span");

        // Use textContent
        questionText.textContent =
            question.question || "";


        title.appendChild(questionNumber);

        title.appendChild(questionText);


        reviewQuestion.appendChild(title);


        // ===============================
        // CODE
        // ===============================

        if (question.code) {

            const code =
                document.createElement("pre");

            code.className =
                "code-block";

            code.textContent =
                question.code;


            reviewQuestion.appendChild(code);
        }


        // ===============================
        // USER ANSWER
        // ===============================

        const userText =
            document.createElement("p");


        if (userAnswer === null) {

            userText.className = "wrong";

            userText.textContent =
                "Your answer: Not answered";

        } else {

            const selected =
                question.options &&
                question.options[userAnswer] !== undefined
                    ? question.options[userAnswer]
                    : "Unknown";


            if (result === true) {

                userText.className =
                    "correct";

                userText.textContent =
                    `Your answer: ${selected}`;

            } else if (result === false) {

                userText.className =
                    "wrong";

                userText.textContent =
                    `Your answer: ${selected}`;

            } else {

                userText.textContent =
                    `Your answer: ${selected}`;
            }
        }


        reviewQuestion.appendChild(userText);


        // ===============================
        // CORRECT ANSWER
        // ===============================

        const correctText =
            document.createElement("p");


        if (
            question.answer !== null &&
            question.answer !== undefined &&
            question.answer !== ""
        ) {

            correctText.className =
                "correct";

            correctText.textContent =
                `Correct answer: ${getCorrectAnswerText(question)}`;

        } else {

            correctText.textContent =
                "Correct answer: Not verified";
        }


        reviewQuestion.appendChild(correctText);


        review.appendChild(reviewQuestion);
    });


    // ===============================
    // BUILD RESULT
    // ===============================

    resultSection.appendChild(heading);

    resultSection.appendChild(score);

    resultSection.appendChild(percentageText);

    resultSection.appendChild(stats);

    resultSection.appendChild(review);


    scoreCard.appendChild(resultSection);


    // Scroll to result
    scoreCard.scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// CREATE STAT CARD
// ===============================

function createStat(number, label) {

    const stat =
        document.createElement("div");

    stat.className =
        "stat";


    const numberElement =
        document.createElement("h3");

    numberElement.textContent =
        number;


    const labelElement =
        document.createElement("p");

    labelElement.textContent =
        label;


    stat.appendChild(numberElement);

    stat.appendChild(labelElement);


    return stat;
}


// ===============================
// GET CORRECT ANSWER TEXT
// ===============================

function getCorrectAnswerText(question) {

    const answer =
        question.answer;


    // ===============================
    // NUMBER
    // ===============================

    if (typeof answer === "number") {

        if (
            question.options &&
            question.options[answer] !== undefined
        ) {

            return question.options[answer];
        }

        return String(answer);
    }


    // ===============================
    // STRING
    // ===============================

    if (typeof answer === "string") {

        const trimmed =
            answer.trim();


        // ===============================
        // A / B / C / D
        // ===============================

        if (/^[A-Da-d]$/.test(trimmed)) {

            const index =
                trimmed.toUpperCase().charCodeAt(0) - 65;


            if (
                question.options &&
                question.options[index] !== undefined
            ) {

                return question.options[index];
            }
        }


        // ===============================
        // OPTION 1 / OPTION 2
        // ===============================

        const match =
            trimmed.match(
                /(?:option\s*)?([1-9]\d*)/i
            );


        if (match) {

            const index =
                parseInt(match[1], 10) - 1;


            if (
                question.options &&
                question.options[index] !== undefined
            ) {

                return question.options[index];
            }
        }


        // ===============================
        // DIRECT ANSWER TEXT
        // ===============================

        return trimmed;
    }


    return "Not verified";
}


// ===============================
// START QUIZ
// ===============================

loadQuestions();