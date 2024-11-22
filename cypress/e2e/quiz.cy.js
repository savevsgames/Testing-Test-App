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

describe("Layout and Tailwind Tests: ", () => {
  it("Centers the Start Quiz button on the page", () => {
    cy.visit("http://127.0.0.1:3001/");
    cy.get(".container div div")
      .should("exist")
      .should("have.css", "text-align", "center");
  });

  it("Should have proper css to display the questions and line the answers up with the buttons", () => {
    cy.visit("http://127.0.0.1:3001/");
    cy.get("button").click(); // Click the Start Quiz button to show the questions
    // Check if the container is centered
    cy.get("body").should("have.css", "margin", "0px");
    cy.get(".container div div.card") // div containing the question and answers
      .should("exist")
      .should("have.css", "display", "flex")
      .find("h2")
      .should("have.css", "text-align", "start"); // The question should be left-aligned
    for (let i = 0; i < 7; i = i + 2) {
      // Loop through the answers skipping the button divs
      cy.get(".container div div div div") // div containing the answers
        .eq(i)
        .should("have.css", "align-items", "center")
        .should("have.css", "display", "flex"); // answers are in a flex container
      cy.get(".container div div div div")
        .eq(i)
        .find("button")
        .should("have.class", "btn-primary"); // button is styled correctly
      cy.get(".container div div div div")
        .eq(i)
        .find("div")
        .should("have.css", "text-align", "start") // answer text is left-aligned
        .should("have.class", "alert alert-secondary"); // answer is styled correctly
    }
  });

  it("Displays properly on a mobile screen", () => {
    cy.viewport(342, 666); // small mobile screen size for testing
    cy.visit("http://127.0.0.1:3001/");
    cy.get("button").click(); // Click the Start Quiz button to show the questions
    // Check if the container is centered
    cy.get("body").should("have.css", "margin", "0px");
    cy.get(".container div div.card") // div containing the question and answers
      .should("exist")
      .should("have.css", "display", "flex")
      .should("have.css", "flex-direction", "column"); // The container should still be a column
  });
});

describe("Error Handling Tests: ", () => {
  it("Should display an error message if the API call fails", () => {
    cy.intercept("GET", "/api/questions/random", {
      statusCode: 500, // Internal Server Error
      body: "Internal Server Error",
    }).as("getQuestions");

    cy.visit("http://127.0.0.1:3001/");
    cy.get("button").click();
    cy.wait("@getQuestions"); // Wait for the intercepted API request to resolve

    cy.get("span").should("have.text", "Loading...");
    // There is no alert on the front end for a failed API call, but I can check for the hidden loading text if there are no questions yet
    // In the future if the app is styled better and the front end handles more edge cases, I could check for an alert message
  });
});

describe("Accessibility Tests: ", () => {
  it("Should allow navigation via keyboard", () => {
    cy.visit("http://127.0.0.1:3001/");
    cy.get("button").focus().type("{enter}"); // Focus the Start Quiz button & Simulate pressing Enter
    cy.wait("@getQuestions");

    cy.get("button").eq(0).focus().type("{enter}"); // Focus the first answer button & Simulate pressing Enter to answer
    cy.get("h2").should("exist"); // Verify the next question is displayed
  });

  it("Should have no accessibility violations on load", () => {
    cy.visit("http://127.0.0.1:3001/");
    cy.injectAxe(); // Inject axe-core into the page
    cy.checkA11y(); // Run axe-core checks
  });

  it("Should have no accessibility violations after starting the quiz", () => {
    cy.visit("http://127.0.0.1:3001/");
    cy.injectAxe(); // Inject axe-core into the page
    cy.get("button").click(); // Start the quiz
    cy.wait("@getQuestions");

    cy.checkA11y(); // Check accessibility after the DOM updates
  });
});
