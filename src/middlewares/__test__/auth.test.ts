import AuthService from '@src/services/auth';
import { authMiddleware } from '@src/middlewares/auth';
describe('AuthMiddleware', () => {
  it('Should verify a JWT token call the next middleware', () => {
    const jwtToken = AuthService.generateToken({ id: 'some-fake-id', name: 'some-fake-name' })
    const fakeReq = {
      headers: {
        'authorization': jwtToken
      }
    }
    const fakeRes = {};
    const fakeNext = jest.fn();//stub
    authMiddleware(fakeReq, fakeRes, fakeNext);
    expect(fakeNext).toHaveBeenCalled()

  })

  it('should return UNAUTHORIZED if there is a problem on the token verification', () => {
    const reqFake = {
      headers: {
        'authorization': 'invalid token',
      },
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    // eslint-disable-next-line @typescript-eslint/ban-types
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });

  it('should return ANAUTHORIZED middleware if theres no token', () => {
    const reqFake = {
      headers: {},
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    // eslint-disable-next-line @typescript-eslint/ban-types
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt must be provided',
    });
  });
})