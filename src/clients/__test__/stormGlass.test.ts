import { StormGlass } from '@src/clients/stormGlass'
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json'
import stormGlassNormalizedWeather3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json'
import * as HTTP from '@src/http'



jest.mock('../../http/request')

describe('Stormglass client', () => {

  const MockedRequestClass = HTTP.Request as jest.Mocked<typeof HTTP.Request>
  const mockedRequest = new HTTP.Request() as jest.Mocked<HTTP.Request>
  it('should return the normnalized forecast from the StormGlass service', async () => {
    const lat = -33.799393;
    const lng = 151.799393;

    mockedRequest.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture } as HTTP.Response)

    const stormGlass = new StormGlass(mockedRequest)
    const response = await stormGlass.fetchPoints(lat, lng)
    expect(response).toEqual(stormGlassNormalizedWeather3HoursFixture)
  })

  it('should exclude incomplete data points', async () => {
    const lat = -33.799393;
    const lng = 151.799393;

    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300
          },
          time: '2020-04-26T00:00:00+00:00'
        }
      ]
    }
    mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTP.Response)

    const stormGlass = new StormGlass(mockedRequest)
    const response = await stormGlass.fetchPoints(lat, lng)
    expect(response).toEqual([])

  })

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.799393;
    const lng = 151.799393;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' })

    const stormGlass = new StormGlass(mockedRequest)

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass:Network Error'
    )

  })

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    MockedRequestClass.isRequestError.mockReturnValue(true)
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
})