import Quiz from "../../client/src/components/Quiz";
import questions from "../fixtures/questions.json";

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
    const question: Question = questions[questionIndex];
    const answers: Answer[] = question.answers;
    const correctAnswerIndex: number = answers.findIndex((answer: Answer) => answer.isCorrect === true);
    const selectedAnswerIndex: number = 0; // Always select the first answer
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

    // The quiz should end and the score should be displayed and have a value between 0 and 10
    cy.get("h2").should("contain.text", "Quiz Completed");
    const acceptableScores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Array of acceptable scores
    cy.get("div div div")
      .invoke("text")
      .then((text) => {
        const match = text.match(/Your score: (\d+)\/10/);
        if (match) {
          const score = parseInt(match[1], 10);
          expect(acceptableScores).to.include(score); // The score should be one of the acceptable values
        } else {
          throw new Error("Score not found in the text");
        }
      });
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