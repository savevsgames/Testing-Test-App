// This is used to declare global types that are not defined in the project.
// In this case, we are declaring a global type for the window object to expose
// the state of the quiz to Cypress.
// This allows Cypress to interact with the quiz component and test its functionality.

export {};
// This is used to prevent TypeScript from treating this file as a module,
// which would cause errors when declaring global types.

declare global {
  interface Window {
    __APP_STATE__?: {
      quizState: {
        currentQuestionIndex: number;
        setCurrentQuestionIndex: (index: number) => void;
        quizCompleted: boolean;
        setQuizCompleted: (completed: boolean) => void;
      };
    };
  }
}
