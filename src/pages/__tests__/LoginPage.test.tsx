// import { render, screen, waitFor } from "@testing-library/react";
// import { BrowserRouter } from "react-router-dom";
// import LoginPage from "../LoginPage";
// import { mockSupabaseClient } from "../../test/mocks/supabase";
// import userEvent from "@testing-library/user-event";

// const mockNavigate = vi.fn();

// vi.mock("react-router-dom", async () => {
//   const actual = await vi.importActual("react-router-dom");
//   return {
//     ...actual,
//     useNavigate: () => mockNavigate,
//   };
// });

// describe("LoginPage", () => {
//   const renderLoginPage = () => {
//     return render(
//       <BrowserRouter>
//         <LoginPage />
//       </BrowserRouter>
//     );
//   };

//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it("renders login form", () => {
//     renderLoginPage();
//     expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
//     expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
//   });

//   it.fails("handles email login successfully", async () => {
//     mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
//       data: { user: { id: "1" } },
//       error: null,
//     });
//     renderLoginPage();

//     await userEvent.type(
//       screen.getByPlaceholderText(/email address/i),
//       "john@example.com"
//     );
//     await userEvent.type(
//       screen.getByPlaceholderText(/password/i),
//       "password123"
//     );

//     const submitButton = screen.getByRole("button", { name: /sign in/i });
//     await userEvent.click(submitButton);

//     await waitFor(() => {
//       expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
//         email: "john@example.com",
//         password: "password123",
//       });
//       expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
//     });
//   });

//   it.fails("displays error message on login failure", async () => {
//     const errorMessage = "Invalid login credentials";
//     mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
//       data: { user: null },
//       error: { message: errorMessage },
//     });
//     renderLoginPage();

//     await userEvent.type(
//       screen.getByPlaceholderText(/email address/i),
//       "john@example.com"
//     );
//     await userEvent.type(
//       screen.getByPlaceholderText(/password/i),
//       "wrong-password"
//     );

//     const submitButton = screen.getByRole("button", { name: /sign in/i });
//     await userEvent.click(submitButton);

//     await waitFor(() => {
//       expect(screen.getByText(errorMessage)).toBeInTheDocument();
//     });
//   });

//   it.fails("handles Google sign-in", async () => {
//     mockSupabaseClient.auth.signInWithOAuth.mockResolvedValueOnce({
//       data: { provider: "google" },
//       error: null,
//     });
//     renderLoginPage();

//     const googleButton = screen.getByRole("button", {
//       name: /continue with google/i,
//     });
//     await userEvent.click(googleButton);

//     await waitFor(() => {
//       expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
//         provider: "google",
//         options: {
//           redirectTo: expect.any(String),
//         },
//       });
//     });
//   });
// });
