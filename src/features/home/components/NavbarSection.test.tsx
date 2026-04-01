import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NavbarSection } from './NavbarSection';

function renderNavbar() {
  return render(
    <MemoryRouter>
      <NavbarSection />
    </MemoryRouter>,
  );
}

describe('NavbarSection', () => {
  it('renders the brand logo', () => {
    renderNavbar();
    expect(screen.getByText('Huellitas')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Proyecto')).toBeInTheDocument();
    expect(screen.getByText('Misión y Visión')).toBeInTheDocument();
    expect(screen.getByText('Objetivos')).toBeInTheDocument();
    expect(screen.getByText('Tecnologías')).toBeInTheDocument();
  });

  it('renders register CTA link', () => {
    renderNavbar();
    const registerLinks = screen.getAllByText('Registrarse');
    expect(registerLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('toggles mobile menu', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const hamburger = screen.getByLabelText('Abrir menú');
    await user.click(hamburger);

    expect(screen.getByLabelText('Cerrar menú')).toBeInTheDocument();
  });

  it('closes mobile menu when a link is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByLabelText('Abrir menú'));

    // Click a nav link in the mobile menu
    const projectLinks = screen.getAllByText('Proyecto');
    await user.click(projectLinks[projectLinks.length - 1]);

    // Menu should be closed (hamburger button should show "Abrir menú" again)
    expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument();
  });

  it('has proper aria-label for navigation', () => {
    renderNavbar();
    expect(screen.getByLabelText('Navegación principal')).toBeInTheDocument();
  });
});
