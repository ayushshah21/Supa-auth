import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RegisterPage from "../RegisterPage";
import { mockSupabaseClient } from "../../test/mocks/supabase";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("RegisterPage", () => {
  const renderRegisterPage = () => {
    return render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders registration form", () => {
    renderRegisterPage();
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it.fails("handles email registration successfully", async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: "1" } },
      error: null,
    });
    renderRegisterPage();

    await userEvent.type(screen.getByPlaceholderText(/full name/i), "John Doe");
    await userEvent.type(
      screen.getByPlaceholderText(/email address/i),
      "john@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/password/i),
      "password123"
    );

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "password123",
        options: {
          data: {
            full_name: "John Doe",
          },
          emailRedirectTo: expect.any(String),
        },
      });
    });
  });

  it("displays error message on registration failure", async () => {
    const errorMessage = "Unable to validate email address: invalid format";
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: errorMessage },
    });
    renderRegisterPage();

    await userEvent.type(screen.getByPlaceholderText(/full name/i), "John Doe");
    await userEvent.type(
      screen.getByPlaceholderText(/email address/i),
      "invalid-email"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/password/i),
      "password123"
    );

    const form = screen.getByRole("form");
    await fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it.fails("handles Google sign-up", async () => {
    mockSupabaseClient.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: "google" },
      error: null,
    });
    renderRegisterPage();

    const googleButton = screen.getByRole("button", {
      name: /sign up with google/i,
    });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.any(String),
        },
      });
    });
  });
});
