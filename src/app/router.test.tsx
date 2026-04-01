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
        '/adopt/:petId',
        '/my-adoptions',
        '/login',
        '/register',
        '/foundation/dashboard',
        '*',
      ]),
    );
  });
});
