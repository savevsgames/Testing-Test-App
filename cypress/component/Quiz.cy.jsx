import Quiz from "../../client/src/components/Quiz";
import questions from "../fixtures/questions.json";

describe("<Quiz /> Component Test:", () => {
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

  it("Should end the quiz once all 10 questions have been answered", () => {
    cy.mount(<Quiz />);
    cy.get("button").click(); // Start the quiz
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      cy.get("button").eq(0).click(); // Answer the first question with the first answer
    }
    // The quiz should end and the score should be displayed
    cy.get("h2").should("contain.text", "Quiz Completed");
  });

  it("Should show my score at the end of the quiz", () => {
    cy.mount(<Quiz />);
    cy.get("button").click(); // Start the quiz
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve

    // Answer all 10 questions
    for (let i = 0; i < 20; i++) {
      cy.get("button").eq(0).click(); // Answer the first question with the first answer
    }
    // The quiz should end and the score should be displayed
    const score = 0 || 1 || 2 || 3 || 4 || 5 || 6 || 7 || 8 || 9 || 10; // The score should be between 0 and 10
    cy.get("div").should("contain.text", `Your score: ${score}/10`); // The score should be displayed
  });

  it("Should let me start a new quiz when the quiz ends", () => {
    cy.mount(<Quiz />);
    cy.get("button").click(); // Start the quiz

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      cy.get("button").eq(0).click(); // Answer the first question with the first answer
    }
    // The quiz should end and the restart quiz button should be displayed and let me start a new quiz
    cy.get("button").should("have.text", "Take New Quiz").click();
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve
    cy.get("h2").should("contain.text", questions[0].question); // First question should be displayed again
  });
});
