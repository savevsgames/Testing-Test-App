import questions from "../fixtures/questions.json";

describe("Quiz End to End Testing:", () => {
  beforeEach(() => {
    // "Mocking" the API call to "GET" => api/questions/random
    cy.intercept("GET", "/api/questions/random", {
      statusCode: 200, // OK
      body: questions, // JSON data
    }).as("getQuestions"); // Assign an alias (@getQuestions)
  });

  it("Loads the quiz page", () => {
    cy.visit("http://127.0.0.1:3001/");
  });

  it("Should render the <Quiz /> component with a button to start the quiz containing the text, 'Start Quiz'", () => {
    cy.visit("http://127.0.0.1:3001/");

    cy.get("button").should("have.text", "Start Quiz");
  });

  it("Should render a new question when I answer a question", () => {
    cy.visit("http://127.0.0.1:3001/");
    cy.get("button").click();
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve
    // Answer the first question
    cy.get("button").eq(0).click(); // Answer the first question with the first answer
    cy.get("h2").should("exist"); // The second question should exist after navigating onClick
  });
});
