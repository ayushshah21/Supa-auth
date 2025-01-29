// import { render, screen } from "@testing-library/react";
// import { BrowserRouter } from "react-router-dom";
// import LandingPage from "../LandingPage";

// describe("LandingPage", () => {
//   const renderWithRouter = () => {
//     return render(
//       <BrowserRouter>
//         <LandingPage />
//       </BrowserRouter>
//     );
//   };

//   it("renders welcome message", () => {
//     renderWithRouter();
//     expect(screen.getByText(/Welcome to Zendesk Clone/i)).toBeInTheDocument();
//   });

//   it("renders login and register buttons", () => {
//     renderWithRouter();
//     expect(screen.getByText(/Login/i)).toBeInTheDocument();
//     expect(screen.getByText(/Register/i)).toBeInTheDocument();
//   });

//   it("has correct navigation links", () => {
//     renderWithRouter();
//     expect(screen.getByText(/Login/i).closest("a")).toHaveAttribute(
//       "href",
//       "/login"
//     );
//     expect(screen.getByText(/Register/i).closest("a")).toHaveAttribute(
//       "href",
//       "/register"
//     );
//   });
// });
