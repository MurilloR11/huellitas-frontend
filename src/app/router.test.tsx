import { router } from './router';

describe('app router', () => {
  it('defines all critical application paths', () => {
    const paths = (router.routes ?? []).map((route) => route.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/pets',
        '/pets/:id',
        '/foundations',
        '/foundations/:id',
        '/explore',
        '/adopt',
        '/my-adoptions',
        '/adoptions/:id',
        '/login',
        '/register',
        '/foundation/dashboard',
        '/admin',
        '/developer/dashboard',
        '/account',
        '/notifications',
        '*',
      ]),
    );
  });
});
