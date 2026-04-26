import { render, screen, fireEvent } from "@testing-library/react";
import PricingCard from "./PricingCard";

const mockData = {
  book_id: "1",
  title: "Test Book",
  price: 50000,
  isFallback: false,
};

test("renderiza el título correctamente", () => {
  render(<PricingCard data={mockData} />);
  expect(screen.getByText("Test Book")).toBeInTheDocument();
});

test("muestra detalle al hacer click", () => {
  render(<PricingCard data={mockData} />);
  
  fireEvent.click(screen.getByText("Ver detalle"));

  expect(screen.getByText("Explicación:")).toBeInTheDocument();
});

test("botón recalcular se desactiva al hacer click", () => {
  render(<PricingCard data={mockData} />);
  
  const button = screen.getByText("Recalcular precio");
  fireEvent.click(button);

  expect(button).toBeDisabled();
});