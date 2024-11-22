import Quiz from "../../client/src/components/Quiz";
import fullQuestionJSON from "../fixtures/questions.json";

const questions = fullQuestionJSON.slice(0, 10); // Only use the first 10 questions for testing

describe("<Quiz /> Component Test:", () => {
  // isAnswerCorrect will match the question shown with one in the json
  // then determine if the score should be incremented or not based on the
  // value of isCorrect for the choice made (always the first choice)
  interface Answer {
    text: string;
    isCorrect: boolean;
  }

  interface Question {
    question: string;
    answers: Answer[];
  }

  const isAnswerCorrect = (questionIndex: number): boolean => {
    // Get the question and answers
    const question: Question = questions[questionIndex];
    const answers: Answer[] = question.answers;
    // Find the correct answer and the selected answer
    const correctAnswerIndex: number = answers.findIndex(
      (answer: Answer) => answer.isCorrect === true
    );
    const selectedAnswerIndex: number = 0; // Always select the first answer
    // Compare the selected answer with the correct answer
    return selectedAnswerIndex === correctAnswerIndex;
  };

  beforeEach(() => {
    // "Mocking" the API call to "GET" questions
    cy.intercept("GET", "/api/questions/random", {
      statusCode: 200, // OK
      body: questions, // JSON data
    }).as("getQuestions"); // Assign an alias (@getQuestions)
  });

  it("Should render the <Quiz /> component", () => {
    cy.mount(<Quiz />);
  });

  it("Should render a button with the text, 'Start Quiz' that starts the quiz when clicked", () => {
    cy.mount(<Quiz />);
    cy.get("button").should("have.text", "Start Quiz").click();
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve
    cy.get("h2").should("contain.text", questions[0].question); // A question should be displayed
  });

  it("Should render a new question when I answer a question", () => {
    cy.mount(<Quiz />);
    cy.get("button").click();
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve
    // Answer the first question
    cy.get("button").eq(0).click(); // Answer the first question with the first answer
    cy.get("h2").should("contain.text", questions[1].question); // The second question should be displayed
  });

  it("should provide and update the STATE of the quiz", () => {
    cy.mount(<Quiz />);
    cy.get("button").click(); // Start the quiz
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve

    // Update the state through __APP_STATE__ and simulate being on question 5, then validate
    cy.window().then((win) => {
      if (!win.__APP_STATE__) {
        throw new Error(
          "`__APP_STATE__` is undefined. Make sure the state is initialized properly in the component."
        );
      }
      win.__APP_STATE__.quizState.setCurrentQuestionIndex(5);
    });

    // Validate the state
    cy.window()
      .its("__APP_STATE__.quizState.currentQuestionIndex")
      .should("equal", 5); // The current question index should be 5
  });

  it("Should end the quiz once all 10 questions have been answered", () => {
    cy.mount(<Quiz />);
    cy.get("button").click(); // Start the quiz
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      // Test the text exists after each click to ensure that react updates states
      cy.get("h2").should("exist"); // A question should be displayed
      cy.get("button").eq(0).click(); // Answer the first question with the first answer

      cy.window().then((win) => {
        if (!win.__APP_STATE__) {
          throw new Error(
            "`__APP_STATE__` is undefined. Make sure the state is initialized properly in the component."
          );
        }
        win.__APP_STATE__.quizState.setCurrentQuestionIndex(i + 1); // Update the index onClick
      });

      cy.window()
        .its("__APP_STATE__.quizState.currentQuestionIndex")
        .should("equal", i + 1); // Ensure the index increments

      if (i < 9) {
        // Skipped on the 10th question but until then, the quiz should not end and another question should be displayed
        cy.get("h2").should("exist");
      }
    }
    // Set quizCompleted to true
    cy.window().then((win) => {
      if (!win.__APP_STATE__) {
        throw new Error(
          "`__APP_STATE__` is undefined. Make sure the state is initialized properly in the component."
        );
      }
      win.__APP_STATE__.quizState.setQuizCompleted(true); // Complete the quiz

      cy.log(
        "Current Index:",
        win.__APP_STATE__.quizState.currentQuestionIndex
      );
      cy.log("Quiz Completed:", win.__APP_STATE__.quizState.quizCompleted);
    });

    // The quiz should end and the score should be displayed
    cy.get("h2").should("contain.text", "Quiz Completed");
  });

  it("Should show my score at the end of the quiz", () => {
    cy.mount(<Quiz />);
    cy.get("button").click(); // Start the quiz
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve
    let score = 0; // Initialize the score
    let incorrectAnswers = 0; // Initialize the incorrect answers total
    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      // Test the text exists after each click to ensure that react updates states
      cy.get("h2").should("contain.text", questions[i].question); // A question should be displayed
      cy.get("button").eq(0).click(); // Answer the first question with the first answer
      if (isAnswerCorrect(i)) {
        score++; // Increment the score if the answer is correct
      } else {
        incorrectAnswers++; // Increment the incorrect answers total if the answer is incorrect
      }
      cy.window().then((win) => {
        if (!win.__APP_STATE__) {
          throw new Error(
            "`__APP_STATE__` is undefined. Make sure the state is initialized properly in the component."
          );
        }
        win.__APP_STATE__.quizState.setCurrentQuestionIndex(i + 1); // Update the index onClick
      });

      cy.window()
        .its("__APP_STATE__.quizState.currentQuestionIndex")
        .should("equal", i + 1); // Ensure the index increments

      if (i < 9) {
        // Skipped on the 10th question but until then, the quiz should not end and another question should be displayed
        cy.get("h2").should("exist"); // Makes sure the render is updated
      } else {
        cy.window().then((win) => {
          if (!win.__APP_STATE__) {
            throw new Error(
              "`__APP_STATE__` is undefined. Make sure the state is initialized properly in the component."
            );
          }
          win.__APP_STATE__.quizState.setQuizCompleted(true); // Complete the quiz
        });
      }
    }
    // Set quizCompleted to true
    cy.window().then((win) => {
      if (!win.__APP_STATE__) {
        throw new Error(
          "`__APP_STATE__` is undefined. Make sure the state is initialized properly in the component."
        );
      }
      cy.log(
        "Current Index:",
        win.__APP_STATE__.quizState.currentQuestionIndex
      );
      cy.log("Quiz Completed:", win.__APP_STATE__.quizState.quizCompleted);
      cy.log("Score:", score);
      cy.log("Incorrect Answers:", incorrectAnswers);
    });

    // The quiz should end and the score should be displayed
    cy.get("h2").should("contain.text", "Quiz Completed");
    cy.get("div div div").should("contain.text", `Your score: ${score}/10`); // The score should
  });

  it("Should let me start a new quiz when the quiz ends", () => {
    cy.mount(<Quiz />);
    cy.get("button").click(); // Start the quiz
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      cy.get("h2").should("exist"); // A question should be displayed
      cy.get("button").eq(0).click(); // Answer the first question with the first answer
      if (i < 9) {
        // The quiz should not end yet
        cy.get("h2").should("exist"); // A question should be displayed
      }
    }
    // The quiz should end and the restart quiz button should be displayed and let me start a new quiz
    cy.get("button").should("have.text", "Take New Quiz").click();
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve
    cy.get("h2").should("contain.text", questions[0].question); // First question should be displayed again
  });
});
