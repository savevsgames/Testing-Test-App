import React from "react";
import Quiz from "../../client/src/components/Quiz";
// import questions from "../fixtures/questions.json" assert{ type: 'json'};

describe("<Quiz />", () => {
  it("renders", () => {
    cy.mount(<Quiz />);
    cy.get("button").should("have.text", "Start Quiz");
  });
});
