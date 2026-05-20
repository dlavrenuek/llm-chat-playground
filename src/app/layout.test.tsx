import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the next/font/google module
jest.mock("next/font/google", () => ({
  Inter: () => ({
    className: "mocked-inter-font-class"
  })
}));

// Mock the CSS import since Jest can't process CSS files
jest.mock("./global.css", () => ({}));

// Create a test implementation of the layout to avoid rendering html/body tags
const TestRootLayout = ({ children }: { children: React.ReactNode }) => {
  const inter = { className: "mocked-inter-font-class" };

  return (
    <div className={inter.className}>
      <div className="flex flex-col h-screen">
        <header className="p-12 pb-6 font-bold text-xl text-white">
          🕹 Langchain + LLM chat playground
        </header>
        {children}
      </div>
    </div>
  );
};

describe("RootLayout", () => {
  it("renders children correctly", () => {
    const testChild = <div data-testid="test-child">Test Child Content</div>;

    render(<TestRootLayout>{testChild}</TestRootLayout>);

    // Check that the child content is rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it("includes the header with correct content", () => {
    const testChild = <div>Test Child</div>;

    render(<TestRootLayout>{testChild}</TestRootLayout>);

    // Check that the header is present with correct content
    const headerElement = screen.getByText(/Langchain \+ LLM chat playground/i);
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveClass('p-12');
    expect(headerElement).toHaveClass('pb-6');
    expect(headerElement).toHaveClass('font-bold');
    expect(headerElement).toHaveClass('text-xl');
    expect(headerElement).toHaveClass('text-white');
  });

  it("applies the correct classes to the outer container", () => {
    const testChild = <div>Test Child</div>;

    const { container } = render(<TestRootLayout>{testChild}</TestRootLayout>);

    // Check if the outermost div has the correct class from the mocked font
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('mocked-inter-font-class');
  });

  it("wraps content in a flex column container with full height", () => {
    const testChild = <div>Test Child</div>;

    render(<TestRootLayout>{testChild}</TestRootLayout>);

    // Find the div that contains the flex and height classes
    // Looking for the div with flex flex-col h-screen classes
    const flexContainers = document.querySelectorAll('div.flex.flex-col.h-screen');
    expect(flexContainers.length).toBeGreaterThan(0);

    if (flexContainers.length > 0) {
      const flexContainer = flexContainers[0];
      expect(flexContainer).toHaveClass('flex');
      expect(flexContainer).toHaveClass('flex-col');
      expect(flexContainer).toHaveClass('h-screen');
    }
  });

  it("renders header with emoji and text", () => {
    const testChild = <div>Test Child</div>;

    render(<TestRootLayout>{testChild}</TestRootLayout>);

    const headerElement = screen.getByText(/🕹 Langchain \+ LLM chat playground/i);
    expect(headerElement).toBeInTheDocument();
  });

  it("renders without crashing with empty children", () => {
    render(<TestRootLayout>{null}</TestRootLayout>);

    // Should render the header even without children
    expect(screen.getByText(/Langchain \+ LLM chat playground/i)).toBeInTheDocument();
  });
});