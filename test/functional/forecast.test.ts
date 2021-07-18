import nock from 'nock';
import { Beach, BeachPosition } from '@src/models/beach';
import stormGlassWeather3HoursFixture from '../fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '../fixtures/api_forecast_response_1_beach.json';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beach forecast functional tests', () => {
  let token: string;
  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({})
    const defaultUser = {
      name: 'John Doe',
      email: 'john@mail.com',
      password: '1234',
    }
    const { id, name } = await new User(defaultUser).save()
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
      user: id
    };

    const beach = new Beach(defaultBeach);
    token = AuthService.generateToken({ id, name })
    await beach.save();
  })



  it('should return a forecast with just a few times', async () => {
    //nock.recorder.rec();
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
      })
      .reply(200, stormGlassWeather3HoursFixture);
    const { body, status } = await global
      .testRequest
      .get('/forecast')
      .set({ 'authorization': token })
    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });
  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v1/weather/point')
      .query({ lat: '-33.792726', lng: '151.289824' })
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest
      .get(`/forecast`)
      .set({ 'authorization': token })

    expect(status).toBe(500);
  });
});
