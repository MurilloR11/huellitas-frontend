import { ROUTES } from './routes';

describe('ROUTES', () => {
  it('defines HOME route', () => {
    expect(ROUTES.HOME).toBe('/');
  });

  it('defines PETS route', () => {
    expect(ROUTES.PETS).toBe('/pets');
  });

  it('defines PET_DETAIL route with :id param', () => {
    expect(ROUTES.PET_DETAIL).toBe('/pets/:id');
  });

  it('defines FOUNDATIONS route', () => {
    expect(ROUTES.FOUNDATIONS).toBe('/foundations');
  });

  it('defines FOUNDATION_DETAIL route with :id param', () => {
    expect(ROUTES.FOUNDATION_DETAIL).toBe('/foundations/:id');
  });

  it('defines ADOPT route with :petId param', () => {
    expect(ROUTES.ADOPT).toBe('/adopt/:petId');
  });

  it('defines MY_ADOPTIONS route', () => {
    expect(ROUTES.MY_ADOPTIONS).toBe('/my-adoptions');
  });

  it('defines LOGIN route', () => {
    expect(ROUTES.LOGIN).toBe('/login');
  });

  it('defines REGISTER route', () => {
    expect(ROUTES.REGISTER).toBe('/register');
  });

  it('defines FOUNDATION_DASHBOARD route', () => {
    expect(ROUTES.FOUNDATION_DASHBOARD).toBe('/foundation/dashboard');
  });

  it('contains only expected route keys', () => {
    expect(Object.keys(ROUTES)).toEqual([
      'HOME',
      'PETS',
      'PET_DETAIL',
      'FOUNDATIONS',
      'FOUNDATION_DETAIL',
      'ADOPT',
      'MY_ADOPTIONS',
      'LOGIN',
      'REGISTER',
      'FOUNDATION_DASHBOARD',
    ]);
  });
});
