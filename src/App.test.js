import { render, screen } from '@testing-library/react';
import App from './App';

test("l'application se rend sans planter et affiche la page de connexion par défaut", async () => {
  render(<App />);
  const titre = await screen.findByText(/connexion/i);
  expect(titre).toBeInTheDocument();
});
