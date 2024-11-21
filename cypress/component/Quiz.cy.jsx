import React from "react";
import Quiz from "../../client/src/components/Quiz";
import questions from "../fixtures/questions.json";

describe("<Quiz /> Component Test:", () => {
  beforeEach(() => {
    // "Mocking" the API call to "GET" questions
    cy.intercept("GET", "/api/questions", {
      statusCode: 200, // OK
      body: questions, // JSON data
    }).as("getQuestions"); // Assign an alias (@getQuestions)
  });

  it("Should render the <Quiz /> component", () => {
    cy.mount(<Quiz />);
  });

  it("Should render a button to start the quiz with the text, 'Start Quiz'", () => {
    cy.mount(<Quiz />);
    cy.get("button").should("have.text", "Start Quiz");
  });

  it("Should render a question and its four answer choices with a button for each after a user clicks start quiz.", () => {
    cy.mount(<Quiz />);
    cy.get("button").click();
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve
    // FOrce the data to be loaded so we can compare
    cy.get("h2")
      .invoke("text")
      .then((displayedQuestion) => {
        // displayedQuestion is the question text from the real API call
        const matchedQuestion = questions.find(
          (question) => question.question === displayedQuestion
        );
        expect(matchedQuestion).to.not.be.undefined; // The question displayed should be in the JSON data

        // Check if the answers match
        matchedQuestion?.answers.forEach((answer, index) => {
          cy.get("button")
            .eq(index)
            .contains(index + 1); // Text of the button should be the index + 1
          cy.get("div").contains(answer.text); // The answer text should be displayed
        });
      });
  });

  it("Should calculate the score correctly when a user answers a question correctly", () => {
    cy.mount(<Quiz />);
    cy.get("button").click(); // Start the quiz
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve

    cy.get("h2")
      .invoke("text")
      .then((displayedQuestion) => {
        const matchedQuestion = questions.find(
          (question) => question.question === displayedQuestion
        );
        expect(matchedQuestion).to.not.be.undefined; // The question displayed should be in the JSON data

        // Find the correct answer
        if (matchedQuestion) {
          const correctAnswerIndex = matchedQuestion.answers.findIndex(
            (answer) => answer.isCorrect === true
          );

          // Click the button with the correct answer
          cy.get("button").eq(correctAnswerIndex).click();

          //  Need to probably loop through questions and test for each one to know if
          //  The score is updated properly because it is not shown on the page while test is
          //  running
        }
      });
  });
});
