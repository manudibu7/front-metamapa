import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza el hero principal', async () => {
  render(<App />);
  expect(await screen.findByText(/Información geolocalizada/i)).toBeInTheDocument();
});
